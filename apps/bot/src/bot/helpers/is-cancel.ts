import { KEYBOARD_ANSWERS } from "../keyboards";
import type { GramioMessageContext } from "../types/bot.types";

export const isCancel = (ctx: GramioMessageContext): boolean => {
	return ctx.text == KEYBOARD_ANSWERS.cancel;
};
