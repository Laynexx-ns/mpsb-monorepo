import type { User } from "@mpsb-monorepo/db/generated";

export const buildUserFullname = (user: User): string =>
	`${user.last_name} ${user.name} ${user.patronymic}`;
