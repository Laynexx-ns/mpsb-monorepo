import { Keyboard } from "gramio";

// export const KEYBOARD_COMMANDS = {
//   homework: "💼 Homework",
//   manage: "🎛️ Manage",
//   requests: "✉️ Requests",
//   students: "👥 Students",
//   info: "ℹ️ Info",
//   lections: "👨‍🏫 Lections",
//   register: "❤️ Register",
//   notify: "🔔 Notify",
//   resendRequest: "🛠️ Resend request",
//   accept: "✅ Accept",
//   send: "📁 Send",
//   update: "🔄 Update",
//   delete: "🗑️ Delete",
//   reject: "🚫 Reject",
//   back: "← Back",
// } as const;

export const KEYBOARD_COMMANDS = {
  homework: "💼 Домашки",
  manage: "🎛️ Управлять",
  requests: "✉️ Запросы",
  students: "👥 Студенты",
  info: "ℹ️ Инфо",
  lections: "👨‍🏫 Лекции",
  register: "❤️ Регистрация",
  notify: "🔔 Сообщить студентам",
  resendRequest: "🛠️ Отменить заявку",
  accept: "✅ Подтвердить",
  send: "📁 Отправить",
  update: "🔄 Заменить",
  delete: "🗑️ Удалить",
  reject: "🚫 Отклонить",
  back: "← Назад",
} as const;

export const KEYBOARD_ANSWERS = {
  cancel: "🚫 Отменить",
};

export const KEYBOARD_LAYOUTS = {
  teacher: [
    [{ text: KEYBOARD_COMMANDS.homework }, { text: KEYBOARD_COMMANDS.manage }],
    [{ text: KEYBOARD_COMMANDS.requests }, { text: KEYBOARD_COMMANDS.notify }],
    [{ text: KEYBOARD_COMMANDS.students }],
    // [{ text: KEYBOARD_COMMANDS.info }, { text: KEYBOARD_COMMANDS.lections }],
  ],

  student: [
    [{ text: KEYBOARD_COMMANDS.homework }],
    // [{ text: KEYBOARD_COMMANDS.info }, { text: KEYBOARD_COMMANDS.lections }],
  ],
  guest: [[{ text: KEYBOARD_COMMANDS.resendRequest }]],
  unregistered: [[{ text: KEYBOARD_COMMANDS.register }]],
};

export function buildKeyboard(layout: { text: string }[][]): Keyboard {
  const k = new Keyboard();

  for (const row of layout) {
    k.row();
    for (const btn of row) {
      k.text(btn.text);
    }
  }

  return k;
}
