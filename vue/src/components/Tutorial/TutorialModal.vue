<template>
    <v-dialog v-model="showTutorial" max-width="700">
        <div style="height: 500px; max-height: 75vh; overflow-y: auto" class="pa-6 w-100 bg-surface">
            <div class="d-flex w-100 h-100 flex-column">
                <div class="d-flex w-100 h-100 flex-column justify-center mb-4">
                    <div class="d-flex flex-column w-100 align-center justify-center">
                        <v-icon size="50">{{ slide.icon }}</v-icon>
                        <p class="mt-4 w-100 text-center text-h5">{{ slide.title }}</p>
                    </div>
                <v-divider class="mt-0 mb-4" />

                <p class="text-h6 w-100 text-center">{{ slide.text }}</p>
                </div>

                <div class="mt-auto w-100 d-flex justify-space-between align-center">
                    <v-btn icon variant="text" @click="slideIndex = slideIndex-1" v-if="slideIndex > 0">
                        <v-icon>mdi-arrow-left</v-icon>
                    </v-btn>
                    <v-btn class="ml-auto" icon variant="text" @click="slideIndex = slideIndex+1" v-if="slideIndex < slides.length -1 && slideIndex > 0">
                        <v-icon>mdi-arrow-right</v-icon>
                    </v-btn>
                    
                    <v-btn class="ml-auto" variant="elevated" color="primary" @click="slideIndex++" v-if="slideIndex === 0">
                        Get started
                    </v-btn>
                    <v-btn class="ml-auto" variant="elevated" color="primary" @click="finishTutorial" v-if="slideIndex === slides.length-1">
                        Finish
                    </v-btn>
                </div>
            </div>
        </div>
    </v-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useTutorialStore } from '@/stores/tutorial'

const {
    showTutorial,
    slideIndex,
    slides
} = storeToRefs(useTutorialStore())
const { finishTutorial } = useTutorialStore()

const slide = computed(() => slides.value[slideIndex.value])
</script>