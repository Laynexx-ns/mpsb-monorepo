import type { CallbackQueryFunc } from "../handlers/callbacks/callback.types";

// TODO: make type system for callbacks
export const RENDER_CALLBACKS = {
	usersRender: {
		updatePage: "usersRender",
	},
	management: {
		groupHomeworks: {
			call: (groupId: number) => `groupHomeworks:${groupId}`,
			name: "groupHomeworks",
		},
		deleteHomework: {
			call: (homeworkId: number) => `deleteHomework:${homeworkId}`,
			name: "deleteHomework",
		},
		confirmDeleteHomework: {
			call: (homeworkId: number) => `confirmDeleteHomework:${homeworkId}`,
			name: "confirmDeleteHomework",
		},
		cancelDeleteHomework: {
			call: (homeworkId: number) => `cancelDeleteHomework:${homeworkId}`,
			name: "cancelDeleteHomework",
		},
		homeworkUsers: {
			call: (homeworkId: number) => `homeworkUsers:${homeworkId}`,
			name: "homeworkUsers",
		},
		gradeMenu: {
			call: (homeworkId: number, userId: bigint) =>
				`gradeMenu:${homeworkId}:${userId}`,
			name: "gradeMenu",
		},
		setGrade: {
			call: (homeworkId: number, userId: bigint, grade: string) =>
				`setGrade:${homeworkId}:${userId}:${grade}`,
			name: "setGrade",
		},
	},
	homeworksRender: {
		updatePage: {
			call: (page: number) => `homeworks:${page}`,
			name: "homeworks",
		},
		openHomework: {
			call: (homeworkId: number, page: number) =>
				`openHomework:${page}:${homeworkId}`,
			name: "openHomework",
		},
		sendHomework: {
			call: (homeworkId: number, homeworkName: string, completed: boolean) =>
				`sendHomework:${homeworkId}:${homeworkName}:${completed ? "1" : ""}`,
			name: "sendHomework",
		},
		deleteUserHomework: {
			call: (homeworkId: number) => `deleteUserHomework:${homeworkId}`,
			name: "deleteUserHomework",
		},
	},
	requestsRender: {
		updatePage: {
			call: (page: number) => `requestsRender:${page}`,
			name: "requestsRender",
		},
		openRequest: {
			call: (page: number, userId: bigint) => `openRequest:${page}:${userId}`,
			name: "openRequest",
		},
	},
	studyGroupsRender: {
		updatePage: {
			call: (page: number) => `studyGroupsRender:${page}`,
			name: "studyGroupsRender",
		},
		openGroup: {
			call: (page: number, groupId: number) =>
				`openStudyGroup:${page}:${groupId}`,
			name: "openStudyGroup",
		},
		selectGroup: {
			call: (groupId: number) => `selectStudyGroup:${groupId}`,
			name: "selectStudyGroup",
		},
	},
	EMPTY: "none",
} as const;

export interface RenderListProps {
	list: Array<any>;
	callback: CallbackQueryFunc;
}
export class RenderList {
	private list: Array<any>;
	private callback: CallbackQueryFunc;
	constructor(props: RenderListProps) {
		this.list = props.list;
		this.callback = props.callback;
	}

	async render() {}
}
