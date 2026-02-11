import type { Storage } from "@gramio/storage";
import { redisStorage } from "@gramio/storage-redis";
import Redis from "ioredis";

export class BotStorage implements Storage {
	private redis: Redis;
	private storage: ReturnType<typeof redisStorage>;

	constructor(host: string) {
		this.redis = new Redis(host, {
			lazyConnect: true,
		});

		this.storage = redisStorage(this.redis);
	}

	instance() {
		return this.storage;
	}

	async connect() {
		try {
			await this.redis.connect();
			await this.redis.ping();
		} catch (e) {
			throw new Error("Redis connection failed", { cause: e });
		}
	}

	async disconnect() {
		await this.redis.quit();
	}

	async get(key: string) {
		return this.storage.get(key);
	}

	async set(key: string, value: string) {
		return this.storage.set(key, value);
	}

	async delete(key: string) {
		return this.storage.delete(key);
	}

	async has(key: string) {
		return this.storage.has(key);
	}
}
