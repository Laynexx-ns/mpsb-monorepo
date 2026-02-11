import { createApp } from "vue";
import "./style.css";
import Aura from "@primeuix/themes/aura";
import Button from "primevue/button";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import App from "./App.vue";

const app = createApp(App);

// Prime vue settings
app.use(PrimeVue, {
	theme: {
		preset: Aura,
		options: {
			prefix: "p",
			darkModeSelector: "system",
			cssLayer: false,
		},
	},
});

app.use(ToastService);
app.component("Button", Button);

app.mount("#app");
