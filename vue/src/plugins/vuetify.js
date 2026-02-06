import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "@mdi/font/css/materialdesignicons.css";

export const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: localStorage.getItem('selected-theme') ?? 'light',
    themes: {
      light: {
        dark: false,
        colors: {
          background: "#F7F9FB",
          surface: "#ECEFF3",

          primary: "#7FA6C9",
          secondary: "#B9CCE0",
          accent: "#3F6FA3",

          onBackground: "#2A323B",
          onSurface: "#2A323B",
          onPrimary: "#FFFFFF",
          onSecondary: "#243445",
        },
      },

      dark: {
        dark: true,
        colors: {
          background: "#0B0E14",
          surface: "#141A23",

          primary: "#6C7CFF",
          secondary: "#3FD1C7",
          accent: "#F43F8C",

          onBackground: "#E9EEFA",
          onSurface: "#E9EEFA",
          onPrimary: "#FFFFFF",
          onSecondary: "#062E2A",
        },
      },

      mossStone: {
        dark: false,
        colors: {
          background: '#F4F6F2',
          surface: '#E7EBE4',
          primary: '#6B7F6A',
          secondary: '#9FB2A1',
          accent: '#4F6356',
          onBackground: '#2E332F',
        },
      },

      deepOcean: {
        dark: true,
        colors: {
          background: '#0C1721',
          surface: '#132332',
          primary: '#1E88E5',
          secondary: '#4FC3F7',
          accent: '#7DD3FC',
          onBackground: '#E6F2FF',
        },
      },

      sakuraMist: {
        dark: false,
        colors: {
          background: '#FFF7F9',
          surface: '#FCECEF',
          primary: '#E9A3B2',
          secondary: '#F3C6CF',
          accent: '#C67A8A',
          onBackground: '#40272E',
        },
      },

      desertDusk: {
        dark: false,
        colors: {
          background: '#FFF1E0',
          surface: '#F4DEC6',
          primary: '#C58B5B',
          secondary: '#E0B084',
          accent: '#8B4A2F',
          onBackground: '#3C2418',
        },
      },

      auroraNight: {
        dark: true,
        colors: {
          background: '#070A12',
          surface: '#0F1625',
          primary: '#7C7CFF',
          secondary: '#4ADEDE',
          accent: '#F472B6',
          onBackground: '#E9ECFF',
        },
      },

      matchaLatte: {
        dark: false,
        colors: {
          background: '#F8FAF6',
          surface: '#EDF1E9',
          primary: '#9DB8A0',
          secondary: '#C7D8C8',
          accent: '#6C8F70',
          onBackground: '#2F3A31',
        },
      },

      emberNoir: {
        dark: true,
        colors: {
          background: '#0F0B09',
          surface: '#1A1411',
          primary: '#F97316',
          secondary: '#FDBA74',
          accent: '#DC2626',
          onBackground: '#F5ECE6',
        },
      },

      softEarth: {
        dark: false,
        colors: {
          background: '#FFF2DE',
          surface: '#F6E7D3',

          primary: '#B8AB9B',
          secondary: '#D4E1DD',

          accent: '#9FA79D',
          info: '#8FB3AD',
          success: '#7FAF9B',
          warning: '#D6B98C',
          error: '#C97C74',

          onBackground: '#3F3A34',
          onSurface: '#3F3A34',
          onPrimary: '#FFFFFF',
          onSecondary: '#2F3B38',
        },
      },
    },
  },
});
