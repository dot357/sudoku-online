<script setup lang="ts">
import type { GameSummaryDTO, Rank } from '~/shared/types/sudoku'
import { createGame, fetchGames } from '~~/app/requests/games'

const { api } = useApi()
const router = useRouter()

const rank = ref<Rank>('beginner')
const games = ref<GameSummaryDTO[]>([])
const errorMsg = ref<string | null>(null)
const loading = ref(false)

async function loadGames() {
  errorMsg.value = null
  games.value = []
  try {
    const res = await fetchGames(api)
    games.value = res.games
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

async function createGame() {
  loading.value = true
  errorMsg.value = null
  try {
    const game = await createGame(api, { rank: rank.value })
    router.push(`/game/${game.id}`)
  } catch (e: any) {
    errorMsg.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(loadGames)
</script>

<template>
  <main class="aspect-[4/5] w-[min(517px,92vw)]">

    <section
    
    class="flex flex-col gap-4 items-center mt-12 px-4 py-2"
    >
      <label>
        Rank
        <select v-model="rank" style="margin-left:8px;">
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="hard">hard</option>
          <option value="expert">expert</option>
        </select>
      </label>

      <!-- <button :disabled="loading" @click="createGame" class="w-64 crimson-text text-xl bg-amber-300/20 px-4 py-2 font-semibold">
        {{ loading ? 'Creating...' : 'New game' }}
      </button> -->

      <button
  :disabled="loading"
  class="relative w-64 px-4 py-2 text-xl crimson-text border border-black/30"
  @click="createGame"
>

  <!-- amber tint overlay -->
  <span class="absolute inset-0 bg-amber-300/25 mix-blend-multiply"></span>

  <!-- content -->
  <span class="relative">
    {{ loading ? 'Creating...' : 'New game' }}
  </span>
</button>


      <!-- <NuxtLink to="/records" style="margin-left:auto;">Records</NuxtLink> -->
    </section>

    <p v-if="errorMsg" style="color:#c00;">{{ errorMsg }}</p>

    <!-- <section>
      <h2>Your games</h2>
      <button @click="loadGames">Refresh</button>

      <ul style="padding-left: 18px;">
        <li v-for="g in games" :key="g.id" style="margin: 10px 0;">
          <NuxtLink :to="`/game/${g.id}`">{{ g.id }}</NuxtLink>
          <span> — {{ g.rank }} — {{ g.status }} — score: {{ g.score }} — elapsed: {{ g.elapsedSec }}s</span>
          <span v-if="g.paused"> (paused)</span>
        </li>
      </ul>
    </section> -->


    <!-- Turn into a component -->
    <section>
      <h2 class="cm-sans italic text-2xl text-center mt-10">History</h2>
      
      <ul>
        <li 
        v-for="(game, gameIndex) in games"
        :key="game.id"
        >
        {{ game.rank }} — {{ game.status }} — score: {{ game.score }} — elapsed: {{ game.elapsedSec }}s
      </li>
      </ul>
    </section>
  </main>
</template>
