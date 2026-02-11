import { renderUsersPage } from "@/bot/render/users-render";
import type { UserRepository } from "@/repository/user.repository";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandleStudentsProps extends MessageHandlerProps {
	userRepo: UserRepository;
	page?: number;
}

export const handleStudents = async (
	props: HandleStudentsProps
): Promise<void> => {
	const users = await props.userRepo.GetUsers();
	if (!props.page) {
		props.page = 0;
	}

	const { text, reply_markup } = renderUsersPage({
		users,
		page: 0,
	});

	await props.ctx.send(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
};
