import { type Logger, type LoggerExtras, type LoggerOptions, pino } from "pino";
import { processEnv } from "../env";
import { loggerConfigs } from "./config";
import { ENVIRONMENTS } from "./constant";

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

	initialize(options?: LoggerOptions): Logger {
		if (this.#logger) {
			return this.#logger;
		}

		const env = processEnv({
			env: process.env.NODE_ENV,
			struct: ENVIRONMENTS,
			default: "DEVELOPMENT",
		});
		const baseConfig = loggerConfigs[env];

		try {
			this.#logger = pino({
				...baseConfig,
				...options,
			});

			this.#logger.info(
				{
					env,
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
