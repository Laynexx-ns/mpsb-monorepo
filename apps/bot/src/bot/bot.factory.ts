import { rm } from "node:fs/promises";
import path from "node:path";
import type { Storage } from "@gramio/storage";
import type { User } from "@mpsb-monorepo/db/generated";
import { env } from "@mpsb-monorepo/env/server";
import * as jwt from "@mpsb-monorepo/jwt-types";
import { deleteHomework } from "@mpsb-monorepo/yandex-api";
import { Bot, code, InlineKeyboard, Keyboard } from "gramio";
import type { AppState } from "@/bot/state/state.types";
import { createI18n } from "@/core/i18n/i18n";
import type { CreateUserDTO } from "@/dto/registration.dto";
import type { HomeworkRepository } from "@/repository/homework.repository";
import type { UserRepository } from "@/repository/user.repository";
import { formatCtxForLog, formatFullState } from "@/utils/log-formatter";
import {
  DeriveCallbackQueryeAccessMiddleware,
  DeriveMessageAccessMiddleware,
} from "./derives/acces-middleware.derive";
import { CallbackQueryApproveUserRequest } from "./handlers/callbacks/approve-user.callback";
import {
  CallbackQueryClassUpdatePage,
  CallbackQueryOpenClass,
} from "./handlers/callbacks/choose-class-render.callback";
import {
  CallbackQueryCancelDeleteHomework,
  CallbackQueryConfirmDeleteHomework,
  CallbackQueryDeleteHomework,
} from "./handlers/callbacks/delete-homework.callback";
import { CallbackQueryDisapproveUserRequest } from "./handlers/callbacks/disapprove-user-request.callback";
import { CallbackQueryGradeMenu } from "./handlers/callbacks/grade-menu.callback";
import { CallbackQueryGroupHomeworks } from "./handlers/callbacks/group-homeworks.callback";
import { CallbackQueryHomeworkUsers } from "./handlers/callbacks/homework-users.callback";
import {
  CallbackQueryHomeworksRender,
  CallbackQuerySelectHomework,
} from "./handlers/callbacks/homeworks-render.callback";
import {
  CallbackQueryRequestsOpenRequest,
  CallbackQueryRequestsUpdatePage,
} from "./handlers/callbacks/requests-page.callback";
import { CallbackQuerySendHomework } from "./handlers/callbacks/send-homework.callback";
import { CallbackQuerySetGrade } from "./handlers/callbacks/set-grade.callback";
import { CallbackQueryUsersRender } from "./handlers/callbacks/users-render.callback";
import { handleCreateHomeworkDone } from "./handlers/messages/createHomework_done";
import { handleHomeworks } from "./handlers/messages/homeworks.handler";
import { handleinfo } from "./handlers/messages/info.handler";
import { handleRequests } from "./handlers/messages/requests.handler";
import { HandlerStart } from "./handlers/messages/start.handler";
import { handleStudents } from "./handlers/messages/students.handler";
import { HandleStudyGroup } from "./handlers/messages/study-groups.handler";
import { buildUserFullname } from "./helpers/build-user-fullname";
import { extractUserId } from "./helpers/extract-user-id";
import { getRelativeKeyboard } from "./helpers/get-relative-kbd";
import { isCancel } from "./helpers/is-cancel";
import { pl } from "./helpers/parse-locale";
import { REQUIRE_ACCEPTED, REQUIRE_ADMIN } from "./helpers/require-role";
import { resetState } from "./helpers/reset-state";
import {
  buildKeyboard,
  KEYBOARD_ANSWERS,
  KEYBOARD_COMMANDS,
  KEYBOARD_LAYOUTS,
} from "./keyboards";
import { renderHomeworksPage } from "./render/homeworks-render";
import { extractItemFromQuery } from "./render/paginator";
import { RENDER_CALLBACKS } from "./render/render.types";
import { getStepHandler } from "./state/flow-registry";
import { setupCreateHomeworkFlow } from "./state/flows/create-homework.flow/setup.flow";
import { SetupNotifyStudentsFlow } from "./state/flows/notify.flow/setup.flow";
import { setupRegisterFlow } from "./state/flows/register.flow/setup.flow";
import { setupSendHomeworkFlow } from "./state/flows/send-homework-pdf.flow/setup.flow";
import {
  type GramioCallbackQueryContext,
  type GramioMessageContext,
  TelegramBot,
  type TelegramBotProps,
} from "./types/bot.types";

export interface GramioBotProps extends TelegramBotProps {
  storage: Storage;
  userRepo: UserRepository;
  homeworkRepo: HomeworkRepository;
}

export class GramioBot extends TelegramBot {
  private storage: Storage;
  private userRepository: UserRepository;
  private homeworkRepository: HomeworkRepository;
  private users: Map<bigint, User>;

  constructor(props: GramioBotProps) {
    super(props);
    this.storage = props.storage;
    this.userRepository = props.userRepo;
    this.homeworkRepository = props.homeworkRepo;
    this.users = new Map<bigint, User>();
    // flows registration
    setupRegisterFlow();
    setupCreateHomeworkFlow();
    setupSendHomeworkFlow();
    SetupNotifyStudentsFlow();

    // basic construction log
    this.logger.info(
      { msg: "GramioBot constructed", usersCacheSize: this.users.size },
      "bot:constructed",
    );
  }

  get botInst(): Bot {
    return this.bot;
  }

  public logContext(
    ctx: GramioMessageContext | GramioCallbackQueryContext,
    state?: AppState,
    msg?: string,
  ) {
    this.logger.info({ state: formatFullState(ctx, state) }, msg);
  }

  /**
   * Get user either from internal cache or DB.
   * We log cache hits/misses and fetch operations with user id context.
   */
  async getUser(_id: bigint | number): Promise<User | null> {
    const id = BigInt(_id);
    this.logger.debug({ userId: id.toString() }, "getUser:start");

    if (this.users.has(id)) {
      this.logger.debug({ userId: id.toString() }, "getUser:cacheHit");
      return this.users.get(id)!;
    }

    this.logger.debug(
      { userId: id.toString() },
      "getUser:cacheMiss, fetching repo",
    );
    const user = await this.userRepository.GetUser(id);
    if (!user) {
      this.logger.info({ userId: id.toString() }, "getUser:notFound");
      return null;
    }

    this.users.set(id, user);
    this.logger.info(
      { userId: id.toString(), username: user.username, role: user.role },
      "getUser:fetched",
    );

    return user;
  }

  // loadState loads state from provided storage
  async loadState(userId: bigint): Promise<AppState | null> {
    this.logger.debug({ userId: userId.toString() }, "loadState:start");
    const loadedState = await this.storage.get(userId.toString());
    if (!loadedState) {
      this.logger.debug({ userId: userId.toString() }, "loadState:empty");
      return null;
    }
    try {
      const parsed = JSON.parse(loadedState);
      this.logger.debug(
        { userId: userId.toString(), state: parsed },
        "loadState:loaded",
      );
      return parsed;
    } catch (e) {
      this.logger.error(
        { err: e, userId: userId.toString() },
        "loadState:parseError",
      );
      return null;
    }
  }

  // setState overrides step in provided storage
  async setState(
    userId: bigint | string | number,
    state: AppState,
  ): Promise<void> {
    const idStr = userId.toString();
    this.logger.debug({ userId: idStr, state }, "setState:start");
    try {
      await this.storage.set(idStr, JSON.stringify(state));
      this.logger.debug({ userId: idStr }, "setState:ok");
    } catch (e) {
      this.logger.error({ err: e, userId: idStr }, "setState:error");
      throw e;
    }
  }

  async notifyNewRequest(dto: CreateUserDTO, ctx: GramioMessageContext) {
    this.logger.info(
      {
        event: "notifyNewRequest",
        dto: { id: dto.id, username: dto.yandex_email },
        state: formatCtxForLog(ctx),
      },
      "notifyNewRequest:start",
    );

    const replyKeyboard = new InlineKeyboard()
      .text(ctx.t(pl(ctx), "approve"), `Approve:${dto.id}`)
      .row()
      .text(ctx.t(pl(ctx), "disapprove"), `Disapprove:${dto.id}`);

    const admins = await this.userRepository.GetAdminIds();
    this.logger.debug({ admins }, "notifyNewRequest:adminsFetched");

    const group = await this.userRepository.GetUserGroups(dto.id);
    this.logger.debug({ group }, "notifyNewRequest:groupsFetched");

    // TODO: add to i18n
    const result = await this.notify(
      admins,
      `Новый запрос от ${code`${[dto.lastName, dto.firstName, dto.patronymic].join(" ")}`}, email: ${code`${dto.yandex_email}`} | ${group.map((i) => i.title).join(" ")}`,
      {
        reply_markup: replyKeyboard,
      },
    );

    this.logger.info(
      { receivers: result.length, dtoId: dto.id },
      "notifyNewRequest:done",
    );
    return result;
  }

  async removePreviousRequests(userId: bigint) {
    this.logger.info(
      { userId: userId.toString() },
      "removePreviousRequests:start",
    );
    const pending = await this.userRepository.GetUserPendingRequest(userId);
    if (!pending) {
      this.logger.debug(
        { userId: userId.toString() },
        "removePreviousRequests:noneFound",
      );
      return;
    }

    for (const id of pending.messageId) {
      try {
        const [userIdStr, messageId] = id.split(":");
        if (!(userIdStr && messageId)) {
          this.logger.warn({ raw: id }, "removePreviousRequests:skipMalformed");
          continue;
        }

        this.logger.debug(
          { targetUserId: userIdStr, messageId },
          "removePreviousRequests:deletingMessage",
        );

        await this.bot.api.deleteMessage({
          chat_id: userIdStr,
          message_id: Number.parseInt(messageId),
        });
      } catch (e) {
        this.logger.error(
          { err: e, rawId: id },
          "removePreviousRequests:deleteFailed",
        );
      }
    }

    await this.userRepository.DeletePendingRequests(userId);
    this.logger.info(
      { userId: userId.toString() },
      "removePreviousRequests:deletedDbRecords",
    );
  }

  async notify(
    who: bigint[],
    text: string,
    data?: any,
  ): Promise<{ chatId: bigint; messageId: number }[]> {
    this.logger.debug({ count: who.length }, "notify:start");
    const result = [];

    for (const id of who) {
      try {
        this.logger.debug({ chatId: id.toString(), text }, "notify:sending");
        const msg = await this.bot.api.sendMessage({
          chat_id: id.toString(),
          text,
          ...data,
        });

        this.logger.info(
          { chatId: id.toString(), messageId: msg.message_id },
          "notify:sent",
        );
        result.push({
          chatId: BigInt(id),
          messageId: msg.message_id,
        });
      } catch (e) {
        this.logger.error(
          { err: e, chatId: id.toString(), text },
          "notify:error",
        );
      }
    }

    return result;
  }

  // Returns keyboard consistent with user rights
  async GetKeyboard(userId: bigint): Promise<Keyboard> {
    this.logger.debug({ userId: userId.toString() }, "GetKeyboard:start");
    const user = await this.getUser(userId);
    let layout;
    if (!user) {
      layout = KEYBOARD_LAYOUTS.unregistered;
      this.logger.debug(
        { userId: userId.toString(), layout },
        "GetKeyboard:unregistered",
      );
      return buildKeyboard(layout);
    }

    const isAdmin = user.role == "ADMIN";
    layout = isAdmin ? KEYBOARD_LAYOUTS.teacher : KEYBOARD_LAYOUTS.student;

    this.logger.debug(
      { userId: userId.toString(), role: user.role, layout },
      "GetKeyboard:selected",
    );
    return buildKeyboard(layout);
  }

  // persist loads all changes from database and sync between storages
  async persist() {
    // this.logger.info("persist:start");
    // TODO: make timer for updating
    const users = await this.userRepository.GetUsers();
    this.users = new Map(users.map((user) => [user.id, user]));
    // this.logger.info({ usersCount: this.users.size }, "persist:done");
  }

  // init loads and sets all default logic for handling telegram bot && user actions
  override async init(): Promise<void> {
    this.logger.info("init:start - creating bot instance and middleware");

    // bot with i18n setup
    const bot = new Bot(this.TELEGRAM_TOKEN, {
      api: {
        useTest: false,
      },
    }).derive(() => {
      const i18n = createI18n();
      return {
        t: i18n,
        userRepo: this.userRepository,
        homeworkRepo: this.homeworkRepository,
      };
    });

    DeriveCallbackQueryeAccessMiddleware(this, bot);
    DeriveMessageAccessMiddleware(this, bot);

    const users = await this.userRepository.GetUsers();
    this.users = new Map(users.map((user) => [user.id, user]));

    this.logger.info({ usersLoaded: this.users.size }, "init:usersLoaded");

    // commands
    bot.command("homeworks", async (ctx) => {
      this.logger.info(
        { state: formatCtxForLog(ctx) },
        "command:homeworks:invoked",
      );
      await handleHomeworks({
        ctx,
        bot: this,
        userRepo: this.userRepository,
        homeworkRepo: this.homeworkRepository,
      });
    });

    bot.command("start", async (ctx) => {
      this.logger.info(
        { state: formatCtxForLog(ctx) },
        "command:start:invoked",
      );
      await HandlerStart({
        ctx,
        bot: this,
      });
    });

    // Callbacks loading
    // maybetodo: move setup logic like in flows (e.g. in consructor)
    bot.callbackQuery(/usersRender:(\d+)/, async (ctx) => {
      this.logger.info({ state: formatCtxForLog(ctx) }, "callback:usersRender");
      await CallbackQueryUsersRender({
        ctx,
        bot: this,
        userRepo: this.userRepository,
      });
    });

    bot.callbackQuery(/Approve:(\d+)/, async (ctx) => {
      this.logger.info(
        { state: formatCtxForLog(ctx) },
        "callback:approveRequest",
      );
      await CallbackQueryApproveUserRequest({
        ctx,
        bot: this,
        userRepo: this.userRepository,
      });
    });

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.requestsRender.openRequest.name}:(\\d+):(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:requests:openRequest",
        );
        await CallbackQueryRequestsOpenRequest({
          ctx,
          bot: this,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(`^${RENDER_CALLBACKS.requestsRender.updatePage.name}:(\\d+)$`),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:requests:updatePage",
        );
        await CallbackQueryRequestsUpdatePage({
          ctx,
          bot: this,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.studyGroupsRender.openGroup.name}:(\\d+):(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:studyGroups:openGroup",
        );
        await CallbackQueryOpenClass({
          ctx,
          bot: this,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.studyGroupsRender.selectGroup.name}:(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:studyGroups:selectGroup",
        );
        const userId = extractUserId(ctx);
        const groupId = extractItemFromQuery(ctx, 1);
        if (!groupId) {
          this.logger.warn(
            { state: formatCtxForLog(ctx) },
            "callback:selectGroup:missingGroup",
          );
          await ctx.send(ctx.t(pl(ctx), "smthWentWrong"));
          return;
        }

        const homeworks = await this.homeworkRepository.GetHomeworks(
          Number.parseInt(groupId),
          ctx.access.role,
        );

        const state: AppState = {
          currentFlow: "createHomework",
          step: "readName",
          data: {
            studyGroupId: Number.parseInt(groupId),
            homeworks,
          },
        };

        await this.setState(userId, state);

        await ctx.send("Введите название домашнего задания:", {
          reply_markup: new Keyboard().add({ text: KEYBOARD_ANSWERS.cancel }),
        });
      },
    );

    bot.callbackQuery(
      new RegExp(`^${RENDER_CALLBACKS.management.groupHomeworks.name}:(\\d+)$`),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:management:groupHomeworks",
        );
        await CallbackQueryGroupHomeworks({
          ctx,
          bot: this,
          homeworkRepo: this.homeworkRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.management.setGrade.name}:(\\d+):(\\d+):(.+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:management:setGrade",
        );
        await CallbackQuerySetGrade({
          ctx,
          bot: this,
          homeworkRepo: this.homeworkRepository,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.management.gradeMenu.name}:(\\d+):(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:management:gradeMenu",
        );
        await CallbackQueryGradeMenu({
          ctx,
          bot: this,
          homeworkRepo: this.homeworkRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.studyGroupsRender.updatePage.name}:(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:studyGroups:updatePage",
        );
        await CallbackQueryClassUpdatePage({
          ctx,
          bot: this,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(`^${RENDER_CALLBACKS.management.homeworkUsers.name}:(\\d+)$`),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:management:homeworkUsers",
        );
        await CallbackQueryHomeworkUsers({
          ctx,
          bot: this,
          homeworkRepo: this.homeworkRepository,
          userRepo: this.userRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(`^${RENDER_CALLBACKS.management.deleteHomework.name}:(\\d+)$`),
      (ctx) =>
        CallbackQueryDeleteHomework({
          ctx,
          bot: this,
          homeworkRepository: this.homeworkRepository,
          userRepository: this.userRepository,
        }),
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.management.confirmDeleteHomework.name}:(\\d+)$`,
      ),
      (ctx) =>
        CallbackQueryConfirmDeleteHomework({
          ctx,
          bot: this,
          homeworkRepository: this.homeworkRepository,
          userRepository: this.userRepository,
        }),
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.management.cancelDeleteHomework.name}:(\\d+)$`,
      ),
      (ctx) =>
        CallbackQueryCancelDeleteHomework({
          ctx,
          bot: this,
          homeworkRepository: this.homeworkRepository,
          userRepository: this.userRepository,
        }),
    );

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.homeworksRender.openHomework.name}:(\\d+):(\\d+)$`,
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:homeworks:openHomework",
        );
        await CallbackQuerySelectHomework({
          bot: this,
          ctx,
          homeworkRepo: this.homeworkRepository,
        }).catch((e) => {
          this.logger.error(
            { err: e, state: formatCtxForLog(ctx) },
            "callback:openHomework:error",
          );
        });
      },
    );

    bot.callbackQuery(/Disapprove:(\d+)/, async (ctx) => {
      this.logger.info(
        { state: formatCtxForLog(ctx) },
        "callback:disapproveRequest",
      );
      await CallbackQueryDisapproveUserRequest({
        ctx,
        bot: this,
        userRepo: this.userRepository,
      });
    });

    bot.callbackQuery(/homeworks:(\d+)/, async (ctx) => {
      this.logger.info(
        { state: formatCtxForLog(ctx) },
        "callback:homeworks:render",
      );
      await CallbackQueryHomeworksRender({
        ctx,
        bot: this,
        userRepo: this.userRepository,
        homeworkRepo: this.homeworkRepository,
      });
    });

    bot.callbackQuery(
      new RegExp(
        `^${RENDER_CALLBACKS.homeworksRender.sendHomework.name}:(\\d+)`,
      ),
      async (ctx) => {
        const homeworkId = Number.parseInt(extractItemFromQuery(ctx, 1) || "");

        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:homeworks:sendHomework",
        );
        await CallbackQuerySendHomework({
          ctx,
          bot: this,

          userRepo: this.userRepository,
          homeworkRepo: this.homeworkRepository,
        });
      },
    );

    bot.callbackQuery(
      new RegExp(
        new RegExp(
          `^${RENDER_CALLBACKS.homeworksRender.deleteUserHomework.name}:(\\d+)$`,
        ),
      ),
      async (ctx) => {
        this.logger.info(
          { state: formatCtxForLog(ctx) },
          "callback:homeworks:deleteUserHomework",
        );
        const groupId = ctx.access.user?.studyGroupId;
        if (!groupId) {
          this.logger.error(
            { state: formatCtxForLog(ctx) },
            "study group id is null",
          );
          return;
        }
        try {
          const user = await this.getUser(extractUserId(ctx));

          const hwIdString = extractItemFromQuery(ctx, 1);

          if (!(user && hwIdString)) {
            this.logger.error(
              { state: formatCtxForLog(ctx) },
              "group or hwid is null",
            );
            return;
          }
          const hwId = Number.parseInt(hwIdString);
          if (Number.isNaN(hwId)) {
            this.logger.error(
              { state: formatCtxForLog(ctx), hwIdString },
              "Hw is NaN",
            );
            return;
          }
          const homework = await this.homeworkRepository.GetHomework(hwId);

          if (!homework) {
            this.logger.error(
              { state: formatCtxForLog(ctx), hwId },
              "homework is empty",
            );
            throw new Error("homework is empty");
          }
          const group = await this.userRepository.GetStudyGroupById(
            homework.studyGroupId,
          );

          if (!group) {
            this.logger.error(
              {
                state: formatCtxForLog(ctx),
                studyGroupId: homework.studyGroupId,
              },
              "group is empty",
            );
            throw new Error("group is empty");
          }

          const checked = await this.homeworkRepository.CheckChecked(
            hwId,
            user.id,
          );

          if (checked) {
            this.logger.info(
              { userId: user.id, hwId },
              "deleteUserHomework:alreadyChecked",
            );
            await ctx.send(
              "👀 Оцененное домашнее задание не может быть удалено или изменено",
            );
            return;
          }

          const ok = await deleteHomework({
            group,
            userName: buildUserFullname(user),
            homeworkName: homework.name,
          });

          if (ok) {
            await this.homeworkRepository.DeleteUserHomeworkRecord(
              homework.id,
              user.id,
            );

            const userGroups = await this.userRepository
              .GetUserGroups(user.id)
              .catch((e) => {
                this.logger.error(
                  { err: e, userId: user.id },
                  "Failed to get user GroupsIds",
                );
                throw e;
              });

            const homeworks =
              await this.homeworkRepository.GetCompletedHomeworks(
                user.id,
                (userGroups ?? []).map((g) => g.id),
                user.role,
              );
            const { text, reply_markup } = renderHomeworksPage(homeworks, 0);
            await ctx.editText(text, {
              reply_markup,
            });

            await ctx.send("Домашка удалена успешно");
            this.logger.info(
              { userId: user.id, hwId },
              "deleteUserHomework:done",
            );
          } else {
            await ctx.send("Что-то пошло не так");
            this.logger.warn(
              { userId: user.id, hwId },
              "deleteUserHomework:failed",
            );
          }
        } catch (e) {
          this.logger.error(
            {
              err: e,
              state: formatFullState(
                ctx,
                await this.loadState(extractUserId(ctx)),
              ),
            },
            "callback:deleteUserHomework:error",
          );
          await ctx.send("Что-то пошло не так");
        }
      },
    );

    // massive message handling logic
    bot.on("message", async (ctx) => {
      this.logger.info({ state: formatCtxForLog(ctx) }, "message:received");
      try {
        const userId = extractUserId(ctx);
        this.logger.debug(
          { userId: userId.toString() },
          "message:processing:userId",
        );

        const loadedState = await this.loadState(userId);
        this.logger.debug(
          { userId: userId.toString(), loadedState },
          "message:processing:loadedState",
        );

        // big state check

        let state: AppState = loadedState
          ? loadedState
          : (await this.getUser(userId))
            ? {
                currentFlow: "idle",
                step: "idle",
                data: {},
              }
            : {
                currentFlow: "registration",
                step: "notifyOfRegister",
                data: {},
              };

        this.logger.debug(
          { userId: userId.toString(), state },
          "message:processing:initialState",
        );

        if (ctx.text == KEYBOARD_COMMANDS.resendRequest) {
          this.logger.info(
            { userId: userId.toString() },
            "message:resendRequest",
          );
          if (this.users.get(userId)) {
            await this.removePreviousRequests(userId);
            await this.userRepository.DeleteUser(userId);
          }

          state = {
            currentFlow: "registration",
            step: "notifyOfRegister",
            data: {},
          };
        } else if (ctx.text == KEYBOARD_COMMANDS.register) {
          this.logger.info({ userId: userId.toString() }, "message:register");
          state = {
            currentFlow: "registration",
            step: "notifyOfRegister",
            data: {},
          };
        } else if (await this.getUser(userId)) {
          // finding handler for current action
          if (!REQUIRE_ACCEPTED(ctx)) {
            this.logger.info(
              { userId: userId.toString(), state: formatFullState(ctx, state) },
              "message:requireAccepted:blocked",
            );
            return;
          }
          switch (ctx.text) {
            case KEYBOARD_COMMANDS.manage: {
              if (!REQUIRE_ADMIN(ctx)) {
                this.logger.info(
                  {
                    userId: userId.toString(),
                    state: formatFullState(ctx, state),
                  },
                  "message:requireAdmin:blocked",
                );
                return;
              }

              this.logger.info(
                { userId: userId.toString() },
                "message:manage:invoked",
              );
              await HandleStudyGroup({
                ctx,
                bot: this,
                userRepo: this.userRepository,
              });

              return;
            }

            case KEYBOARD_COMMANDS.requests: {
              this.logger.info(
                { userId: userId.toString() },
                "message:requests:invoked",
              );
              await handleRequests({
                ctx,
                bot: this,
                userRepo: this.userRepository,
              });
              return;
            }

            case KEYBOARD_COMMANDS.homework: {
              this.logger.info(
                { userId: userId.toString() },
                "message:homework:invoked",
              );
              await handleHomeworks({
                ctx,
                bot: this,
                userRepo: this.userRepository,
                homeworkRepo: this.homeworkRepository,
              });
              return;
            }
            case KEYBOARD_COMMANDS.students: {
              if (!REQUIRE_ADMIN(ctx)) {
                this.logger.info(
                  {
                    userId: userId.toString(),
                    state: formatFullState(ctx, state),
                  },
                  "message:students:requireAdminBlocked",
                );
                return;
              }

              this.logger.info(
                { userId: userId.toString() },
                "message:students:invoked",
              );
              await handleStudents({
                ctx,
                bot: this,
                userRepo: this.userRepository,
              });
              return;
            }
            case KEYBOARD_COMMANDS.info: {
              this.logger.info(
                { userId: userId.toString() },
                "message:info:invoked",
              );
              await handleinfo({ ctx, bot: this });
              return;
            }
            case KEYBOARD_COMMANDS.lections || KEYBOARD_COMMANDS.requests: {
              this.logger.info(
                { userId: userId.toString() },
                "message:lections:featureUnavailable",
              );
              await ctx.send("Пока что фича недоступна(");
              return;
            }
            case KEYBOARD_COMMANDS.notify:
              if (!REQUIRE_ADMIN(ctx)) {
                this.logger.info(
                  {
                    userId: userId.toString(),
                    state: formatFullState(ctx, state),
                  },
                  "message:notify:requireAdminBlocked",
                );
                return;
              }
              this.logger.info(
                { userId: userId.toString() },
                "message:notify:init",
              );
              state.currentFlow = "notifyStudents";
              state.step = "notifyStudents_init";
          }
        }

        const handler = getStepHandler(state.currentFlow, state.step);
        this.logger.debug(
          {
            userId: userId.toString(),
            currentFlow: state.currentFlow,
            step: state.step,
            handlerExists: !!handler,
          },
          "message:handlerLookup",
        );

        if (!handler) {
          this.logger.info(
            { userId: userId.toString() },
            "message:noHandler:promptingSelection",
          );
          await ctx.send("Выберите действие из списка", {
            reply_markup: ctx.access.keyboard,
          });
          return;
        }

        if (isCancel(ctx)) {
          this.logger.info(
            { userId: userId.toString(), state: formatFullState(ctx, state) },
            "message:isCancel",
          );
          await ctx.send("Отменено.", {
            reply_markup: ctx.access.keyboard,
          });

          state.currentFlow = "idle";
          state.step = "idle";
          state.data = {};

          await this.storage.set(userId.toString(), JSON.stringify(state));
          this.logger.debug(
            { userId: userId.toString(), state },
            "message:isCancel:stateReset",
          );
          return;
        }

        // execute step handler with debug logging and contextual capture
        this.logger.debug(
          {
            userId: userId.toString(),
            currentFlow: state.currentFlow,
            step: state.step,
            text: ctx.text,
          },
          "message:handlerExecute:start",
        );
        const nextStep = await handler({ ctx, bot: this, state }).catch((e) => {
          this.logger.error(
            { err: e, state: formatFullState(ctx, state) },
            "message:handlerExecute:error",
          );
        });
        this.logger.debug(
          { userId: userId.toString(), nextStep },
          "message:handlerExecute:returned",
        );

        if (!nextStep) {
          this.logger.debug(
            { userId: userId.toString() },
            "message:handlerExecute:noNextStep",
          );
          return;
        }
        state.step = nextStep;

        if (nextStep == "createHomework_done") {
          this.logger.info(
            { userId: userId.toString(), state },
            "flow:createHomework_done:start",
          );
          try {
            await handleCreateHomeworkDone({
              ctx,
              state,
              homeworkRepo: this.homeworkRepository,
              userRepo: this.userRepository,
              bot: this,
            });
            resetState(state);
            this.logger.info(
              { userId: userId.toString() },
              "flow:createHomework_done:completed",
            );
          } catch (e) {
            this.logger.error(
              { err: e, userId: userId.toString() },
              "flow:createHomework_done:error",
            );
          }
        }

        if (nextStep === "sendHomework_done") {
          this.logger.info(
            { userId: userId.toString(), state },
            "flow:sendHomework_done:start",
          );
          const loadingMsg = await ctx.send("⌛", {
            reply_markup: {
              remove_keyboard: true,
            },
          });
          const kbd = getRelativeKeyboard(ctx.access.role);

          const userGroups = await this.userRepository
            .GetUserGroups(userId)
            .catch((e) => {
              this.logger.error(
                { err: e, userId: userId.toString() },
                "sendHomework_done:failedToGetUserGroups",
              );
            });

          let err = null;
          try {
            const homeworkId = Number.parseInt(state.data.homeworkId);
            const homework =
              await this.homeworkRepository.GetHomework(homeworkId);
            const homeworks =
              await this.homeworkRepository.GetCompletedHomeworks(
                userId,
                (userGroups ?? []).map((g) => g.id),
              );

            if (!homework) {
              this.logger.error(
                {
                  userId: userId.toString(),
                  homeworkId,
                  state: formatFullState(ctx, state),
                },
                "sendHomework_done:homeworkMissing",
              );
              // TODO: add to i18n
              await ctx.send("Домашка не существует, что-то пошло не так", {
                reply_markup: kbd,
              });
              return;
            }
            const homeworkCompleted = homeworks.some(
              (hw) => hw.id == homework.id && hw.completed,
            );
            const homeworkPath = state.data.homeworkPath;

            const user = await this.getUser(userId);

            if (!user) {
              // TODO: add to i18n
              await ctx.send("Что-то пошло не так", {
                reply_markup: kbd,
              });
              this.logger.error(
                { userId: userId.toString() },
                "sendHomework_done:userMissing",
              );
              return;
            }

            try {
              this.logger.info(
                { homeworkPath },
                "sendHomework_done:uploadStart",
              );

              const group = await this.userRepository.GetStudyGroupById(
                homework.studyGroupId,
              );
              if (!group) {
                throw new Error("group doesn't exist");
              }

              // const ok = await uploadHomeworkToDisk({
              //   filepath: homeworkPath,
              //   homeworkName: homework?.name,
              //   user,
              //   group,
              // });
              //

              const jwtToken = jwt.generate({
                groupTitle: group.title,
                homeworkName: homework.name,
                homeworkId,
                iat: 1000 * 60 * 5, // 5 minutes
                userName: buildUserFullname(user),
                exp: null,
                userId,
              });

              await ctx.send(
                `Отправьте файл по ссылке ${env.BASE_URL}/?token=${jwtToken}`,
              );

              const ok = true;
              if (!ok) {
                const errorText = "failed to load homework, please try again";
                this.logger.error(
                  { errorText, userId: userId.toString(), homeworkId },
                  "sendHomework_done:uploadFailed",
                );
                await ctx.send(errorText, { reply_markup: kbd });
                return;
              }

              if (!homeworkCompleted) {
                await this.homeworkRepository
                  .CompleteHomework({
                    homeworkId,
                    userId,
                  })
                  .catch(async (e) => {
                    this.logger.error(
                      {
                        err: e,
                        userId: userId.toString(),
                        state: formatFullState(ctx, state),
                        homeworkId,
                      },
                      "sendHomework_done:completeHomeworkFailed",
                    );
                    // TODO: add to i18n
                    await ctx.send(
                      "failed to upload homework, please report a bug",
                    );
                  });
              }
            } catch (e) {
              this.logger.error(
                {
                  err: e,
                  userId: userId.toString(),
                  state: formatFullState(ctx, state),
                },
                "sendHomework_done:uploadException",
              );
            }

            const file = Bun.file(homeworkPath);
            await file.delete();
            const folderPath = path.dirname(homeworkPath);
            await rm(folderPath, { recursive: true, force: true });

            // TODO: add to i18n
            await ctx.send(
              `Файл ${homework.name ? `для ${homework.name}` : ""} успешно ${homeworkCompleted ? "заменен" : "отправлен в облако"}`,
              { reply_markup: kbd },
            );

            const ids = await this.userRepository.GetAdminIds();

            // TODO: add to i18n
            await this.notify(
              ids,
              `*${user.name + " " + user.last_name} (${user.username ? `@${user.username}` : ""})* загрузил домашнее задание для ${homework.name}`,
              {
                parse_mode: "Markdown",
              },
            );
            this.logger.info(
              {
                userId: userId.toString(),
                homeworkId,
                state: formatFullState(ctx, state),
              },
              "sendHomework_done:success",
            );
          } catch (e) {
            this.logger.error(
              {
                err: e,
                userId: userId.toString(),
                state: formatFullState(ctx, state),
              },
              "sendHomework_done:error",
            );
            err = e;
            // TODO: add to i18n
            await ctx.send("Something went wrong", { reply_markup: kbd });
          } finally {
            ctx.deleteMessages([loadingMsg.id]);
          }

          if (err) {
            await ctx.send("Something went wrong");
          }
          resetState(state);
        } else if (nextStep === "registration_done") {
          this.logger.info(
            { userId: userId.toString(), state: formatFullState(ctx, state) },
            "flow:registration_done:start",
          );
          const splittedName = state.data.name.split(" ");

          const dto: CreateUserDTO = {
            username: ctx.from.username,
            id: userId,
            firstName: splittedName[1],
            lastName: splittedName[0],
            patronymic: splittedName[2],
            yandex_email: state.data.email as string,
          };

          let studyGroup = await this.userRepository.FindStudyGroup({
            grade: state.data.studyGroup.grade,
            letter: state.data.studyGroup.letter,
            title: state.data.studyGroup.title,
          });

          if (!studyGroup) {
            this.logger.debug(
              {
                studyGroupDto: state.data.studyGroup,
                state: formatFullState(ctx, state),
              },
              "registration_done:createStudyGroup",
            );
            studyGroup = await this.userRepository.CreateStudyGroup(
              state.data.studyGroup,
            );
          }

          const studyGroups = [studyGroup.id];
          if (studyGroup.title !== "Репетиторство") {
            const matolGroup = await this.userRepository.GetStudyGroupById(0);
            this.logger.info({ matolGroup }, "MATOL GROUP");
            if (!matolGroup) {
              this.logger.error({
                err: "matol group not found",
                state: formatFullState(ctx, state),
              });
              await ctx.send("Что-то пошло не так");
              throw new Error("matol group not found");
            }
            studyGroups.push(matolGroup.id);
          }

          await this.userRepository.CreateUser(dto, studyGroups);

          const receivers = await this.notifyNewRequest(dto, ctx);
          const receiversString = receivers.map(
            (item) => item.chatId.toString() + ":" + item.messageId.toString(),
          );

          await this.userRepository.CreateVerifyRequest(
            userId,
            receiversString,
          );

          resetState(state);
          this.logger.info(
            { userId: userId.toString(), receivers },
            "flow:registration_done:completed",
          );
        } else if (nextStep === "notifyStudents_done") {
          this.logger.info(
            { userId: userId.toString() },
            "flow:notifyStudents_done:start",
          );
          try {
            await this.persist();
            this.logger.info(
              { users: Array.from(this.users.keys()) },
              "notifyStudents_done:usersLoaded",
            );

            const who = Array.from(this.users.keys(), (s) => BigInt(s));

            // TODO: add to i18n
            await this.notify(
              who,
              `🔔 Сообщение от преподавателя: \n\n ${state.data.notifyStudentsText}`,
            );

            // TODO: add to i18n
            const kbd = getRelativeKeyboard(ctx.access.role);
            await ctx.send("Сообщение успешно отправлено", {
              reply_markup: kbd,
            });
            this.logger.info(
              { notifiedCount: who.length },
              "notifyStudents_done:sent",
            );
          } catch (e) {
            this.logger.error(
              { err: e, userId: userId.toString() },
              "notifyStudents_done:error",
            );
            // TODO: add to i18n
            await ctx.send("Something went wrong");
          }
          resetState(state);
        }
        if (nextStep) {
          state.step = nextStep;
        }

        await this.storage.set(userId.toString(), JSON.stringify(state));
        this.logger.debug(
          { userId: userId.toString(), state },
          "message:processing:finalStateSaved",
        );
      } catch (e) {
        this.logger.error(
          {
            err: e,
            state: formatFullState(
              ctx,
              await this.loadState(extractUserId(ctx)),
            ),
          },
          "message:processing:unhandledError",
        );
      }
    });

    this.bot = bot;

    // auto updating data (if there was force change in database)
    setInterval(async () => {
      this.logger.debug("periodic:persist:invoked");
      await this.persist();
    }, 5000);

    this.logger.info("init:done - bot handlers registered");
  }

  // __ UTILS __
}

/**
 * Create and initialize a Gramio Telegram bot instance.
 *
 * @param props - Configuration and dependencies for the bot (includes storage, userRepo, homeworkRepo and Telegram bot options)
 * @returns A fully initialized TelegramBot instance ready for use
 */
export async function CreateBot(props: GramioBotProps): Promise<GramioBot> {
  const bot = new GramioBot(props);
  await bot.init();
  return bot;
}
