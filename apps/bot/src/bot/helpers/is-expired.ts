/**
 * Determines whether a given deadline has already passed.
 *
 * @param deadline - The deadline to check; may be a `Date`, `null`, or `undefined`. A falsy value is treated as no deadline.
 * @returns `true` if the current time is after `deadline`, `false` otherwise.
 */
export function isExpired(deadline?: Date | null): boolean {
	if (!deadline) return false;
	return Date.now() > deadline.getTime();
}
