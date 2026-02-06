import { useNotificationStore } from "@/stores/notification"

export function useNotify() {
    const store = useNotificationStore()
    const timeout = 3000

    return {
        success: (msg, t = timeout) => store.push(msg, 'success', t),
        error: (msg, t = timeout) => store.push(msg, 'error', t),
        warn: (msg, t = timeout) => store.push(msg, 'warning', t),
        info: (msg, t = timeout) => store.push(msg, 'info', t),
    }
}