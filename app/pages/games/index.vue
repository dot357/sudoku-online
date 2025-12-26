<script lang="ts" setup>
import { fetchGames } from '~/requests/games'
import { formatStartedAt, getActionLabel, getElapsed, getElapsedSeconds, getStatusLabel } from '~/utils/games'



const loadingState = ref(false)
const errorMessage = ref<string | null>(null)

const games = ref<GameSummaryDTO[]>([])
const fetchedAt = ref(0)
const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | null = null
const sortKey = ref<'rank' | 'score' | 'elapsed' | 'started'>('started')
const sortDir = ref<'asc' | 'desc'>('desc')

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

const rankOrder: Record<string, number> = {
    expert: 4,
    hard: 3,
    intermediate: 2,
    beginner: 1
}

function setSort(key: 'rank' | 'score' | 'elapsed' | 'started') {
    if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
        return
    }
    sortKey.value = key
    sortDir.value = 'desc'
}

function sortIndicator(key: 'rank' | 'score' | 'elapsed' | 'started') {
    if (sortKey.value !== key) return ''
    return sortDir.value === 'asc' ? '↑' : '↓'
}

const sortedGames = computed(() => {
    const dir = sortDir.value === 'asc' ? 1 : -1
    const nowMs = now.value
    const fetchedAtMs = fetchedAt.value
    return [...games.value].sort((a, b) => {
        if (sortKey.value === 'rank') {
            const rankA = rankOrder[a.rank] ?? 0
            const rankB = rankOrder[b.rank] ?? 0
            return (rankA - rankB) * dir
        }
        if (sortKey.value === 'score') {
            return (a.score - b.score) * dir
        }
        if (sortKey.value === 'elapsed') {
            const elapsedA = getElapsedSeconds(a, nowMs, fetchedAtMs)
            const elapsedB = getElapsedSeconds(b, nowMs, fetchedAtMs)
            return (elapsedA - elapsedB) * dir
        }
        const startedAtA = new Date(a.startedAt).getTime()
        const startedAtB = new Date(b.startedAt).getTime()
        return (startedAtA - startedAtB) * dir
    })
})

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
            <div v-else class="w-full overflow-x-auto h-[70dvh]">
                <!-- Lets make this table as a component -->

                <TableComponent>
                    <template #tableHeader>
                        <tr>
                            <th class="py-2 px-3 font-semibold">
                                <button type="button" class="inline-flex items-center gap-2" @click="setSort('rank')">
                                    Rank
                                    <span class="text-xs">{{ sortIndicator('rank') }}</span>
                                </button>
                            </th>
                            <th class="py-2 px-3 font-semibold">Status</th>
                            <th class="py-2 px-3 font-semibold">
                                <button type="button" class="inline-flex items-center gap-2" @click="setSort('score')">
                                    Score
                                    <span class="text-xs">{{ sortIndicator('score') }}</span>
                                </button>
                            </th>
                            <th class="py-2 px-3 font-semibold">
                                <button type="button" class="inline-flex items-center gap-2" @click="setSort('elapsed')">
                                    Elapsed
                                    <span class="text-xs">{{ sortIndicator('elapsed') }}</span>
                                </button>
                            </th>
                            <th class="py-2 px-3 font-semibold">
                                <button type="button" class="inline-flex items-center gap-2" @click="setSort('started')">
                                    Started
                                    <span class="text-xs">{{ sortIndicator('started') }}</span>
                                </button>
                            </th>
                            <th class="py-2 px-3 font-semibold text-right">Action</th>
                        </tr>
                    </template>
                    <template #tableBody>
                         <tr v-for="game in sortedGames" :key="game.id" class="border-t border-black/10">
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
                    </template>
                    
                </TableComponent>
            </div>
        </div>
    </div>
</template>
