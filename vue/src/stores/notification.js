import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

let id = 0

export const useNotificationStore = defineStore('notifications', () => {
  const queue = ref([])
  const active = computed(() => queue.value[0] ?? null)

  const push = (msg, type = 'info', timeout = 5000) => {
    queue.value.unshift({
      id: id++,
      msg,
      type,
      timeout
    })
  }

  const clear = () => {
    queue.value = []
  }

  return {
    active,

    push,
    clear
  }
})