<script lang="ts" setup>
import { createGame } from '~/requests/games'


const { api } = useApi()
const router = useRouter()

const loadingState = ref(false)
const errorMessage = ref<string | null>(null)

  const rank = ref<Rank>('beginner')

async function intentToCreateGame() {
  loadingState.value = true
  errorMessage.value = null
  try {
    const game = await createGame(api, { rank: rank.value })
    router.push(`/game/${game.id}`)
  } catch (e: Error | unknown) {
    errorMessage.value = (e as Error).message
  } finally {
    errorMessage.value = ''
    loadingState.value = false
  }
}


</script>

<template>
  <div class="px-4 py-10">
    
    <label class="flex flex-row justify-between border-b border-t py-2 border-stroke-light/40">
        <h2 class="cm-sans font-semibold text-xl">
          Rank
        </h2>
        <select v-model="rank" class="border px-2 border-stroke-light bg-black/10">
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </label>

       <div class="w-full flex flex-row items-center py-4">
          <button
          :disabled="loadingState"
          class="relative w-64 px-4 py-2 text-xl crimson-text border border-black/30 bg-amber-300/25 mx-auto cursor-pointer hover:bg-amber-300/40 disabled:cursor-not-allowed disabled:opacity-50 transition"
          @click="intentToCreateGame"
          >
            <span class="relative">
              {{ loadingState ? 'Creating...' : 'New game' }}
            </span>
        </button>
       </div>
  </div>
</template>