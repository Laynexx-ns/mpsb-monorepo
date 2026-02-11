// import { buildUserFullname } from "@/bot/helpers/build-user-fullname";
// import type { StudyGroup, User } from "@mpsb-monorepo/db/generated";

// export interface YandexResp {
//   href: string;
//   method: string;
//   templated: string;
// }

// export interface YandexPathResp extends YandexResp {
//   operation_id: string;
// }

// export interface UploadHomeworkToDiskProps {
//   filepath: string;
//   homeworkName: string;
//   user: User;
//   group: StudyGroup;
// }

// const BASE_URL = "https://cloud-api.yandex.net/v1/disk/resources";

// export const uploadHomeworkToDisk = async (
//   props: UploadHomeworkToDiskProps,
// ) => {
//   const TOKEN = process.env.YANDEX_API_TOKEN;
//   try {
//     const file = Bun.file(props.filepath);
//     if (!file) {
//       throw new Error("file don't exist");
//     }

//     const fullUserName = buildUserFullname(props.user);

//     await Bun.fetch(`${BASE_URL}?path=${props.group.title}`, {
//       method: "PUT",
//       headers: { Authorization: `OAuth ${TOKEN}` },
//     });

//     await Bun.fetch(
//       `${BASE_URL}?path=${props.group.title}/${encodeURIComponent(props.homeworkName)}`,
//       {
//         method: "PUT",
//         headers: { Authorization: `OAuth ${TOKEN}` },
//       },
//     );

//     const uploadUrl = `${BASE_URL}/upload?path=${props.group.title}/${encodeURIComponent(props.homeworkName)}/${encodeURIComponent(fullUserName)}.pdf&overwrite=true`;
//     const resp = await Bun.fetch(uploadUrl, {
//       headers: { Authorization: `OAuth ${TOKEN}` },
//     });

//     const { href } = (await resp.json()) as YandexPathResp;

//     const { ok } = await Bun.fetch(href, {
//       method: "PUT",
//       body: Bun.file(props.filepath),
//     });

//     if (!resp.ok || resp.status < 200 || resp.status > 300) {
//       throw new Error("failed to reserve a path");
//     }

//     return ok;
//   } catch (e) {
//     throw e;
//   }
// };

// export interface DeleteHomeworkFromDiskProps {
//   homeworkName: string;
//   user: User;
//   group: StudyGroup;
// }
// export const deleteHomework = async (props: DeleteHomeworkFromDiskProps) => {
//   const TOKEN = process.env.YANDEX_API_TOKEN;
//   try {
//     const fullUserName = buildUserFullname(props.user);

//     await Bun.fetch(
//       `https://cloud-api.yandex.net/v1/disk/resources?path=${props.group.title}`,
//       {
//         method: "PUT",
//         headers: { Authorization: `OAuth ${TOKEN}` },
//       },
//     );

//     const resp = await Bun.fetch(
//       `https://cloud-api.yandex.net/v1/disk/resources?path=${props.group.title}/${encodeURIComponent(props.homeworkName)}/${encodeURIComponent(fullUserName)}.pdf&pemanently=true`,
//       {
//         method: "DELETE",
//         headers: { Authorization: `OAuth ${TOKEN}` },
//       },
//     );

//     if (!resp.ok || resp.status < 200 || resp.status > 300) {
//       throw new Error("failed to reserve a path");
//     }

//     return resp.ok;
//   } catch (e) {
//     throw e;
//   }
// };
