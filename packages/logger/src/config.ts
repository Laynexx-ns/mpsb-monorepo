// export type DefaultConfig = Record<Environment, any>;÷
export const loggerConfigs = {
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
						maskHeaders: ["authorization"], // mask sensitive headers
						maskQuery: ["token"], // mask sensitive query parameters
						maskBody: ["password"], // mask sensitive body fields if POST JSON
						logRequest: true, // log only essential request info
						logResponse: true, // log only essential response info
						logPayload: false,
						// destination: path.join(__dirname, "../../../logs/app.log"),
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
