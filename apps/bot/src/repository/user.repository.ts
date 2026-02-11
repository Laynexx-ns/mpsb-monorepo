import type { Request, StudyGroup, User } from "@mpsb-monorepo/db/generated";
import type { CreateUserDTO } from "@/dto/registration.dto";
import { Repository } from "./repository.types";

export class UserRepository extends Repository {
	async GetUser(userId: bigint): Promise<User | null> {
		return await this.prisma.user.findFirst({
			where: {
				id: userId,
			},
			include: {
				StudyGroup: true,
			},
		});
	}

	async GetUserGroups(userId: bigint): Promise<StudyGroup[]> {
		return await this.prisma.studyGroup.findMany({
			where: {
				studyGroupRelations: {
					some: {
						userId,
					},
				},
			},
		});
	}

	async GetAdmins(): Promise<User[]> {
		return await this.prisma.user.findMany({
			where: {
				role: "ADMIN",
			},
		});
	}

	async GetPendingRequests(): Promise<Request[]> {
		return await this.prisma.request.findMany({
			where: {
				resolved: false,
				canceled: false,
			},
		});
	}

	async GetStudyGroups(): Promise<StudyGroup[]> {
		return this.prisma.studyGroup.findMany();
	}

	async GetStudyGroupById(id: number): Promise<StudyGroup | null> {
		return this.prisma.studyGroup.findFirst({
			where: {
				id,
			},
		});
	}

	async GetStudyGroupUsers(id: number): Promise<User[]> {
		return this.prisma.user.findMany({
			where: {
				studyGroupRelations: {
					some: {
						groupId: id,
					},
				},
			},
		});
	}

	async GetStudyGroupUserIds(id: number): Promise<bigint[]> {
		return (
			await this.prisma.user.findMany({
				where: {
					studyGroupRelations: {
						some: {
							groupId: id,
						},
					},
				},
				select: {
					id: true,
				},
			})
		).map((item) => item.id);
	}

	async FindStudyGroup(where: {
		grade?: number;
		letter?: string;
		title: string;
	}) {
		return this.prisma.studyGroup.findFirst({ where });
	}

	async CreateStudyGroup(data: {
		grade?: number;
		letter?: string;
		title: string;
	}) {
		return this.prisma.studyGroup.create({ data });
	}

	async CreateUser(dto: CreateUserDTO, studyGroupIds: Array<number>) {
		if (!studyGroupIds[0]) {
			throw new Error("invalid study Group Ids");
		}

		await this.prisma.user.create({
			data: {
				username: dto.username,
				name: dto.firstName,
				last_name: dto.lastName,
				patronymic: dto.patronymic,
				yandex_email: dto.yandex_email,
				id: dto.id,
				role: "GUEST",
				studyGroupId: studyGroupIds[0],
			},
		});

		for (const groupId of studyGroupIds) {
			await this.prisma.studyGroupRelation.create({
				data: {
					userId: dto.id,
					groupId,
				},
			});
		}
	}

	async GetUserPendingRequest(userId: bigint): Promise<Request | null> {
		return this.prisma.request.findFirst({
			where: {
				resolved: false,
				canceled: false,
				user_id: userId,
			},
		});
	}

	async GetAdminIds(): Promise<bigint[]> {
		return (
			await this.prisma.user.findMany({
				where: {
					role: "ADMIN",
				},
			})
		).map((item) => item.id);
	}

	async DeleteUser(userId: bigint): Promise<void> {
		await this.prisma.studyGroupRelation.deleteMany({
			where: {
				userId,
			},
		});
		await this.prisma.request.delete({
			where: {
				user_id: userId,
			},
		});

		await this.prisma.user.delete({
			where: {
				id: userId,
			},
		});
	}

	async VerifyUser(userId: bigint): Promise<void> {
		await this.prisma.user.update({
			where: {
				id: userId,
				verified: false,
			},
			data: {
				verified: true,
				role: "USER",
			},
		});

		await this.prisma.request.update({
			where: {
				user_id: userId,
				canceled: false,
				resolved: false,
			},
			data: {
				resolved: true,
			},
		});
	}

	async CreateVerifyRequest(
		userId: bigint,
		messageIds: string[]
	): Promise<void> {
		await this.prisma.request.create({
			data: {
				canceled: false,
				messageId: messageIds,
				user_id: userId,
				resolved: false,
			},
		});
	}

	async GetUsersNotCompletedHomeworkWithGroupId(
		homeworkId: number,
		groupId: number
	) {
		return this.prisma.user.findMany({
			where: {
				studyGroupId: groupId,
				userHomeworks: {
					none: {
						homework_id: homeworkId,
					},
				},
			},
		});
	}

	async GetUsersNotCompletedHomework(homeworkId: number) {
		return this.prisma.user.findMany({
			where: {
				userHomeworks: {
					none: {
						homework_id: homeworkId,
					},
				},
			},
		});
	}

	async GetUsersCompletedHomework(homeworkId: number): Promise<User[]> {
		return this.prisma.user.findMany({
			where: {
				userHomeworks: {
					some: {
						homework_id: homeworkId,
					},
				},
			},
		});
	}

	async ChangeScore(userId: bigint, amount: number): Promise<void> {
		await this.prisma.user.update({
			where: { id: userId },
			data: {
				score: {
					increment: amount,
				},
			},
		});
	}

	async DeletePendingRequests(userId: bigint): Promise<void> {
		await this.prisma.request.update({
			where: {
				user_id: userId,
				resolved: false,
				canceled: false,
			},
			data: {
				canceled: true,
			},
		});
	}

	async GetUsersFromPendingRequests(): Promise<User[]> {
		return this.prisma.user.findMany({
			where: {
				request: {
					is: {
						resolved: false,
						canceled: false,
					},
				},
			},
		});
	}

	async GetUsers(): Promise<User[]> {
		return this.prisma.user.findMany({
			where: {
				role: "USER",
			},
			include: {
				studyGroupRelations: {
					include: {
						group: true,
					},
				},
			},
		});
	}

	async GetUserIds(): Promise<bigint[]> {
		const rows = await this.prisma.user.findMany({
			where: { role: "USER" },
			select: { id: true },
		});

		return rows.map((r) => r.id);
	}
}
