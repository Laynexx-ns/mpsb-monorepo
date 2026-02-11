import type { AccessContext } from "@/bot/access";
import "gramio";

declare module "gramio" {
	interface Context {
		access: AccessContext;
	}
}
