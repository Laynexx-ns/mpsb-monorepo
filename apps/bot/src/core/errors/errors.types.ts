export type StatusType = string | number;

export abstract class AppError extends Error {
	public readonly status?: StatusType;
	public readonly details?: unknown;

	constructor(message: string, details?: unknown, status?: StatusType) {
		super(message);
		this.details = details;
		this.status = status;
	}
}

export class DefaultError extends AppError {
	constructor(message: string, status?: StatusType, details?: unknown) {
		super(message, details, status);
	}
}

export class ConfigError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, details, "CONFIG_ERROR");
	}
}

export class TelegramError extends AppError {
	constructor(message: string, details?: unknown) {
		super(message, details, "TELEGRAM_ERROR");
	}
}
