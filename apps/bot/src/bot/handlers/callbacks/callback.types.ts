import { RENDER_CALLBACKS } from "@/bot/render/render.types";
import type { GramioCallbackQueryContext } from "../../types/bot.types";
import type { HandlerProps } from "../handlers.types";

export interface CallbackQueryProps extends HandlerProps {
	ctx: GramioCallbackQueryContext;
}

export type CallbackQueryFunc = (props: CallbackQueryProps) => void;

export const CALLBACKS = {
	renderCallbacks: RENDER_CALLBACKS,
} as const;
