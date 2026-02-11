import { renderStudyGroupsPage } from "@/bot/render/study-groups-render";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryUsersRenderProps extends CallbackQueryProps {
  userRepo: UserRepository;
}

/**
 * Handle a callback query to update the study groups view using the page index encoded in the query data.
 *
 * Reads the page index from `props.ctx.queryData` (expected format includes a colon followed by the page number). If the page index is missing, sends an error message and logs the condition. Otherwise, fetches study groups from `props.userRepo`, renders the corresponding page, and edits the original message with the rendered text and reply markup. Logs any errors encountered while processing.
 *
 * @param props - Handler props containing the callback context, bot utilities, and a `UserRepository` for retrieving study groups
 */
export async function CallbackQueryStudyGroups(
  props: CallbackQueryUsersRenderProps,
) {
  const page = props.ctx.queryData.toString().split(":")[1];
  if (!page) {
    await props.ctx.send("something went wrong");
    props.bot.logger.error("can't change page");
    return;
  }

  try {
    const groups = await props.userRepo.GetStudyGroups();

    const { text, reply_markup } = renderStudyGroupsPage({
      page: Number.parseInt(page),
      groups,
    });

    await props.ctx.editText(text, {
      reply_markup,
    });
  } catch (e) {
    props.bot.logger.error(e);
  }
}
