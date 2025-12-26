<script lang="ts" setup>
import { fetchRecords } from '~/requests/records'
import { formatElapsedSeconds, formatStartedAt } from '~/utils/games'

const loadingState = ref(false)
const errorMessage = ref<string | null>(null)
const records = ref<RecordDTO[]>([])
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
        const res = await fetchRecords(api)
        if(res === undefined || res.records === undefined){
            errorMessage.value = 'Error fetching records'
            return
        }
        records.value = res.records
    }catch(e : unknown){
        errorMessage.value = (e as Error).message
    }finally{
        loadingState.value = false
    }
}
</script>


<template>
    <div class="py-4 w-full px-4">
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

                <TableComponent>
                    <template #tableHeader>
                        <tr>
                            <th class="py-2 px-3 font-semibold">Rank</th>
                            <th class="py-2 px-3 font-semibold">Score</th>
                            <th class="py-2 px-3 font-semibold">Duration</th>
                            <th class="py-2 px-3 font-semibold">Created</th>
                            <th class="py-2 px-3 font-semibold text-right">Action</th>
                        </tr>
                    </template>
                    <template #tableBody>
                        <tr v-for="record in records" :key="record.id" class="border-t border-black/10">
                            <td class="py-2 px-3 capitalize">{{ record.rank }}</td>
                            <td class="py-2 px-3">{{ record.score }}</td>
                            <td class="py-2 px-3">{{ formatElapsedSeconds(record.durationSec) }}</td>
                            <td class="py-2 px-3">{{ formatStartedAt(record.createdAt, now) }}</td>
                            <td class="py-2 px-3 text-right">
                                <NuxtLink
                                    :to="`/game/${record.gameId}`"
                                    class="inline-flex items-center justify-center px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80 text-black min-w-[80px]"
                                >
                                    <span>
                                        View
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
