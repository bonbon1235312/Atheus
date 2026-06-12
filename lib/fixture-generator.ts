export type FixtureTeam = {
  id: string;
  name: string;
  abbreviation: string | null;
};

export type FixtureSlot = {
  weekday: number;
  localKickoffTime: string;
};

export type GeneratedFixture = {
  externalFixtureKey: string;
  gamedayNumber: number;
  roundLabel: string;
  kickoffAt: string;
  localDate: string;
  localTime: string;
  homeTeamId: string;
  homeTeamName: string;
  awayTeamId: string;
  awayTeamName: string;
};

export type FixturePlan = {
  planKey: string;
  timezone: string;
  meetingsPerPair: number;
  maxMatchesPerTeamPerGameDay: number;
  teamCount: number;
  fixtureCount: number;
  fixturesPerTeam: number;
  gameDayCount: number;
  firstKickoffAt: string;
  finalKickoffAt: string;
  finalLocalDate: string;
  fixtures: GeneratedFixture[];
  warnings: string[];
};

type Pairing = {
  home: FixtureTeam;
  away: FixtureTeam;
};

function dateParts(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    throw new Error("The first match date is invalid.");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error("The first match date is invalid.");
  }

  return { year, month, day };
}

function timeParts(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d)?$/.exec(value);
  if (!match) {
    throw new Error(`Kickoff time ${value} is invalid.`);
  }
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, amount: number) {
  const { year, month, day } = dateParts(value);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  return isoDate(date);
}

function weekday(value: string) {
  const { year, month, day } = dateParts(value);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function zonedParts(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: values.year,
    month: values.month,
    day: values.day,
    hour: values.hour,
    minute: values.minute,
  };
}

export function localKickoffToUtc(
  localDate: string,
  localTime: string,
  timezone: string,
) {
  const { year, month, day } = dateParts(localDate);
  const { hour, minute } = timeParts(localTime);
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let candidate = target;

  // Recalculate twice to handle offset changes around daylight-saving boundaries.
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const shown = zonedParts(new Date(candidate), timezone);
    const shownAsUtc = Date.UTC(
      shown.year,
      shown.month - 1,
      shown.day,
      shown.hour,
      shown.minute,
    );
    candidate -= shownAsUtc - target;
  }

  const verified = zonedParts(new Date(candidate), timezone);
  if (
    verified.year !== year ||
    verified.month !== month ||
    verified.day !== day ||
    verified.hour !== hour ||
    verified.minute !== minute
  ) {
    throw new Error(
      `${localDate} ${localTime} does not exist in ${timezone} because of a clock change.`,
    );
  }

  return new Date(candidate).toISOString();
}

function buildSingleMeetingRounds(teams: FixtureTeam[]) {
  const rotating: Array<FixtureTeam | null> = [...teams];
  if (rotating.length % 2 === 1) {
    rotating.push(null);
  }

  const rounds: Pairing[][] = [];
  for (let roundIndex = 0; roundIndex < rotating.length - 1; roundIndex += 1) {
    const pairings: Pairing[] = [];
    for (let index = 0; index < rotating.length / 2; index += 1) {
      const left = rotating[index];
      const right = rotating[rotating.length - 1 - index];
      if (!left || !right) {
        continue;
      }

      const reverse = index === 0 ? roundIndex % 2 === 1 : (roundIndex + index) % 2 === 1;
      pairings.push(
        reverse ? { home: right, away: left } : { home: left, away: right },
      );
    }
    rounds.push(pairings);

    const fixed = rotating[0];
    const tail = rotating.slice(1);
    tail.unshift(tail.pop() ?? null);
    rotating.splice(0, rotating.length, fixed, ...tail);
  }

  return rounds;
}

function planKey(
  competitionId: string,
  firstDate: string,
  teamIds: string[],
  meetings: number,
  matchesPerDay: number,
  timezone: string,
  slots: FixtureSlot[],
  blackoutDates: string[],
) {
  const input = [
    competitionId,
    firstDate,
    [...teamIds].sort().join(","),
    meetings,
    matchesPerDay,
    timezone,
    [...slots]
      .sort(
        (a, b) =>
          a.weekday - b.weekday ||
          a.localKickoffTime.localeCompare(b.localKickoffTime),
      )
      .map((slot) => `${slot.weekday}:${slot.localKickoffTime}`)
      .join(","),
    [...blackoutDates].sort().join(","),
  ].join("|");
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0).toString(36);
}

export function generateFixturePlan(input: {
  competitionId: string;
  teams: FixtureTeam[];
  slots: FixtureSlot[];
  firstDate: string;
  timezone: string;
  meetingsPerPair: number;
  maxMatchesPerTeamPerGameDay: number;
  blackoutDates?: string[];
  seasonEndsOn?: string | null;
}): FixturePlan {
  const teams = [...input.teams].sort((a, b) => a.name.localeCompare(b.name));
  if (teams.length < 2) {
    throw new Error("Select at least two active teams.");
  }
  if (new Set(teams.map((team) => team.id)).size !== teams.length) {
    throw new Error("A team was selected more than once.");
  }
  if (
    !Number.isInteger(input.meetingsPerPair) ||
    input.meetingsPerPair < 1 ||
    input.meetingsPerPair > 4
  ) {
    throw new Error("Meetings per pair must be between 1 and 4.");
  }
  if (
    !Number.isInteger(input.maxMatchesPerTeamPerGameDay) ||
    input.maxMatchesPerTeamPerGameDay < 1 ||
    input.maxMatchesPerTeamPerGameDay > 4
  ) {
    throw new Error("Matches per team per game day must be between 1 and 4.");
  }
  if (!input.slots.length) {
    throw new Error("The season has no active kickoff slots.");
  }

  // Validate the timezone before any schedule work.
  new Intl.DateTimeFormat("en-GB", { timeZone: input.timezone }).format();

  const slotsByWeekday = new Map<number, FixtureSlot[]>();
  for (const slot of input.slots) {
    const entries = slotsByWeekday.get(slot.weekday) ?? [];
    entries.push(slot);
    entries.sort((a, b) =>
      a.localKickoffTime.localeCompare(b.localKickoffTime),
    );
    slotsByWeekday.set(slot.weekday, entries);
  }

  const baseRounds = buildSingleMeetingRounds(teams);
  const rounds: Pairing[][] = [];
  for (let meeting = 0; meeting < input.meetingsPerPair; meeting += 1) {
    for (const baseRound of baseRounds) {
      rounds.push(
        meeting % 2 === 0
          ? baseRound
          : baseRound.map(({ home, away }) => ({ home: away, away: home })),
      );
    }
  }

  const blackouts = new Set(input.blackoutDates ?? []);
  for (const date of blackouts) {
    dateParts(date);
  }

  const key = planKey(
    input.competitionId,
    input.firstDate,
    teams.map((team) => team.id),
    input.meetingsPerPair,
    input.maxMatchesPerTeamPerGameDay,
    input.timezone,
    input.slots,
    [...blackouts],
  );
  const fixtures: GeneratedFixture[] = [];
  let roundIndex = 0;
  let gameDayNumber = 0;
  let dayOffset = 0;

  while (roundIndex < rounds.length) {
    if (dayOffset > 366 * 5) {
      throw new Error("The configured match windows cannot fit this schedule.");
    }

    const localDate = addDays(input.firstDate, dayOffset);
    dayOffset += 1;
    if (blackouts.has(localDate)) {
      continue;
    }

    const availableSlots = slotsByWeekday.get(weekday(localDate)) ?? [];
    const roundsToday = Math.min(
      input.maxMatchesPerTeamPerGameDay,
      availableSlots.length,
      rounds.length - roundIndex,
    );
    if (!roundsToday) {
      continue;
    }

    gameDayNumber += 1;
    for (let slotIndex = 0; slotIndex < roundsToday; slotIndex += 1) {
      const round = rounds[roundIndex];
      const roundNumber = roundIndex + 1;
      const localTime = availableSlots[slotIndex].localKickoffTime.slice(0, 5);
      const kickoffAt = localKickoffToUtc(
        localDate,
        localTime,
        input.timezone,
      );

      round.forEach(({ home, away }, matchIndex) => {
        fixtures.push({
          externalFixtureKey: `generator:${key}:r${roundNumber}:m${matchIndex + 1}`,
          gamedayNumber: gameDayNumber,
          roundLabel: `Gameday ${gameDayNumber}`,
          kickoffAt,
          localDate,
          localTime,
          homeTeamId: home.id,
          homeTeamName: home.name,
          awayTeamId: away.id,
          awayTeamName: away.name,
        });
      });
      roundIndex += 1;
    }
  }

  if (!fixtures.length) {
    throw new Error("No fixtures could be generated.");
  }
  if (fixtures.length > 500) {
    throw new Error("This plan exceeds the 500-fixture publishing limit.");
  }

  const warnings: string[] = [];
  const finalLocalDate = fixtures[fixtures.length - 1].localDate;
  if (input.seasonEndsOn && finalLocalDate > input.seasonEndsOn) {
    warnings.push(
      `The schedule finishes on ${finalLocalDate}, after the season end date ${input.seasonEndsOn}.`,
    );
  }
  if (
    [...slotsByWeekday.values()].some(
      (slots) => slots.length < input.maxMatchesPerTeamPerGameDay,
    )
  ) {
    warnings.push(
      "Some configured weekdays have fewer kickoff slots, so those game days contain fewer matches per team.",
    );
  }

  return {
    planKey: key,
    timezone: input.timezone,
    meetingsPerPair: input.meetingsPerPair,
    maxMatchesPerTeamPerGameDay: input.maxMatchesPerTeamPerGameDay,
    teamCount: teams.length,
    fixtureCount: fixtures.length,
    fixturesPerTeam: (teams.length - 1) * input.meetingsPerPair,
    gameDayCount: gameDayNumber,
    firstKickoffAt: fixtures[0].kickoffAt,
    finalKickoffAt: fixtures[fixtures.length - 1].kickoffAt,
    finalLocalDate,
    fixtures,
    warnings,
  };
}
