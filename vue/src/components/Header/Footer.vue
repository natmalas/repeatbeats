<template>
    <v-footer class="d-flex mt-12 align-center justify-center ga-2 flex-wrap flex-grow-1 py-3" color="surface-light">
        <v-btn v-for="link in links" :key="link.text" :text="link.text" variant="text" rounded
            :prepend-icon="link.icon" @click="go(link.url)"></v-btn>

        <div class="flex-1-0-100 text-center mt-2">
            &copy; {{ new Date().getFullYear() }}. Created by <span @click="go('site')" class="link">Nathaniel
                Malas</span>
        </div>
    </v-footer>
</template>

<script setup>
const links = [
    {
        text: "Github",
        icon: "mdi-github",
        url: "github"
    },
    {
        text: "Donate",
        icon: "mdi-coffee",
        url: "donate"
    }
]

const urls = {
    github: "",
    donate: "",
    site: ""
}

function go(v) {
    location.href = urls[v]
}
</script>

<style scoped>
.link {
    transition: 0.25s;
}

.link:hover {
    cursor: pointer;
    color: rgb(var(--v-theme-primary))
}
</style>