<script setup lang="ts">
import type { Rank } from '~/shared/types/sudoku'

const { api } = useApi()
const router = useRouter()

const rank = ref<Rank>('beginner')
const games = ref<any[]>([])
const errorMsg = ref<string | null>(null)
const loading = ref(false)

async function loadGames() {
  errorMsg.value = null
  games.value = []
  try {
    const res = await api<{ games: any[] }>('/api/games')
    games.value = res.games
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

async function createGame() {
  loading.value = true
  errorMsg.value = null
  try {
    const game = await api<{ id: string }>('/api/game/new', {
      method: 'POST',
      body: { rank: rank.value },
    })
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
  <main style="max-width: 900px; margin: 0 auto; padding: 24px;">
    <h1>Sudoku</h1>

    <section style="display:flex; gap:12px; align-items:center; margin:16px 0;">
      <label>
        Rank
        <select v-model="rank" style="margin-left:8px;">
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="hard">hard</option>
          <option value="expert">expert</option>
        </select>
      </label>

      <button :disabled="loading" @click="createGame">
        {{ loading ? 'Creating...' : 'New game' }}
      </button>

      <NuxtLink to="/records" style="margin-left:auto;">Records</NuxtLink>
    </section>

    <p v-if="errorMsg" style="color:#c00;">{{ errorMsg }}</p>

    <section>
      <h2>Your games</h2>
      <button @click="loadGames">Refresh</button>

      <ul style="padding-left: 18px;">
        <li v-for="g in games" :key="g.id" style="margin: 10px 0;">
          <NuxtLink :to="`/game/${g.id}`">{{ g.id }}</NuxtLink>
          <span> — {{ g.rank }} — {{ g.status }} — score: {{ g.score }} — elapsed: {{ g.elapsedSec }}s</span>
          <span v-if="g.paused"> (paused)</span>
        </li>
      </ul>
    </section>
  </main>
</template>
