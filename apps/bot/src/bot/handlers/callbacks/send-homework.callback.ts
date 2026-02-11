import type { GramioBot } from "@/bot/bot.factory";
import { extractUserId } from "@/bot/helpers/extract-user-id";
import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { extractItemFromQuery } from "@/bot/render/paginator";
import type { AppState } from "@/bot/state/state.types";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { CallbackQueryProps } from "./callback.types";
import * as jwt from "@mpsb-monorepo/jwt-types";
import type { UserRepository } from "@/repository/user.repository";
import { formatCtxForLog, formatFullState } from "@/utils/log-formatter";
import { format, link } from "gramio";
import { buildUserFullname } from "@/bot/helpers/build-user-fullname";
import { resetState } from "@/bot/helpers/reset-state";
import { stat } from "node:fs/promises";

export interface CallbackQueryOpenHomeworkProps extends CallbackQueryProps {}

export interface CallbackQuerySendHomeworkProps extends CallbackQueryProps {
  bot: GramioBot;
  homeworkRepo: HomeworkRepository;
  userRepo: UserRepository;
}

/**
 * Initiates the "send homework" flow in response to a callback query.
 *
 * Validates the homework identifier from the callback, prevents modification if the homework is already graded, sets the user's bot state to the `sendHomework` → `readHomework` step with related data, and prompts the user to send the homework as a PDF with a cancel keyboard.
 *
 * @param props - Callback query handling props including the context, bot instance, and homework repository
 */
export async function CallbackQuerySendHomework(
  props: CallbackQuerySendHomeworkProps,
) {
  const userId = extractUserId(props.ctx);
  const stringHomeworkId = extractItemFromQuery(props.ctx, 1);
  const homeworkName = extractItemFromQuery(props.ctx, 2);
  const completed = extractItemFromQuery(props.ctx, 3);

  if (!stringHomeworkId || Number.isNaN(Number.parseInt(stringHomeworkId))) {
    props.bot.logger.error({
      err: "invalid token payload",
      state: formatCtxForLog(props.ctx),
    });
    await props.ctx.send("Invalid token payload");
    return;
  }

  const homeworkId = parseInt(stringHomeworkId);

  const homework = await props.homeworkRepo
    .GetHomework(homeworkId)
    .catch(async (e) => {
      props.bot.logger.error(
        { err: e, state: formatCtxForLog(props.ctx) },
        "failed to get homework",
      );
      await props.ctx.send("failed to get homework");
    });

  if (!homework) return;

  const state: AppState = {
    currentFlow: "sendHomework",
    step: "readHomework",
    data: {
      homeworkId: stringHomeworkId,
      homeworkName,
      homeworkCompleted: !!completed,
      groupId: props.ctx.access.user?.studyGroupId,
    },
  };

  const checked = await props.homeworkRepo.CheckChecked(
    Number.parseInt(stringHomeworkId),
    userId,
  );

  if (checked) {
    await props.ctx.send(
      "👀 Оцененное домашнее задание не может быть удалено или изменено",
    );
    return;
  }

  const groups = await props.userRepo.GetUserGroups(userId);
  const group = groups.find((g) => g.id === homework?.studyGroupId);

  props.bot.logger.info({ groups, group, homework }, "GROUPS");

  if (!group) {
    props.bot.logger.error({
      state: formatCtxForLog(props.ctx),
      err: "group not found",
    });
    await props.ctx.send("Group not found");
    return;
  }

  try {
    const now = Math.floor(Date.now() / 1000);

    const token = jwt.generate({
      groupTitle: group.title,
      homeworkName: homework.name,
      homeworkId,
      userId: userId.toString(),
      userName: buildUserFullname(props.ctx.access.user),
      iat: now,
      exp: now + 60 * 5, // 5 min,
    });

    await props.ctx.send(
      format`→ Загрузите PDF файл для домашнего задания по ${link("ссылке", `https://d70a-5-104-75-74.ngrok-free.app/?token=${token}`)} в течении 5 минут`,
    );
  } catch (e) {
    props.bot.logger.error(
      { err: e, state: formatFullState(props.ctx) },
      "failed to generate token or send link",
    );
    await props.ctx.send("something went wrong");
  }
  resetState(state);
  await props.bot.setState(userId, state);
}
