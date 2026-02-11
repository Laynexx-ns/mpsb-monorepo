/**
 * Small helper to normalize logging of contexts and states.
 * We keep it compact to avoid leaking too much infra-sensitive data,
 * but enough to reproduce user actions.
 */
export function formatCtxForLog(ctx: any) {
	try {
		return {
			ctx: {
				fromId: ctx?.from?.id ?? null,
				username: ctx?.from?.username ?? null,
				accessRole: ctx?.access?.role ?? null,
				text: ctx?.text ?? null,
				state: ctx?.state ?? null,
				callbackQuery: ctx?.callbackQuery?.data ?? null,
			},
		};
	} catch {
		return { fromId: null };
	}
}

export function formatFullState(ctx?: any, state?: any) {
	return {
		ctx: formatCtxForLog(ctx)?.ctx ?? null,
		appstate: state ?? null,
	};
}
