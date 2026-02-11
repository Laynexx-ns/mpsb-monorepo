import path from "node:path";
import type { Environment } from "./constant";

export type DefaultConfig = Record<Environment, any>;
export const loggerConfigs: DefaultConfig = {
	staging: null,
	development: {
		transport: {
			targets: [
				{
					target: "pino-pretty",
					level: "debug",
					options: {
						colorize: true,
						levelFirst: true,
						translateTime: "SYS:standart",
					},
				},
			],
			level: "debug",
		},
	},
	production: {
		transport: {
			targets: [
				{
					target: "pino/file",
					level: "info",
					options: {
						destination: path.join(__dirname, "../../../logs/app.log"),
						mkdir: true,
						sync: false,
					},
				},
			],
		},
		level: "info",
		timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
		messageKey: "message",
		base: {
			env: process.env.NODE_ENV,
			version: process.env.bun_version,
		},
	},
};
