import type { PrismaClient } from "@mpsb-monorepo/db/generated";

export abstract class Repository {
	protected prisma: PrismaClient;

	constructor(prisma: PrismaClient) {
		this.prisma = prisma;
	}
}
