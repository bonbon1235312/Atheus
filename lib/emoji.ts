export function emojiInputToKey(input: string): string {
  const trimmed = input.trim();
  const customEmoji = trimmed.match(/^<a?:([a-zA-Z0-9_]+):(\d+)>$/);

  if (customEmoji) {
    return `${customEmoji[1]}:${customEmoji[2]}`;
  }

  return trimmed;
}
