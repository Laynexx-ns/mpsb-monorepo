// TODO: implement it later

import { extractUserId } from "@/bot/helpers/extract-user-id";
import { renderRequestsPage } from "@/bot/render/requests-render";
import type { UserRepository } from "@/repository/user.repository";
import type { MessageHandlerProps } from "./messages-handlers.types";

export interface HandlerRequestsProps extends MessageHandlerProps {
	userRepo: UserRepository;
}

export const handleRequests = async (
	props: HandlerRequestsProps
): Promise<void> => {
	const userId = extractUserId(props.ctx);
	const requestsUsers = await props.userRepo.GetUsersFromPendingRequests();

	const { text, reply_markup } = renderRequestsPage({
		page: 0,
		users: requestsUsers,
		pageSize: 5,
	});

	await props.ctx.send(text, {
		reply_markup,
		parse_mode: "Markdown",
	});
};
