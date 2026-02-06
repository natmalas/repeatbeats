<template>
  <v-app app>
    <v-main>
      <AppHeader />
      <router-view v-slot="{ Component }">
        <component :is="Component" />
      </router-view>
      <NotificationBar />
    </v-main>
  </v-app>
  <Footer />
  <TutorialModal />
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import AppHeader from "./components/Header/AppHeader.vue";
import NotificationBar from "./components/NotificationBar.vue";
import Footer from "./components/Header/Footer.vue";

import { useFaviconStore } from './stores/favicon';
import TutorialModal from './components/Tutorial/TutorialModal.vue';

/* -------------------------------------------------------------------------- */
/*                                   FAVICON                                  */
/* -------------------------------------------------------------------------- */

const icon = computed(() => useFaviconStore().html)

function updateSvg() {
  const html = useFaviconStore().html
  const svg = `<svg height="100" width="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    ${html}
    </svg>`

  const encoded = encodeURIComponent(svg)
    .replace(/'/g, "%27")
    .replace(/"/g, "%22");

  const href = `data:image/svg+xml,${encoded}`;

  let link =
    document.querySelector < HTMLLinkElement > ("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = href;
}

watch(
  () => icon, (v) => {
    updateSvg()
  },
  { immediate: true, deep: true }
);
</script>