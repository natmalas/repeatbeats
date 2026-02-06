<template>
    <v-form ref="form" v-model="isValid" @submit.prevent="onSubmit">
        <v-text-field v-model.trim="username" label="Username" autocomplete="name" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-account-outline" :rules="rules.username" class="mb-3" />

        <v-text-field v-model.trim="email" label="Email" type="email" autocomplete="email" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-email-outline" :rules="rules.email" class="mb-3" />

        <v-text-field v-model="password" label="Password" :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password" variant="outlined" density="comfortable" prepend-inner-icon="mdi-lock-outline"
            :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showPassword = !showPassword" :rules="rules.password" class="mb-3" />

        <v-text-field v-model="confirmPassword" label="Confirm password"
            :type="showConfirmPassword ? 'text' : 'password'" autocomplete="new-password" variant="outlined"
            density="comfortable" prepend-inner-icon="mdi-lock-check-outline"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
            @click:append-inner="showConfirmPassword = !showConfirmPassword" :rules="rules.confirmPassword"
            class="mb-2" />

        <v-alert v-if="errorMessage" type="error" variant="tonal" density="comfortable" class="mb-4" rounded="lg">
            {{ errorMessage }}
        </v-alert>

        <v-btn type="submit" color="primary" size="large" block :loading="loading" :disabled="!isValid || loading">
            Create account
        </v-btn>

        <div class="text-center mt-5">
            <span class="text-body-2 text-medium-emphasis">
                Already have an account?
            </span>
            <v-btn variant="text" class="text-body-2" @click="onGoToLogin">
                Sign in
            </v-btn>
        </div>
    </v-form>
</template>


<script setup>
import { apiRequest } from "@/services/http";
import { ref } from "vue";
import router from "@/router";
import { useAuthStore } from "@/stores/auth";

const props = defineProps(["hideDetails"])

const form = ref(null);
const isValid = ref(false);

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const showPassword = ref(false);
const showConfirmPassword = ref(false);

const loading = ref(false);
const errorMessage = ref("");

const rules = {
    username: [
        (v) => !!v || "Full name is required",
        (v) => (v && v.trim().length >= 2) || "Please enter your full name",
    ],
    email: [
        (v) => !!v || "Email is required",
        (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Enter a valid email",
    ],
    password: [
        (v) => !!v || "Password is required",
        (v) => (v && v.length >= 8) || "Minimum 8 characters"
    ],
    confirmPassword: [
        (v) => !!v || "Please confirm your password",
        (v) => v === password.value || "Passwords do not match",
    ],
};

async function onSubmit() {
    errorMessage.value = "";

    const result = await form.value?.validate?.();
    if (result && !result.valid) return;

    loading.value = true;
    try {

        const data = {
            username: username.value, email: email.value, password: password.value
        };

        const res = await useAuthStore().authenticate("register", data);

        if (!res?.ok) {
            errorMessage.value = res.message ?? "Unable to register at this time";
            return;
        }

        window.location.href = '/'
    } catch (e) {
        errorMessage.value =
            e?.message || "Registration failed. Please try again.";
    } finally {
        loading.value = false;
    }
}

function onGoToLogin() {
    useAuthStore().showLoginForm = true
}
</script>