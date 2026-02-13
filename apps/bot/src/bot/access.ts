import type { Keyboard } from "gramio";
import type { User, Role } from "@mpsb-monorepo/db/generated";
import type { GramioBot } from "./bot.factory";
import { extractUserId } from "./helpers/extract-user-id";
import { getRelativeKeyboard } from "./helpers/get-relative-kbd";
import type { GramioMessageContext } from "./types/bot.types";

export interface AccessContext {
  user: User | null;
  role: Role;
  keyboard: Keyboard;
}

export interface AccessMiddlewareProps {
  ctx: GramioMessageContext;
  bot: GramioBot;
}

/**
 * Resolves the access context (user, role, and role-specific keyboard) for an incoming message.
 *
 * @param props - Object containing the message context (`ctx`) and the bot instance (`bot`) used to determine the user
 * @returns An AccessContext with the resolved `user`, the associated `role`, and the keyboard for that role; when no user is found `user` is `null` and `role` is `"GUEST"`
 */
async function accessMiddleware(
  props: AccessMiddlewareProps,
): Promise<AccessContext> {
  const userId = extractUserId(props.ctx);
  const user = await props.bot.getUser(userId);

  if (!user) {
    return {
      user: null,
      role: "GUEST",
      keyboard: getRelativeKeyboard("GUEST"),
    };
  }

  return {
    user,
    role: user.role,
    keyboard: getRelativeKeyboard(user.role),
  };
}
