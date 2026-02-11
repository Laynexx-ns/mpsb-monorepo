/**
 * Selects a locale code for the provided context.
 *
 * @param ctx - Context object that may include the sender's `languageCode` under `from`
 * @returns `'ru'` — the Russian locale code (always returned)
 */
export function pl(ctx: { from?: { languageCode?: string } }): string {
	return "ru";
}
