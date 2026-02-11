import { bootstrap } from "@/bootstrap";
import prisma from "@mpsb-monorepo/db";

const bot = await bootstrap(prisma);

try {
  bot.start();
} catch (e) {
  console.error({ err: e }, "Failed to start bot");
}
