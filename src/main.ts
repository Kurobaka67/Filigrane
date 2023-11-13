import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import messages from './lang'

import App from './App.vue'
import router from './router'

import { Chrome, create } from '@ckpack/vue-color';

const app = createApp(App);
const larray = ['en', 'fr', 'de', 'es']
const l = larray.some(lang => localStorage.getItem('lang')?.includes(lang))?localStorage.getItem('lang'):'en' as string;

app.use(createPinia());
app.use(router);

const i18n = createI18n({
  locale: l,
  allowComposition: true,
  messages
});

app.use(i18n);

app.use(create({
    components: [Chrome],
  }));
app.mount('#app');
