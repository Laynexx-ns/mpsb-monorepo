import type {
	Homework,
	Role,
	StudyGroup,
	UserHomework,
} from "@mpsb-monorepo/db/generated";
import type {
	CompleteHomeworkDto,
	CreateHomeworkDto,
	HomeworkStatusDto,
	UserHomeworkDTO,
} from "@/dto/homework.dto";
import { Repository } from "./index";

export class HomeworkRepository extends Repository {
	async CreateHomework(dto: CreateHomeworkDto) {
		await this.prisma.homework.create({
			data: dto,
		});
	}

	async GetHomework(id: number) {
		return await this.prisma.homework.findFirst({
			where: {
				id,
			},
		});
	}

	async GetUserHomework(
		homeworkId: number,
		userId: bigint
	): Promise<UserHomework | null> {
		return this.prisma.userHomework.findFirst({
			where: {
				homework_id: homeworkId,
				user_id: userId,
			},
		});
	}

	async DeleteHomework(homeworkId: number): Promise<void> {
		await this.prisma.userHomework.updateMany({
			where: {
				homework_id: homeworkId,
			},
			data: {
				deleted: true,
			},
		});

		await this.prisma.homework.updateMany({
			where: {
				id: homeworkId,
			},
			data: {
				deleted: true,
			},
		});
	}

	async GetHomeworkGroup(homeworkId: number): Promise<StudyGroup | null> {
		const hw = await this.prisma.homework.findUnique({
			where: {
				id: homeworkId,
			},
			include: {
				studyGroup: true,
			},
		});

		if (!hw) return null;
		return hw.studyGroup ?? null;
	}

	async CheckChecked(homeworkId: number, userId: bigint): Promise<boolean> {
		return !!(await this.prisma.user.findFirst({
			where: {
				userHomeworks: {
					some: {
						homework_id: homeworkId,
						user_id: userId,
						checked: true,
					},
				},
			},
		}));
	}

	async CheckCompleted(homeworkId: number, userId: bigint): Promise<boolean> {
		return !!(await this.prisma.user.findFirst({
			where: {
				userHomeworks: {
					some: {
						homework_id: homeworkId,
						user_id: userId,
					},
				},
			},
		}));
	}

	async CompleteHomework(dto: CompleteHomeworkDto) {
		await this.prisma.userHomework.upsert({
			where: {
				user_id_homework_id: {
					user_id: dto.userId,
					homework_id: dto.homeworkId,
				},
			},
			create: {
				user_id: dto.userId,
				homework_id: dto.homeworkId,
			},
			update: {
				homework_id: dto.homeworkId,
			},
		});
	}

	async GetUsersThatCompletedHomework(
		homeworkId: number
	): Promise<UserHomework[]> {
		return this.prisma.userHomework.findMany({
			where: {
				homework_id: homeworkId,
				deleted: false,
			},
		});
	}

	async SetUserHomeworkScore(
		homeworkId: number,
		userId: bigint,
		score?: number,
		checked?: boolean
	) {
		return this.prisma.userHomework.update({
			where: {
				user_id_homework_id: { user_id: userId, homework_id: homeworkId },
			},
			data: { score, checked: checked ?? true },
		});
	}

	async GetCompletedHomeworks(
		userId: bigint,
		groupIds: number[],
		role?: Role
	): Promise<UserHomeworkDTO[]> {
		let hws: Homework[];

		if (role == "ADMIN") {
			hws = await this.prisma.homework.findMany();
		} else {
			hws = await this.prisma.homework.findMany({
				where: {
					studyGroupId: {
						in: groupIds,
					},
					deleted: false,
				},
			});
		}

		const completedhws = await this.prisma.userHomework.findMany({
			where: {
				user_id: userId,
			},
		});
		return hws.map((hw) => {
			return {
				...hw,
				completed: completedhws.some((h) => h.homework_id == hw.id),
			} as UserHomeworkDTO;
		});
	}

	async GetHomeworks(groupId: number, role?: Role): Promise<Homework[]> {
		if (role == "ADMIN") {
			return this.prisma.homework.findMany();
		}
		return this.prisma.homework.findMany({
			where: {
				studyGroupId: groupId,
				deleted: false,
			},
		});
	}

	async GetGroupHomeworks(groupId: number): Promise<Homework[]> {
		return this.prisma.homework.findMany({
			where: {
				studyGroupId: groupId,
				deleted: false,
			},
		});
	}

	async DeleteUserHomeworkRecord(
		homeworkId: number,
		userId: bigint
	): Promise<void> {
		await this.prisma.userHomework.delete({
			where: {
				user_id_homework_id: {
					user_id: userId,
					homework_id: homeworkId,
				},
			},
		});
	}

	async GetHomeworksWithDeadlines(): Promise<Homework[]> {
		return this.prisma.homework.findMany({
			where: {
				NOT: {
					deadline: null,
				},
				deleted: false,
			},
		});
	}

	async ExpireHomework(homeworkId: number): Promise<Homework> {
		return this.prisma.homework.update({
			where: {
				id: homeworkId,
			},
			data: {
				expired: true,
			},
		});
	}

	async GetExpiredHomeworks(now: Date) {
		return this.prisma.homework.findMany({
			where: {
				deadline: {
					lte: now,
				},
				deleted: false,
				expired: false,
			},
		});
	}

	async GetHomeworksStatus(): Promise<HomeworkStatusDto[]> {
		const homeworks = await this.prisma.homework.findMany({
			where: {
				deleted: false,
			},
		});

		const usersAmount = await this.prisma.user.count();

		const result = await Promise.all(
			homeworks.map(async (hw) => {
				const completedCount = await this.prisma.userHomework.count({
					where: {
						homework_id: hw.id,
					},
				});

				const percent =
					usersAmount === 0
						? 0
						: Math.round((completedCount / usersAmount) * 100);

				return {
					id: hw.id,
					name: hw.name,
					deadline: hw.deadline,
					completedCount,
					percent,
				} as HomeworkStatusDto;
			})
		);

		return result;
	}
}
