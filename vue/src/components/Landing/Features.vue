<template>
    <h1 class="mb-12 text-h4 bold text-md-h3 text-center font-weight-bold my-2">
        How it works
    </h1>
    <div class="d-flex flex-wrap flex-md-row flex-column w-100 justify-center align-center">
        <div v-for="c in steps"
            class="card w-md-33 w-100 bg-surface pa-6 d-flex flex-column justify-start align-center">
            <v-icon size="55" color="accent">{{ c.icon }}</v-icon>
            <p class="mt-5 mb-5 text-h5 bold">{{ c.title }}</p>
            <p class="text-center w-100">{{ c.subtitle }}</p>
        </div>
    </div>
    <v-divider class="mt-6 mb-12" />
    <h1 class="text-h4 mb-12 bold text-md-h3 text-center font-weight-bold my-2">
        Features
    </h1>
    <div class="d-flex flex-wrap flex-md-row flex-column w-100 justify-center align-center">
        <div v-for="c in features"
            class="card w-md-33 w-100 bg-surface pa-6 d-flex flex-column justify-start align-center">
            <v-icon color="primary" size="55">{{ c.icon }}</v-icon>
            <p class="mt-5 mb-5 text-h5 bold">{{ c.title }}</p>
            <p class="text-center w-100">{{ c.subtitle }}</p>
        </div>
    </div>
</template>

<script setup>
const steps = [
    {
        icon: "mdi-numeric-1",
        title: "Add a video",
        subtitle: "Paste the URL and it'll automatically be added to your account."
    },
    {
        icon: "mdi-numeric-2",
        title: "Customise presets",
        subtitle: "Set the start and end times & choose which sections to repeat or skip.",
    },
    {
        icon: "mdi-numeric-3",
        title: "Enjoy playback",
        subtitle: "Play any video on command and enjoy the customisation"
    }
]
const features = [
    {
        icon: "mdi-target",
        title: "Precise playback",
        subtitle: "Watch only the sections you care about."
    },
    {
        icon: "mdi-star",
        title: "Organise everything",
        subtitle: "Star, bookmark, and sort your collection.",
    },
    {
        icon: "mdi-palette",
        title: "Pick your style",
        subtitle: "Choose from 9+ clean themes of different moods."
    }
]
</script>

<style scoped>
.card {
    height: 250px;
    transition: transform 0.25s ease;
}

.card:hover {
    opacity: 0.8
}

@media only screen and (max-width: 600px) {
    .card {
        height: 200px
    }
}
</style>