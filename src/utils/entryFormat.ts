/** Three digits, as printed after the "№": 7 -> "007". */
export function formatEntryNumber(n: number): string {
  return String(n).padStart(3, '0');
}
