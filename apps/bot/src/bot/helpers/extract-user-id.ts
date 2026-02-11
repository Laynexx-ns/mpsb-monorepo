/**
 * Extracts the user identifier from a context object.
 *
 * @param ctx - Context that may contain a numeric `from.id` user identifier.
 * @returns The user id as a `bigint`.
 * @throws Error if `ctx.from?.id` is missing or falsy.
 */
export function extractUserId(ctx: {
	from: { id: number } | undefined;
}): bigint {
	if (!ctx.from?.id) {
		throw new Error("id is null");
	}
	return BigInt(ctx.from.id);
}
