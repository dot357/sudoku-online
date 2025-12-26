<script lang="ts" setup>
import { fetchGames } from '~/requests/games'
import { formatStartedAt, getActionLabel, getElapsed, getStatusLabel } from '~/utils/games'



const loadingState = ref(false)
const errorMessage = ref<string | null>(null)

const games = ref<GameSummaryDTO[]>([])
const fetchedAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null

const { api } = useApi()


onMounted(async () => {
    ticker = setInterval(() => {
        now.value = Date.now()
    }, 1000)
    await initialize()
})

onBeforeUnmount(() => {
    if (ticker) clearInterval(ticker)
})

async function initialize() {
    loadingState.value = true
    errorMessage.value = null
    try{

        const res = await fetchGames(api)

        if(res === undefined || res.games === undefined){
            errorMessage.value = 'Error fetching games'
            return
        }

        games.value = res.games
        fetchedAt.value = Date.now()
        
    }catch(e : unknown){
        errorMessage.value = (e as Error).message
    }finally{
        loadingState.value = false
    }
}

</script>



<template>
    <div class="py-4 w-full  px-4">
        <div v-if="loadingState" class="w-full"> 
            <div 
                class="skeleton skeleton-line custom-skeleton w-full" 
                style="
                    --lines: 3;
                "
                >
            </div>
        </div>
        <div v-else>
            <div v-if="errorMessage" class="mb-4 text-red-600">
                {{ errorMessage }}
            </div>
            <div v-else class="w-full overflow-x-auto h-[400px]">
                <table class="w-full border border-black/10 bg-white/70">
                    <thead class="bg-background/20  text-left ">
                        <tr>
                            <th class="py-2 px-3 font-semibold">Rank</th>
                            <th class="py-2 px-3 font-semibold">Status</th>
                            <th class="py-2 px-3 font-semibold">Score</th>
                            <th class="py-2 px-3 font-semibold">Elapsed</th>
                            <th class="py-2 px-3 font-semibold">Started</th>
                            <th class="py-2 px-3 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="game in games" :key="game.id" class="border-t border-black/10">
                            <td class="py-2 px-3 capitalize">{{ game.rank }}</td>
                            <td class="py-2 px-3 w-[100px]">{{ getStatusLabel(game.status) }}</td>
                            <td class="py-2 px-3">{{ game.score }}</td>
                            <td class="py-2 px-3" :class="`${game.paused ? 'text-red-600' : ''}`">{{ getElapsed(game, now, fetchedAt) }}</td>
                            <td class="py-2 px-3">{{ formatStartedAt(game.startedAt, now) }}</td>
                            <td class="py-2 px-3 text-right">
                                <NuxtLink
                                    :to="`/game/${game.id}`"
                                    class="inline-flex items-center justify-center px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80 text-black min-w-[80px] "
                                >
                                    <span>
                                        {{ getActionLabel(game) }}
                                    </span>
                                </NuxtLink>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>
