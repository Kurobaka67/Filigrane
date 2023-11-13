<script setup lang="ts">
import { ref } from "vue";
import VueSelect from 'vue-next-select'
import "vue-next-select/dist/index.css";
import SecurePDF from '../components/SecurePDF.vue'

const options = [
  {value: 'en', label:'English', flag:'englishFlagIcon'},
  {value: 'fr', label:'Français', flag:'frenchFlagIcon'},
  {value: 'de', label:'Deutsch', flag:'germanFlagIcon'},
  {value: 'es', label:'Español', flag:'spanishFlagIcon'}
];

function changeLang(value) {
  localStorage.setItem("lang", value)
}
</script>

<template>
    <VueSelect v-model="$i18n.locale" :options="options" label-by="label" value-by="value" @update:modelValue="value => changeLang(value)" hide-selected close-on-select>
        <template #label="option">
          <img :src="'/src/assets/'+option.selected.flag+'.svg'" style="width: 20px">
          <span>{{ option.selected.label }}</span>
        </template>
        <template #dropdown-item="option">
          <img :src="'/src/assets/'+option.option.flag+'.svg'" style="width: 20px">
          <span>{{ option.option.label }}</span>
        </template>
    </VueSelect>
    <SecurePDF />
</template>
