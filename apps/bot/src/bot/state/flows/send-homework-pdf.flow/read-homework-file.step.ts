import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import Bun from "bun";
import { KEYBOARD_ANSWERS } from "@/bot/keyboards";
import { registerStep } from "../../flow-registry";

export const readHomeworkStep = () => {
	registerStep("sendHomework", "readHomework", async ({ ctx, state }) => {
		const t = ctx.text;

		if (t === KEYBOARD_ANSWERS.cancel) {
			return "cancel";
		}

		if (!ctx.document) {
			await ctx.send("Разрешены только PDF файлы");
			return "readHomework";
		}

		try {
			// @ts-expect-error
			const fileId = ctx.document.file_id;
			let fileName = ctx.document.fileName ?? "homework.pdf";

			if (ctx.document.mimeType !== "application/pdf") {
				await ctx.send("Разрешены только PDF файлы");
				return "readHomework";
			}

			if (!fileName.toLowerCase().endsWith(".pdf")) {
				fileName += ".pdf";
			}

			const folder = path.join("tmp", randomUUID().toString());
			await mkdir(folder, { recursive: true });
			const fullPath = path.join(folder, fileName);

			const data = await ctx.download(fileId);

			await Bun.write(fullPath, data);

			state.data.homeworkPath = fullPath;

			return "sendHomework_done";
		} catch (e) {
			await ctx.send("Произошла ошибка при загрузке файла.");
			return "readHomework";
		}
	});
};
