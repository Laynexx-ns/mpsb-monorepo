/**
 * Parse a deadline string in "dd.mm.yyyy" format, optionally followed by " HH:MM", into a Date object.
 *
 * @param input - The deadline string to parse. Accepted formats: "dd.mm.yyyy" or "dd.mm.yyyy HH:MM" (day and month are two digits, year is four digits, hours and minutes are two digits when present).
 * @returns The `Date` constructed from the parsed components, or `null` if the input doesn't match the format or represents an invalid date/time.
 */
export function parseDeadline(input: string): Date | null {
	const regex = /^(\d{2})\.(\d{2})\.(\d{4})(?:\s+(\d{2}):(\d{2}))?$/;

	const match = input.match(regex);
	if (!match) return null;

	const [, dd, mm, yyyy, hh = "00", min = "00"] = match;

	const day = Number(dd);
	const month = Number(mm) - 1;
	const year = Number(yyyy);
	const hour = Number(hh);
	const minute = Number(min);

	const date = new Date(year, month, day, hour, minute);

	if (
		date.getFullYear() !== year ||
		date.getMonth() !== month ||
		date.getDate() !== day ||
		date.getHours() !== hour ||
		date.getMinutes() !== minute
	) {
		return null;
	}

	return date;
}
