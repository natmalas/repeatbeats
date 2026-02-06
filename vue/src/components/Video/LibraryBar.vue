<template>
    <div class="d-flex flex-row justify-space-between align-center mt-4">

        <div style="max-width: 45%" class="d-flex">
            <v-icon class="mr-4">mdi-music-note-eighth</v-icon>
            <span class="text-h6">All Videos ({{ searchResults.length }})</span>
        </div>
        <div class="d-flex flex-column justify-end" style="width: 45%">

            <div class="w-100 d-flex flex-row justify-end">

                <!-- SEARCH VIDEOS -->
                <div class="w-100 mr-1 search-wrapper">
                    <div class="search-container" :class="{ open: isSearchOpen }">
                        <v-text-field v-model="searchText" variant="underlined" density="compact" hide-details />
                    </div>
                    <v-btn data-tour="search-btn" icon :variant="isSearchOpen ? 'text' : 'elevated'"
                        @click="isSearchOpen = !isSearchOpen">
                        <v-icon icon="mdi-magnify" />
                    </v-btn>
                </div>

                <v-scroll-x-transition>
                    <div v-if="!isSearchOpen" class="d-flex flex-row">
                        <!-- STARRED FIRST -->
                        <v-btn data-tour="starred-first-btn" class="mr-1" @click="starredFirst = !starredFirst" icon>
                            <v-icon>{{ !starredFirst ? 'mdi-file-star-outline' : 'mdi-file-star' }}</v-icon>
                        </v-btn>

                        <!-- TOGGLE SORT -->
                        <v-btn data-tour="sort-btn" @click="showSort = !showSort" icon>
                            <v-icon>mdi-sort</v-icon>
                        </v-btn>
                    </div>
                </v-scroll-x-transition>
            </div>

            <!-- SORT VIDEOS -->
            <v-expand-transition>
                <div v-show="showSort">
                    <v-select v-model="sortBy" label="Sort videos by" :items="sortOptions" item-title="title"
                        class="mt-3" item-value="value" variant="outlined" density="comfortable"
                        prepend-inner-icon="mdi-sort">
                        <!-- Dropdown rows -->
                        <template #item="{ props, item }">
                            <v-list-item v-bind="props">
                                <template #prepend>
                                    <v-icon :icon="item.raw.icon" />
                                </template>
                            </v-list-item>
                        </template>

                        <!-- Selected value (ICON ONLY + direction) -->
                        <template #selection="{ item }">
                            <div class="d-flex align-center ga-1">
                                <span class="mr-2">{{ item.title }}</span>

                                <!-- Main icon -->
                                <v-icon size="18" :icon="item.raw.icon" />

                                <!-- Asc / Desc indicator -->
                                <v-icon v-if="item.raw.direction" size="16" :icon="item.raw.direction === 'asc'
                                    ? 'mdi-arrow-up'
                                    : 'mdi-arrow-down'
                                    " />
                            </div>
                        </template>
                    </v-select>
                </div>
            </v-expand-transition>
        </div>
    </div>
</template>

<script setup>
import { useDataStore } from '@/stores/data';
import { storeToRefs } from 'pinia';


const {
    allVideosSorted,
    searchResults,
    showSort,
    sortBy,
    starredFirst,
    searchText,
    isSearchOpen,
    sortOptions,
} = storeToRefs(useDataStore())
</script>

<style scoped>
/* -------------------------------------------------------------------------- */
/*                                   SEARCH                                   */
/* -------------------------------------------------------------------------- */
.search-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-end;
}

.search-container {
    width: 0;
    overflow: hidden;
    transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-container.open {
    width: 100%;
}
</style>