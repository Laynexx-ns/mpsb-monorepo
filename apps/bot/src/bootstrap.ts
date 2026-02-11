import { LoggerFactory, loggerConfigs } from "@mpsb-monorepo/logger";
import pino from "pino";
import { CreateBot, GramioBot, type GramioBotProps } from "@/bot/bot.factory";
import { BotStorage } from "@/bot/storage/redis.storage";
import { createI18n } from "@/core/i18n/i18n";
import { HomeworkRepository } from "@/repository/homework.repository";
import { UserRepository } from "@/repository/user.repository";
import type { PrismaClient } from "@mpsb-monorepo/db/generated";
import { env } from "@mpsb-monorepo/env/server";

const WORKER_URL = "src/bot/workers/deadline-notifier.worker.ts";

export async function bootstrap(prisma: PrismaClient): Promise<GramioBot> {
  const logger = LoggerFactory.instance().initialize({
    ...loggerConfigs.development,
    serializers: {
      err: pino.stdSerializers.err,
    },
  });

  const storage = new BotStorage(env.REDIS_URL);

  try {
    await storage.connect();

    logger.info("Redis connected");
  } catch (e) {
    logger.fatal({ err: e }, "Redis connection failed");
    process.exit(1);
  }

  const i18n = createI18n();

  const props: GramioBotProps = {
    homeworkRepo: new HomeworkRepository(prisma),
    userRepo: new UserRepository(prisma),
    storage,
    i18n,
    token: env.TELEGRAM_BOT_TOKEN,
    logger,
  };

  const worker = new Worker(new URL(WORKER_URL, import.meta.url));
  worker.onerror = (e) => {
    const childLogger = logger.child({
      environment: "notification-worker",
    });

    childLogger.fatal({ err: e }, "worker error");
  };

  const bot = await CreateBot(props);
  return bot;
}
