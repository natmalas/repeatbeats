<template>
    <div fluid class="hero-section flex-column section d-flex align-center justify-center position-relative">
        <div class="w-md-75 w-100 pa-6 mt-0 d-flex justify-center align-center flex-column">
            <div class="w-100 mb-6 d-flex justify-center">
                <Icon :size="100" />
            </div>
            <p class="text-h3 mb-12 text-center bold">Listen smarter. Watch cleaner. YouTube videos, the way you want</p>

            <div class="text-h6 text-center mb-8">
                Create looping presets, skip unwanted sections, star favourites, and replay exactly what you want
                powered by a clean, customisable interface.
            </div>

            <div class="d-flex w-100 flex-row flex-wrap justify-space-between">
                <v-btn style="width: 52%" variant="elevated" color="primary" size="x-large"
                    @click="scrollToRegister">get
                    started</v-btn>
                <v-btn style="width: 44%" variant="elevated" color="primary" size="x-large" @click="scrollToDemo">view
                    demo</v-btn>
            </div>
        </div>
    </div>

    <div id="features" class="d-flex section features-section">
        <div class="w-100 h-100 pa-6 d-flex flex-column">
            <Features />
        </div>
    </div>

    <div id="demo" class="d-flex justify-center align-center section demo-section">
        <div class="w-100 h-100 d-flex flex-column">
            <h1 class="mb-4 mt-12 text-h4 bold text-md-h2 text-center font-weight-bold my-2">
                Try it out
            </h1>
            <p class="text-h6 text-center">
                Experiment with real presets and see how RepeatBeats reshapes video playback.
            </p>
            <div class="d-flex">
                <Preview />
            </div>
        </div>
    </div>

    <div id="register" class="d-flex justify-center align-center section register-section">
        <div class="w-100 pa-6 h-100 d-flex flex-column">
            <div class="mb-0 w-100 mt-4 pa-6 d-flex w-100 align-center justify-center flex-column">
                <h3 class="text-h3 bold text-center w-100 font-weight-medium mb-4">
                    Create an account for free
                </h3>

                <p class="text-h6 mb-12 text-center w-100">
                    Take control of your playback
                </p>

                <v-card class="w-md-50 w-100 pa-6" elevation="2" rounded="xl">
                    <RegisterForm />
                </v-card>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

import Preview from '@/components/Preview.vue'
import Features from '@/components/Landing/Features.vue'
import RegisterForm from '@/components/Auth/RegisterForm.vue'
import Icon from '@/components/Header/Icon.vue'

const scrollToRegister = () => {
    const el = document.getElementById("register")

    if (!el) return

    el.scrollIntoView(true, {
        behavior: "smooth",
        block: "start"
    })
}

const scrollToDemo = () => {
    const el = document.getElementById("demo")

    if (!el) return

    el.scrollIntoView({
        behavior: "smooth",
        block: "start"
    })
}
</script>

<style scoped>
html {
    scroll-snap-type: y mandatory;
}

.section {
    min-height: 100vh;
    scroll-snap-align: start;
}

.features-section {
    background: rgba(var(--v-theme-surface), 0.5);
}

.register-section {
    background: rgba(var(--v-theme-surface), 0.5);
}

.hero-section {
    background: rgb(var(--v-theme-background))
}
</style>