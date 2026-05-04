export const parseList = (value: string | null | undefined): string[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

export const toList = (value: unknown): string => {
  if (Array.isArray(value)) {
    return JSON.stringify(value.map(String).filter(Boolean));
  }

  if (typeof value === 'string') {
    return JSON.stringify(
      value
        .split(/[,\n，、]/)
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  return '[]';
};

export const ageFromBirthYear = (birthYear: number) =>
  new Date().getFullYear() - birthYear;
