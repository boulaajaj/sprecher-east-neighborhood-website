/**
 * One bare address (no display name, list or whitespace). Deliberately simple: it rejects
 * lists and header tricks (CR/LF); the mail server does the real validation.
 */
export const isSingleAddress = (value: string): boolean =>
  /^[^\s@,;<>"()]+@[^\s@,;<>"()]+\.[^\s@,;<>"()]+$/.test(value)
