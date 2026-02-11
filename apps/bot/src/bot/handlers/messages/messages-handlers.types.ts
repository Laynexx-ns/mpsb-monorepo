import type {
	GramioCallbackQueryContext,
	GramioMessageContext,
} from "@/bot/types/bot.types";
import type { HandlerProps } from "../handlers.types";

export interface MessageHandlerProps extends HandlerProps {
	ctx: GramioMessageContext | GramioCallbackQueryContext;
}
