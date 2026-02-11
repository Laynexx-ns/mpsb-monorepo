import { RENDER_CALLBACKS } from "./render.types";

export interface GetPagesControlProps {
	safePage: number;
	totalPages: number;
	pageText: string;
	callbackName: string;
}

export const GetPagesControl = (props: GetPagesControlProps) => [
	{
		text: props.safePage > 0 ? "←" : " ",
		callback_data:
			props.safePage > 0
				? `${props.callbackName}:${props.safePage - 1}`
				: RENDER_CALLBACKS.EMPTY,
	},
	{
		text: props.pageText,
		callback_data: RENDER_CALLBACKS.EMPTY,
	},
	{
		text: props.safePage < props.totalPages - 1 ? "→" : " ",
		callback_data:
			props.safePage < props.totalPages - 1
				? `${props.callbackName}:${props.safePage + 1}`
				: RENDER_CALLBACKS.EMPTY,
	},
];

export const extractPageFromQuery = (ctx: {
	queryPayload: unknown;
}): number => {
	const page = ctx.queryPayload?.toString().split(":")[1];
	return Number.parseInt(page ? page : "1");
};

export const extractItemFromQuery = (
	ctx: {
		queryPayload: unknown;
	},
	index: number
): string | undefined => {
	return ctx.queryPayload?.toString().split(":")[index];
};
