// Yes, it's fully vibe-coded

/**
 * export_report.ts
 *
 * Читает пользователей + связанные данные через Prisma,
 * собирает строку в форме таблицы и сохраняет CSV + XLSX.
 *
 * Настройте блок CONFIG ниже под ваши реальные правила.
 */

import prisma from "@mpsb-monorepo/db";
import { createObjectCsvWriter } from "csv-writer";
import ExcelJS from "exceljs";
import path from "path";

/* ----------------- CONFIG: правила вычисления ----------------- */

const CONFIG = {
	// паттерны для определения "контрольных" по имени домашки
	controlNamePatterns: [/контрол/i, /test/i, /control/i],

	// считает "ответы" как userHomeworks с ненулевым score
	answersPredicate: (uh: any) => uh.score !== null && uh.score !== undefined,

	// пример метрики "нахождение ошибок": считаю задания с score < threshold
	errorsPredicate: (uh: any) => {
		const threshold = 3; // пример: оценки ниже 3 считаем "ошибкой"
		return typeof uh.score === "number" && uh.score < threshold;
	},

	// формула рейтинга (настраивайте)
	ratingFormula: (counts: {
		homeworks: number;
		control: number;
		answers: number;
		errors: number;
	}) => {
		// пример: можете поменять веса
		return (
			counts.homeworks * 1 +
			counts.control * 1.5 +
			counts.answers * 0.5 -
			counts.errors * 0.25
		);
	},

	// output files
	outCsv: path.resolve(process.cwd(), "report.csv"),
	outXlsx: path.resolve(process.cwd(), "report.xlsx"),
};

/* ----------------- HELPERS ----------------- */

function isControlHomework(name?: string | null): boolean {
	if (!name) return false;
	return CONFIG.controlNamePatterns.some((re) => re.test(name));
}

/* ----------------- MAIN ----------------- */

async function buildReport() {
	// загружаем пользователей с нужными связями
	const users = await prisma.user.findMany({
		include: {
			StudyGroup: true,
			userHomeworks: {
				include: {
					homework: true,
				},
			},
		},
		orderBy: {
			last_name: "asc",
		},
	});

	const rows = users.map((u) => {
		const hw = u.userHomeworks.filter((x) => !x.deleted);
		const homeworksCount = hw.length;
		const controlCount = hw.filter((h) =>
			isControlHomework(h.homework?.name)
		).length;
		const answersCount = hw.filter(CONFIG.answersPredicate).length;
		const errorsCount = hw.filter(CONFIG.errorsPredicate).length;

		const overallRating = CONFIG.ratingFormula({
			homeworks: homeworksCount,
			control: controlCount,
			answers: answersCount,
			errors: errorsCount,
		});

		const studyGroup = u.StudyGroup;
		const classStr = studyGroup
			? studyGroup.grade != null && studyGroup.letter
				? `${studyGroup.grade}${studyGroup.letter}`
				: (studyGroup.title ?? "")
			: "";

		return {
			last_name: u.last_name,
			first_name: u.name,
			class: classStr,
			yandex_email: u.yandex_email,
			invite_sent: u.verified ? "Да" : "Нет",
			// пустая колонка как в примере
			gap: "",
			homeworks: homeworksCount,
			controls: controlCount,
			answers: answersCount,
			errors: errorsCount,
			overall_rating: Number(
				(Math.round(overallRating * 100) / 100).toFixed(2)
			),
		};
	});

	await writeCsv(rows);
	await writeXlsx(rows);
	console.log("Done. Files:", CONFIG.outCsv, CONFIG.outXlsx);
}

/* ----------------- CSV/XLSX writers ----------------- */

async function writeCsv(rows: any[]) {
	const csvWriter = createObjectCsvWriter({
		path: CONFIG.outCsv,
		header: [
			{ id: "last_name", title: "Фамилия" },
			{ id: "first_name", title: "Имя" },
			{ id: "class", title: "Класс" },
			{ id: "yandex_email", title: "Яндекс Почта (обязательно)" },
			{ id: "invite_sent", title: "Приглашение выслано" },
			{ id: "gap", title: "" },
			{ id: "homeworks", title: "Домашки" },
			{ id: "controls", title: "Контрольные" },
			{ id: "answers", title: "Ответы" },
			{ id: "errors", title: "Нахождение ошибок" },
			{ id: "overall_rating", title: "Общий рейтинг" },
		],
		fieldDelimiter: ",",
		alwaysQuote: false,
	});

	await csvWriter.writeRecords(rows);
}

async function writeXlsx(rows: any[]) {
	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet("Report");

	const header = [
		"Фамилия",
		"Имя",
		"Класс",
		"Яндекс Почта (обязательно)",
		"Приглашение выслано",
		"",
		"Домашки",
		"Контрольные",
		"Ответы",
		"Нахождение ошибок",
		"Общий рейтинг",
	];

	sheet.addRow(header);
	rows.forEach((r) => {
		sheet.addRow([
			r.last_name,
			r.first_name,
			r.class,
			r.yandex_email,
			r.invite_sent,
			r.gap,
			r.homeworks,
			r.controls,
			r.answers,
			r.errors,
			r.overall_rating,
		]);
	});

	// Автоподгон ширины колонок (простейший)
	sheet.columns.forEach((col) => {
		let max = 10;
		col.eachCell({ includeEmpty: true }, (cell) => {
			const len = cell.value ? String(cell.value).length : 0;
			if (len > max) max = len;
		});
		col.width = Math.min(50, max + 2);
	});

	await workbook.xlsx.writeFile(CONFIG.outXlsx);
}

/* ----------------- run ----------------- */

buildReport()
	.catch((e) => {
		console.error("Error", e);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
