<template>
    <v-form ref="form" v-model="isValid" @submit.prevent="onSubmit">
        <v-text-field v-model.trim="username" label="Username" type="username" autocomplete="username"
            variant="outlined" density="comfortable" prepend-inner-icon="mdi-email-outline" :rules="rules.username"
            class="mb-3" />

        <v-text-field v-model="password" label="Password" :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password" variant="outlined" density="comfortable"
            prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showPassword = !showPassword" :rules="rules.password" class="mb-2" />

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mb-4" rounded="lg">
            {{ errorMessage }}
        </v-alert>

        <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!isValid || loading">
            Sign in
        </v-btn>

        <div class="text-center mt-5">
            <span class="text-body-2 text-medium-emphasis">
                New here?
            </span>
            <v-btn variant="text" class="text-body-2" @click="switchToRegister">
                Create an account
            </v-btn>
        </div>
    </v-form>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "@/stores/auth";
import { apiRequest } from "@/services/http";
import router from "@/router";

const form = ref();
const isValid = ref(false);

const username = ref("");
const password = ref("");
const showPassword = ref(false);

const loading = ref(false);
const errorMessage = ref("");

const rules = {
    username: [
        v => (!!v || "Username is required")
    ],
    password: [
        v => !!v || "Password is required",
        v => v.length >= 8 || "Minimum 8 characters",
    ],
};

async function onSubmit() {
    errorMessage.value = "";

    const result = await form.value?.validate?.();
    if (result && !result.valid) return;

    loading.value = true;
    try {
        const data = {
            username: username.value, password: password.value
        };

        const res = await useAuthStore().authenticate("login", data);

        if (!res.ok) {
            errorMessage.value =
                res?.message || "Sign in failed. Please check your credentials.";
            return
        }

        if (res.ok) location.href = "/"
    } catch (e) {
        errorMessage.value =
            e?.message || "Sign in failed. Please check your credentials.";
    } finally {
        loading.value = false;
    }
}

function switchToRegister() {
    useAuthStore().showLoginForm = false
}
</script>