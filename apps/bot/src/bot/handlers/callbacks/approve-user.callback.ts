import { pl } from "@/bot/helpers/parse-locale";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryApproveUserRequestProps
	extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Handle an "approve user" callback: verify the applicant, update the admin message, notify the applicant, and remove prior requests.
 *
 * Validates the callback payload for an applicant ID; if valid, verifies the user via the provided UserRepository, clears the callback markup and appends an "Accepted" indicator to the admin message, sends a localized acceptance message to the applicant with their keyboard, and removes any previous requests for that applicant. On error, sends a generic failure message and logs the error.
 *
 * @param props - Handler dependencies and context. Expects:
 *   - ctx: callback context containing `queryPayload`, message editing/sending methods, and localization (`t`).
 *   - userRepo: repository exposing `VerifyUser(BigInt)` to mark the applicant as verified.
 *   - bot: bot utilities including `GetKeyboard`, `notify`, `removePreviousRequests`, and `logger`.
 */
export async function CallbackQueryApproveUserRequest(
	props: CallbackQueryApproveUserRequestProps
) {
	const t = props.ctx.t;

	if (!props.ctx.queryPayload || typeof props.ctx.queryPayload !== "string") {
		await props.ctx.send(t(pl(props.ctx), "idIsNotValid"));
		return;
	}
	const applicantId = props.ctx.queryPayload.split(":")[1];
	if (!applicantId) {
		await props.ctx.send(t(pl(props.ctx), "idIsNotValid"));
		return;
	}

	try {
		await props.ctx.editReplyMarkup(undefined);

		await props.userRepo.VerifyUser(BigInt(applicantId));

		// await props.ctx.send(t(pl(props.ctx), "requestAcceptedTextForAdmin"));

		const kbd = await props.bot.GetKeyboard(BigInt(applicantId));
		props.ctx.editText(`${props.ctx.message?.text}\n✅ Accepted`);
		await props.bot.notify(
			[BigInt(applicantId)],
			t(pl(props.ctx), "requestAcceptedTextForUser"),
			{
				reply_markup: kbd,
			}
		);
		props.bot.removePreviousRequests(BigInt(applicantId));
	} catch (e) {
		await props.ctx.send(t(pl(props.ctx), "smthWentWrong"));
		props.bot.logger.error(e);
	}
}
