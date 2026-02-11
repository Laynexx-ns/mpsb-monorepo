import "gramio";
import type { FormattableString } from "gramio";
import type { BotLocales } from "@/core/i18n/locales";

declare module "@gramio/i18n" {
	interface I18nMiddleware {
		buildT(
			language?: string
		): <K extends keyof BotLocales>(
			key: K,
			...args: BotLocales[K] extends (...a: infer A) => any ? A : []
		) => BotLocales[K] extends (...a: any) => infer R ? R : FormattableString;
	}
}
