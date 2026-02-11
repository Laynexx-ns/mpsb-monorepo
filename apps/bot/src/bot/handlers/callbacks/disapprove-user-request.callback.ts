import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryDisapproveUserRequestProps
	extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Handle a callback that disapproves an applicant's request and notifies both the moderator and the applicant.
 *
 * Validates the callback payload to extract the applicant ID, clears the inline keyboard, attempts to remove the applicant record,
 * notifies the moderator that the request was declined, and sends a refusal message to the applicant. If deletion fails the error
 * is logged and processing continues. On unexpected errors the handler sends a generic failure message and logs the error.
 *
 * @param props - Callback properties containing `ctx` (callback context and messaging helpers), `bot` (logger and bot instance),
 *                and `userRepo` (repository used to delete the applicant)
 */
export async function CallbackQueryDisapproveUserRequest(
	props: CallbackQueryDisapproveUserRequestProps
) {
	if (!props.ctx.queryPayload || typeof props.ctx.queryPayload !== "string") {
		await props.ctx.send("🛠️ Айди пользователя невалидно, бейте разраба");
		return;
	}
	const applicantId = props.ctx.queryPayload.split(":")[1];
	if (!applicantId) {
		await props.ctx.send("🛠️ Айди пользователя невалидно, бейте разраба");
		return;
	}

	try {
		await props.ctx.editReplyMarkup(undefined);

		await props.userRepo.DeleteUser(BigInt(applicantId)).catch((e) => {
			props.bot.logger.error(e);
		});
		await props.ctx.send("🚫 Заявка пользователя отклонена");
		await props.bot.botInst.api.sendMessage({
			chat_id: applicantId.toString(),
			text: "🚫 Увы, преподаватель отклонил вашу заявку. Вы можете отправить новую",
		});
	} catch (e) {
		await props.ctx.send("Something went wrong");
		props.bot.logger.error(e);
	}
}
