import prisma from "@mpsb-monorepo/db";
import { bootstrap } from "@/bootstrap";

const bot = await bootstrap(prisma);

try {
	bot.start();
} catch (e) {
	console.error({ err: e }, "Failed to start bot");
}
