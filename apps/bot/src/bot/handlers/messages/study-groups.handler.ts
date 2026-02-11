import { renderStudyGroupsPage } from "@/bot/render/study-groups-render";
import type { UserRepository } from "@/repository/user.repository";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandleStudyGroupProps extends MessageHandlerProps {
	userRepo: UserRepository;
	page?: number;
}

export const HandleStudyGroup = async (
	props: HandleStudyGroupProps
): Promise<void> => {
	const groups = await props.userRepo.GetStudyGroups();
	if (!props.page) {
		props.page = 0;
	}

	const { text, reply_markup } = renderStudyGroupsPage({
		groups,
		page: 0,
	});

	await props.ctx.send(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
};
