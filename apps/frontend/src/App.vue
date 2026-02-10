<template>
  <div class="pt-[40vh] h-full flex flex-col items-center">
    <Toast class="max-w-[80vw]" />
    <div v-if="tokenPayload" class="card flex flex-col gap-6">
      <div class="flex flex-col w-full text-left gap-2">
        <h3 class="text-2xl">
          Загрузите домашку в PDF файле для
          <b>{{ tokenPayload.homeworkName }}</b>
        </h3>
        <span class="text-white/60"
          >Вы зарегистрированы как <b>{{ tokenPayload.userName }}</b></span
        >
      </div>

      <FileUpload
        v-if="!file"
        mode="basic"
        accept=".pdf"
        @select="onFileSelect"
        customUpload
        auto
        class="p-button-outlined"
      />

      <div v-if="file" class="flex max-w-[88vw] flex-col gap-4">
        <div
          class="flex items-center border border-gray-700 p-4 gap-4 justify-between rounded-3xl"
        >
          <File weight="BoldDuotone" />
          <span class="truncate flex-1">{{ file.name }}</span>
          <span>{{ formatSize(file.size) }}</span>
          <Button
            @click="deleteFile"
            severity="danger"
            :disabled="isSending || file == null"
          >
            <TrashBin2 weight="BoldDuotone" />
          </Button>
        </div>

        <Button
          :disabled="isSending"
          @click="handleSendFile"
          rounded
          class="rounded-3xl"
        >
          <div v-if="!isSending" class="flex gap-2">
            <MapArrowRight weight="BoldDuotone" /> <b>Отправить</b>
          </div>
          <Refresh v-else class="animate-spin" weight="BoldDuotone" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Toast from "primevue/toast";
import { useToast } from "primevue/usetoast";
import { onMounted, ref } from "vue";
import { File, TrashBin2, MapArrowRight, Refresh } from "@solar-icons/vue";
import FileUpload from "primevue/fileupload";
import { type JWTPayload } from "@mpsb-monorepo/jwt-types";

const toast = useToast();

const file = ref<Blob | null>(null);
const tokenPayload = ref<JWTPayload | null>(null);
const isSending = ref<boolean>(false);

const BASE_URL = import.meta.env.VITE_BASE_URL;

function onFileSelect(event: any) {
  const selected = event.files[0];
  file.value = selected;

  const reader = new FileReader();

  reader.readAsDataURL(selected);
}

function deleteFile() {
  file.value = null;
}

onMounted(async () => {
  try {
    const payload = await verifyUser();
    tokenPayload.value = payload;
  } catch (e) {
    toast.add({
      severity: "error",
      summary: "Не зарегистрирован",
      detail:
        "Неоходимо открывать сайт только через бота. Если вы открывали через бота, сообщите об ошибке",
    });
    console.error(e);
  }
  console.log(tokenPayload.value);
});

const handleSendFile = async () => {
  const token = getToken();

  if (!file.value) {
    return;
  }
  const formData = new FormData();
  formData.append("file", file.value);

  try {
    isSending.value = true;
    await fetch(`${BASE_URL}/homework`, {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.add({
      severity: "success",
      summary: "Файл успешно загружен",
      detail:
        "Домашнее задание уже находится в облаке, но вы все еще можете его изменить в любой момент",
      life: 5000,
    });
  } catch (e) {
    console.error(e);
    toast.add({
      severity: "error",
      summary: "Что-то пошло не так",
      detail: "Пожалуйста сообщите об ошибке",
      life: 5000,
    });
  } finally {
    isSending.value = false;
  }
};

const getToken = () => {
  const params = new URLSearchParams(document.location.search);
  return params.get("token");
};

const verifyUser = async (): Promise<JWTPayload> => {
  const token = getToken();

  if (!token) {
    throw new Error("token is empty");
  }

  const resp = await fetch(`${BASE_URL}/verify`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!resp) throw new Error("response body is empty");

  const payload = (await resp.json()).jwtpayload as JWTPayload;

  if (resp.status !== 200) throw new Error("request failed");
  return payload;
};

function formatSize(size: number): string {
  return `${(size / 1024 / 1024).toPrecision(2)} MB`;
}
</script>
