import { renderUsersPage } from "@/bot/render/users-render";
import type { UserRepository } from "@/repository/user.repository";
import type { CallbackQueryProps } from "./callback.types";

export interface CallbackQueryUsersRenderProps extends CallbackQueryProps {
	userRepo: UserRepository;
}

/**
 * Handle a callback query to render a users list page and update the original message.
 *
 * Validates the page index extracted from the callback data; if missing, sends an error message and logs the failure. When a valid page is present, fetches users, renders the specified page, and edits the message text and inline reply markup with the rendered result.
 *
 * @param props - Handler context containing the callback context, bot utilities, and a UserRepository used to fetch users and perform the message update
 */
export async function CallbackQueryUsersRender(
	props: CallbackQueryUsersRenderProps
) {
	const page = props.ctx.queryData.toString().split(":")[1];
	if (!page) {
		await props.ctx.send("something went wrong");
		props.bot.logger.error("can't change page");
		return;
	}

	try {
		const users = await props.userRepo.GetUsers();

		const { text, reply_markup } = renderUsersPage({
			page: Number.parseInt(page),
			users,
		});

		await props.ctx.editText(text, {
			reply_markup,
		});
	} catch (e) {
		props.bot.logger.error(e);
	}
}
