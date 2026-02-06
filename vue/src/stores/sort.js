import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'

export const useSortStore = defineStore('sort', () => {
    /* -------------------------------------------------------------------------- */
    /*                                    REFS                                    */
    /* -------------------------------------------------------------------------- */

    const showSort = ref(false)

    const sortBy = ref(localStorage.getItem('sort_by') ?? 'created_desc')

    const starredFirst = ref(
        localStorage.getItem('starred_first') === 'on'
    )

    const searchText = ref('')
    const isSearchOpen = ref(false)

    /* -------------------------------------------------------------------------- */
    /*                                SORT OPTIONS                                */
    /* -------------------------------------------------------------------------- */

    const sortOptions = ref([
        {
            title: 'Watch Time — High to Low',
            value: 'watch_time_desc',
            icon: 'mdi-timer-sand',
            direction: 'desc',
        },
        {
            title: 'Watch Time — Low to High',
            value: 'watch_time_asc',
            icon: 'mdi-timer-outline',
            direction: 'asc',
        },
        {
            title: 'Date Added — Newest First',
            value: 'created_desc',
            icon: 'mdi-calendar-arrow-left',
            direction: 'desc',
        },
        {
            title: 'Date Added — Oldest First',
            value: 'created_asc',
            icon: 'mdi-calendar-arrow-right',
            direction: 'asc',
        },
        {
            title: 'Last Updated',
            value: 'updated_desc',
            icon: 'mdi-update',
        },
    ])

    /* -------------------------------------------------------------------------- */
    /*                                  WATCHERS                                  */
    /* -------------------------------------------------------------------------- */

    watch(sortBy, v => {
        localStorage.setItem('sort_by', v)
    })

    watch(starredFirst, v => {
        localStorage.setItem('starred_first', v ? 'on' : 'off')
    })

    return {
        showSort,
        sortBy,
        starredFirst,
        searchText,
        isSearchOpen,

        sortOptions,
    }
})