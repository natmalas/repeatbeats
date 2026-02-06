import { defineStore } from 'pinia'
import { apiRequest } from '@/services/http'
import { ref, computed, watch } from 'vue'
import { local } from '@/db/local'

export const useAuthStore = defineStore('auth', () => {
    /* -------------------------------------------------------------------------- */
    /*                                    REFS                                    */
    /* -------------------------------------------------------------------------- */
    
    const username = ref(localStorage.getItem("username") ?? null)
    const token = ref(localStorage.getItem("token") ?? null)
    const audio_allowed = ref(localStorage.getItem("audio_allowed") ?? false)

    const isAuthenticated = computed(() => token.value !== null)
    const canUseAudio = computed(() => audio_allowed.value !== false)

    const isLoggingOut = ref(false)
    
    const showLoginForm = ref(true)

    /* -------------------------------------------------------------------------- */
    /*                                  FUNCTIONS                                 */
    /* -------------------------------------------------------------------------- */
    
    function setAuth(usn, tokn, can_audio) {
        username.value = usn
        token.value = tokn

        localStorage.setItem('username', username.value)
        localStorage.setItem('token', token.value)

        if (can_audio) localStorage.setItem("audio_allowed", 1)
    }

    function clearAuth() {
        username.value = null
        token.value = null

        localStorage.removeItem('username')
        localStorage.removeItem('token')
        localStorage.removeItem("audio_allowed")
    }

    async function authenticate(type, data) {
        clearAuth();

        if (!["login", "register"].includes(type)) return;

        const res = await apiRequest({ method: "POST", url: `auth/${type}`, data: data })

        if (!res?.ok) return res;

        const usn = res?.data?.username;
        const tokn = res?.data?.token;
        const can_audio = res?.data.audio_allowed;

        if (type === "register") localStorage.setItem("play-tutorial", 1)

        if (usn && tokn) {
            setAuth(usn, tokn, can_audio);

            return {
                ok: true,
                token: tokn
            }
        }

        return {
            ok: false
        }
    }

    async function logout() {
        if (isLoggingOut.value) return

        try {
            isLoggingOut.value = true

            await local().clearData()

            const res = await apiRequest({ method: "GET", url: "auth/logout" })

            localStorage.removeItem("audio_allowed")

            if (!res?.ok) {
                console.error("Failed to logout", res.message)
                clearAuth()
                location.reload()
                return
            }
        } catch (e) {
            clearAuth()
            location.reload()
            return
        }

        clearAuth()
        location.reload()
    }

    return {
        isLoggingOut,

        showLoginForm,

        authenticate,
        logout,

        username,
        token,

        isAuthenticated,
        canUseAudio,
    }
})