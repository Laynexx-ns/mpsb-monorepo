import type { Role } from "@/prisma/enums";
import type { GramioMessageContext } from "../types/bot.types";

export const requireRole = (ctx: GramioMessageContext, role: Role): boolean =>
	ctx.access.role == role;

export const REQUIRE_ACCEPTED = (ctx: GramioMessageContext): boolean =>
	!(ctx.access.role == "GUEST");

export const REQUIRE_ADMIN = (ctx: GramioMessageContext): boolean =>
	ctx.access.role == "ADMIN";
