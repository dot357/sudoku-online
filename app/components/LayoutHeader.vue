<script lang="ts" setup>
import { RouterLink } from 'vue-router';


const menu = [
    { name: 'New game', path: '/' },
    { name: 'Games', path: '/games' },
    { name: 'Records', path: '/records' },
]

</script>


<template>
    <div>
            
        <div class="pb-4">
            <h1 class="cm-sans text-4xl font-bold uppercase text-center">
                <slot name="title" />
            </h1>

            <p class="text-center">
                <slot name="subtitle" />
            </p>
        </div>


            <!-- Nav -->
            <div class="w-full border-t py-4 border-stroke-light/60 border-b">
                <nav>
                    <ul class="flex flex-row gap-2 items-center justify-center">
                        <li v-for="item in menu" :key="item.name">
                            <router-link :to="item.path"  v-slot="{isActive}" >
                                <p :class="`${isActive ? 'font-bold' : 'underline'}`">
                                    {{ item.name }}
                                </p>
                            </router-link>
                        </li>
                    </ul>
                </nav>
            </div>
    </div>
</template>