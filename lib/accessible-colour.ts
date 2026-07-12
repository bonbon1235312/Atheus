import "server-only";

const DARK_ON_COLOUR = "#000000" as const;
const LIGHT_ON_COLOUR = "#FFFFFF" as const;

function rgbChannels(hexColour: string): [number, number, number] {
  const value = hexColour.trim().replace(/^#/, "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((channel) => `${channel}${channel}`)
          .join("")
      : value;

  if (!/^[0-9a-f]{6}$/i.test(normalized)) {
    throw new TypeError(`Expected a hexadecimal colour, received "${hexColour}".`);
  }

  return [0, 2, 4].map((offset) =>
    Number.parseInt(normalized.slice(offset, offset + 2), 16),
  ) as [number, number, number];
}

function relativeLuminance(hexColour: string) {
  const [red, green, blue] = rgbChannels(hexColour).map((channel) => {
    const srgb = channel / 255;
    return srgb <= 0.04045
      ? srgb / 12.92
      : ((srgb + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function getWcagOnColour(
  backgroundColour: string,
): typeof DARK_ON_COLOUR | typeof LIGHT_ON_COLOUR {
  const luminance = relativeLuminance(backgroundColour);
  const darkContrast = (luminance + 0.05) / 0.05;
  const lightContrast = 1.05 / (luminance + 0.05);

  return darkContrast >= lightContrast ? DARK_ON_COLOUR : LIGHT_ON_COLOUR;
}
