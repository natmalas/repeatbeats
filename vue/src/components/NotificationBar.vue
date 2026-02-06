<template>
  <v-snackbar v-if="notif" v-model="show" :timeout="notif.timeout" :color="colorMap[notif.type]"
    location="bottom end" elevation="4" @timeout="store.clear">
    <v-icon start>
      {{ iconMap[notif.type] }}
    </v-icon>

    {{ notif.msg }}

    <template #actions>
      <v-btn icon @click="store.clear">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { storeToRefs } from 'pinia'

const store = useNotificationStore()
const { active } = storeToRefs(store)

const show = ref(false)
const notif = computed(() => active.value ?? null)

watch(active, (v) => {
  if (v) show.value = true
})

const colorMap = {
  error: 'error',
  warning: 'warning',
  success: 'success',
  info: 'info',
}

const iconMap = {
  error: 'mdi-alert-circle',
  warning: 'mdi-alert',
  success: 'mdi-check-circle',
  info: 'mdi-information',
}
</script>