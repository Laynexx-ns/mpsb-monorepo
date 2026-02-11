import type { Homework } from "@mpsb-monorepo/db/generated";

export interface CreateHomeworkDto {
	name: string;
	deadline: Date;
	studyGroupId: number;
}

export interface CompleteHomeworkDto {
	userId: bigint;
	homeworkId: number;
}

export interface HomeworkStatusDto {
	id: number;
	name: string;
	deadline: Date;
	completedCount: number;
	percent: number;
}

export interface UserHomeworkDTO extends Homework {
	completed: boolean;
}
