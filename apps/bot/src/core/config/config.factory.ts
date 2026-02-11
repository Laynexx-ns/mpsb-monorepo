import { promises as fsp } from "fs";
import { parse as parseYaml } from "yaml";
import { logger } from "@/core/logger";

export type ProjectConfig = {
	readonly TELEGRAM_BOT_TOKEN: string;
	readonly DATABASE_URL: string;
	readonly SERVER_PORT: number;
	readonly REDIS_HOST: string;
	readonly ADMIN_ID: bigint;
};

export enum ConfigurationFilePaths {
	PROD = "config/config.yml",
	TEST = "config/config.test.yml",
}

/**
 * Loads and parses the project configuration YAML from the specified file path.
 *
 * @param path - Which configuration file to read; use `ConfigurationFilePaths.PROD` for production config or `ConfigurationFilePaths.TEST` for test config
 * @returns The parsed `ProjectConfig` object, or `undefined` if reading or parsing fails
 */
async function ReadProjectConfig(path: ConfigurationFilePaths) {
	try {
		const config = parseYaml(
			await fsp.readFile(path, {
				encoding: "utf-8",
			})
		) as ProjectConfig;
		return config;
	} catch (e) {
		logger.error(e);
	}
}

export default ReadProjectConfig;
