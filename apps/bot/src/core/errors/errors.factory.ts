import { ConfigError, DefaultError, TelegramError } from "./errors.types";

export const Errors = {
	Telegram: {
		Connection: (details: unknown) =>
			new TelegramError("Telegram connection error", details),
	},

	Config: {
		MissingEnv: (name: string, details: unknown) =>
			new ConfigError(`Missing env: ${name}`, details),
	},

	New(message: string, details?: unknown, status?: string | number) {
		return new DefaultError(message, status, details);
	},
};
