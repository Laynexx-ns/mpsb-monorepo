import { extractUserId } from "@/bot/helpers/extract-user-id";
import { renderHomeworksPage } from "@/bot/render/homeworks-render";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandleHomeworkProps extends MessageHandlerProps {
	homeworkRepo: HomeworkRepository;
	userRepo: UserRepository;
}

export const handleHomeworks = async (
	props: HandleHomeworkProps
): Promise<void> => {
	const userId = extractUserId(props.ctx);

	// Log context and state snapshot for this handler invocation
	// logContext is implemented on GramioBot and will include user/state information when available
	props.bot.logContext(props.ctx, undefined, "handleHomeworks:start");

	try {
		const userGroups = await props.userRepo.GetUserGroups(userId).catch((e) => {
			throw new Error("Failed to get user GroupsIds", { cause: e });
		});

		const homeworks = await props.homeworkRepo.GetCompletedHomeworks(
			userId,
			(userGroups ?? []).map((g) => g.id),
			props.ctx.access.user?.role
		);

		const { text, reply_markup } = renderHomeworksPage(homeworks, 0);

		await props.ctx.send(text, {
			reply_markup,
			parse_mode: "Markdown",
		});
	} catch (e) {
		// Log error with context so we can trace what happened and what state the user had
		props.bot.logger.error(
			{ err: e, userId: userId?.toString() },
			"handleHomeworks:error"
		);
		// Provide a friendly message to the user
		await props.ctx.send("Что-то пошло не так");
	}
};
