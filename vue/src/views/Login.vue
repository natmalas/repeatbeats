<template>
    <v-container class="fill-height">
        <v-row align="center" justify="center" class="py-10">
            <v-col cols="12" sm="10" md="6" lg="4">
                <v-card class="pa-6" elevation="2" rounded="xl">
                    <div class="text-center mb-6">
                        <div class="d-flex justify-center w-100">
                            <Icon :size="100" />
                        </div>

                        <div class="mt-4 text-h5">Welcome back</div>
                        <div class="text-body-2 text-medium-emphasis">
                            Sign in to continue
                        </div>
                    </div>

                    <LoginForm v-if="showLoginForm" />
                    <RegisterForm v-else />
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import Icon from "@/components/Header/Icon.vue";
import LoginForm from "@/components/Auth/LoginForm.vue";
import { computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import RegisterForm from "@/components/Auth/RegisterForm.vue";

const showLoginForm = computed(() => useAuthStore().showLoginForm)
</script>

<style scoped>
.fill-height {
    min-height: 100vh;
}
</style>
