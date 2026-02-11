import type { defineI18n } from "@gramio/i18n";
import type {
	Bot,
	CallbackQueryShorthandContext,
	MessageContext,
} from "gramio";
import type { Logger } from "pino";
import type { DerivedI18n } from "@/core/i18n/i18n";
import type { AccessContext } from "../access";

export interface I18nMiddleware {
	middleware?: any;
	buildT(arg: string | undefined): void;
	t?: any;
}

export type I18nT = ReturnType<typeof defineI18n>["t"];
export interface TelegramBotProps {
	token: string;
	i18n: I18nT;
	logger: Logger;
}

// For calling callback queies separated from bot.factory.ts
export interface GramioCallbackQueryContext
	extends CallbackQueryShorthandContext<Bot, any> {
	t: DerivedI18n;
}

// For calling message handlers separated from bot.factory.ts
export interface GramioMessageContext extends MessageContext<Bot> {
	t: DerivedI18n;
	access: AccessContext;
}

export abstract class TelegramBot {
	protected readonly TELEGRAM_TOKEN: string;
	protected bot!: Bot;
	protected i18n: I18nT;
	public logger: Logger;

	constructor(props: TelegramBotProps) {
		this.TELEGRAM_TOKEN = props.token;
		this.i18n = props.i18n;
		this.logger = props.logger;
	}

	abstract init(): Promise<void>;

	start(): void {
		this.bot
			.start()
			.then(() => {
				this.logger.info("bot started successfully");
			})
			.catch((e) => {
				this.logger.error("failed to start bot", e);
			});
	}

	get instance(): Bot {
		return this.bot;
	}
}
