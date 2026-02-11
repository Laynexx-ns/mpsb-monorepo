import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		REDIS_URL: z.string().min(4),
		YANDEX_API_TOKEN: z.string().min(10),
		TELEGRAM_BOT_TOKEN: z.string().min(10),
		SERVER_PORT: z.coerce.number(),

		BASE_URL: z.string(),

		CORS: z.string(),

		JWT_SECRET: z.string().min(20),

		POSTGRES_USER: z.string(),
		POSTGRES_PASSWORD: z.string(),
		POSTGRES_DB: z.string(),
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
});
