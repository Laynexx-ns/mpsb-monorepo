import { type Logger, type LoggerExtras, type LoggerOptions, pino } from "pino";
import { pinoCaller } from 'pino-caller'

export class LoggerFactory {
	static #instance: LoggerFactory | null = null;
	#logger?: Logger;

	private constructor() {}

	static instance(): LoggerFactory {
		if (!LoggerFactory.#instance) {
			LoggerFactory.#instance = new LoggerFactory();
		}
		return LoggerFactory.#instance;
	}

	initialize(config: LoggerOptions, options?: LoggerOptions): Logger {
		if (this.#logger) {
			return this.#logger;
		}

    try {

			this.#logger = pinoCaller(pino({
				...config,
				...options,
			}));

			this.#logger.info(
				{
					nodeVersion: process.version,
					pid: process.pid,
				},
				"Logger initialized succesfully"
			);
		} catch (e) {
			console.error("Error initializing logger:", e);
			this.#logger = pino({
				level: "info",
				timestamp: true,
			});
		}

		return this.#logger;
	}

	get(): Logger {
		if (!this.#logger) {
			throw new Error("logger not initialized");
		}
		return this.#logger;
	}

	createChildLogger(bindings: LoggerExtras) {
		return this.get().child(bindings);
	}
}
