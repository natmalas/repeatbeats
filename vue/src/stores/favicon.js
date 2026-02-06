import { defineStore, storeToRefs } from 'pinia'
import { useTheme } from "vuetify/lib/composables/theme";
import { ref, watch, computed } from "vue";

export const useFaviconStore = defineStore('favicon', () => {
    const path =
        "M20,8H4V6H20V8M18,2H6V4H18V2M22,12V20A2,2 0 0,1 20,22H4A2,2 0 0,1 2,20V12A2,2 0 0,1 4,10H20A2,2 0 0,1 22,12M16,16L10,12.73V19.26L16,16Z";
    
    const colors = useTheme().current.value.colors
    const html = ref(`
         <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors['background']}" />
      <stop offset="50%" stop-color="${colors['primary']}" />
      <stop offset="100%" stop-color="${colors['secondary']}" />
    </linearGradient>
  </defs>
  <path fill="url(#grad)" d="${path}" />
  `)

    function updateFavicon(colors) {
        html.value = `  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colors['background']}" />
      <stop offset="50%" stop-color="${colors['primary']}" />
      <stop offset="100%" stop-color="${colors['secondary']}" />
    </linearGradient>
  </defs>
  <path fill="url(#grad)" d="${path}" />`
    }

    return {
        html,

        updateFavicon
    }
})