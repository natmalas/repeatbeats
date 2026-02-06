<template>
    <v-empty-state action-text="Go Home" headline="Whoops, 404" title="Page not found" text="The page you were looking for does not exist"
        image="icon.png" @click:action="goHome"></v-empty-state>
</template>

<script setup>
function goHome() {
    location.href = '/'
}
</script>