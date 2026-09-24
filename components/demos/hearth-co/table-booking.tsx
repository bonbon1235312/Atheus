"use client";

import { FormEvent, useMemo, useState } from "react";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["08:00", "09:00", "10:00", "11:30", "13:00", "14:30"];
const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function monthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month, 1));
}

function buildCells(year: number, month: number) {
  const first = new Date(year, month, 1);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < offset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }
  return cells;
}

export function TableBooking() {
  const today = startOfDay(new Date());
  const last = new Date(today);
  last.setDate(last.getDate() + 60);

  const [cursor, setCursor] = useState(() => ({
    year: today.getFullYear(),
    month: today.getMonth(),
  }));
  const [selected, setSelected] = useState<string | null>(null);
  const [party, setParty] = useState(2);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [done, setDone] = useState(false);

  const cells = useMemo(
    () => buildCells(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const selectedDate = selected
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date(`${selected}T12:00:00`))
    : null;

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const next = new Date(current.year, current.month + delta, 1);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Enter a name for the booking.";
    if (!isEmail(email.trim())) nextErrors.email = "Enter a valid email.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setDone(true);
  }

  if (done && selectedDate && slot) {
    return (
      <div className="hc-book-done" role="status">
        <h3>Table held</h3>
        <p>
          {selectedDate} at {slot} for {party}. We will confirm to {email.trim()}.
        </p>
        <button
          className="hc-btn"
          type="button"
          onClick={() => {
            setDone(false);
            setSelected(null);
            setSlot(null);
            setParty(2);
            setName("");
            setEmail("");
            setErrors({});
          }}
        >
          Book another table
        </button>
      </div>
    );
  }

  return (
    <form className="hc-book" onSubmit={onSubmit} noValidate>
      <div className="hc-cal">
        <div className="hc-cal-head">
          <button type="button" onClick={() => shiftMonth(-1)} aria-label="Previous month">
            Prev
          </button>
          <h3>{monthLabel(cursor.year, cursor.month)}</h3>
          <button type="button" onClick={() => shiftMonth(1)} aria-label="Next month">
            Next
          </button>
        </div>
        <div className="hc-cal-week">
          {WEEKDAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="hc-cal-grid">
          {cells.map((cell, index) => {
            if (!cell) {
              return <span key={`empty-${index}`} />;
            }
            const key = dateKey(cell);
            const tooSoon = startOfDay(cell) < today;
            const tooLate = startOfDay(cell) > last;
            const disabled = tooSoon || tooLate;
            return (
              <button
                key={key}
                type="button"
                disabled={disabled}
                aria-pressed={selected === key}
                className={selected === key ? "is-selected" : undefined}
                onClick={() => {
                  setSelected(key);
                  setSlot(null);
                }}
                aria-label={cell.toLocaleDateString("en-GB", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              >
                {cell.getDate()}
              </button>
            );
          })}
        </div>
      </div>

      <div className="hc-book-side">
        <fieldset>
          <legend>Party size</legend>
          <div className="hc-party">
            {PARTY_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                aria-pressed={party === size}
                className={party === size ? "is-selected" : undefined}
                onClick={() => setParty(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Time</legend>
          <div className="hc-slots">
            {SLOTS.map((time) => (
              <button
                key={time}
                type="button"
                disabled={!selected}
                aria-pressed={slot === time}
                className={slot === time ? "is-selected" : undefined}
                onClick={() => setSlot(time)}
              >
                {time}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="hc-book-fields">
          <legend>Your details</legend>
          <div className="hc-field">
            <label htmlFor="hc-name">Name</label>
            <input
              id="hc-name"
              name="name"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            {errors.name ? <p className="hc-error">{errors.name}</p> : null}
          </div>
          <div className="hc-field">
            <label htmlFor="hc-email">Email</label>
            <input
              id="hc-email"
              name="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {errors.email ? <p className="hc-error">{errors.email}</p> : null}
          </div>
        </fieldset>

        <button className="hc-btn" type="submit" disabled={!selected || !slot}>
          Hold this table
        </button>
      </div>
    </form>
  );
}
