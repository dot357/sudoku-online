<script setup lang="ts">
import type { CellValue, GamePublicStateDTO, HintResponseDTO, MoveResponseDTO } from '~/shared/types/sudoku'
import { debugSolveGame, fetchGame, pauseGame, requestHint, resumeGame, sendMove as sendMoveRequest } from '~~/app/requests/game'

const isDev = import.meta.env.DEV

const route = useRoute()
const { api } = useApi()

const id = computed(() => String(route.params.id))
const game = ref<GamePublicStateDTO | null>(null)
const selectedIndex = ref<number | null>(null)
const lastMove = ref<MoveResponseDTO['move'] | null>(null)
const lastHint = ref<HintResponseDTO['hint'] | null>(null)
const elapsedSec = ref(0)
const timerId = ref<number | null>(null)
const isPaused = computed(() => game.value?.paused === true)

const errorMsg = ref<string | null>(null)
const lastMoveInfo = ref<string | null>(null)

async function load() {
  errorMsg.value = null
  lastMoveInfo.value = null
  lastMove.value = null
  lastHint.value = null
  game.value = await fetchGame(api, id.value)
}

function selectCell(i: number) {
  selectedIndex.value = i
}

function formatElapsed(totalSec: number) {
  const hours = Math.floor(totalSec / 3600)
  const minutes = Math.floor((totalSec % 3600) / 60)
  const seconds = totalSec % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(seconds)}`
  return `${minutes}:${pad(seconds)}`
}

function stopTimer() {
  if (timerId.value !== null) {
    window.clearInterval(timerId.value)
    timerId.value = null
  }
}

function startTimer() {
  stopTimer()
  if (!game.value) return
  elapsedSec.value = game.value.elapsedSec
  if (game.value.status !== 'in_progress' || game.value.paused) return
  let lastTick = Date.now()
  timerId.value = window.setInterval(() => {
    if (!game.value || game.value.status !== 'in_progress' || game.value.paused) return
    const now = Date.now()
    const delta = Math.floor((now - lastTick) / 1000)
    if (delta > 0) {
      elapsedSec.value += delta
      lastTick += delta * 1000
    }
  }, 250)
}

async function sendMove(index: number, value: CellValue) {
  if (!game.value) return
  errorMsg.value = null
  lastMoveInfo.value = null
  lastHint.value = null

  try {
    const res = await sendMoveRequest(api, id.value, { index, value })
    game.value = res
    lastMove.value = res.move
    if (res.move.isCorrect === true) lastMoveInfo.value = `✅ +${res.move.deltaScore}`
    if (res.move.isCorrect === false) lastMoveInfo.value = `❌ ${res.move.deltaScore}`
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

async function hint() {
  errorMsg.value = null
  lastMoveInfo.value = null
  lastMove.value = null
  try {
    const res = await requestHint(api, id.value)
    game.value = res
    lastHint.value = res.hint
    lastMoveInfo.value = `Hint at ${res.hint.index} (${res.hint.value}) ${res.hint.penalty}`
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

async function pause() {
  errorMsg.value = null
  try {
    const res = await pauseGame(api, id.value)
    game.value = res
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

async function resume() {
  errorMsg.value = null
  try {
    const res = await resumeGame(api, id.value)
    game.value = res
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

// keyboard: 1..9 sets, backspace/delete clears
function onKeydown(e: KeyboardEvent) {
  if (!game.value) return
  if (selectedIndex.value === null) return

  const idx = selectedIndex.value

  // ignore if given
  if (game.value.given[idx]) return

  if (e.key >= '1' && e.key <= '9') {
    sendMove(idx, Number(e.key) as any)
    return
  }

  if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
    sendMove(idx, null)
    return
  }
}


async function debugSolve() {
  if (!isDev) return

  errorMsg.value = null
  lastMoveInfo.value = null

  try {
    const res = await debugSolveGame(api, id.value)
    game.value = res
    lastMoveInfo.value = '🧪 Solved via debug'
  } catch (e: any) {
    errorMsg.value = e.message
  }
}

onMounted(async () => {
  await load()
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  stopTimer()
})

watch(
  () => [game.value?.id, game.value?.elapsedSec, game.value?.status, game.value?.paused],
  () => {
    startTimer()
  },
  { immediate: true },
)
</script>

<template>
  <main v-if="game" style="max-width: 900px; margin: 0 auto; padding: 24px;">
    <header style="display:flex; align-items:center; justify-content:space-between;">
      <div>
        <h1 style="margin:0;">Game</h1>
        <div style="opacity:.8;">{{ game.rank }} — {{ game.status }}</div>
      </div>

      <div style="display:flex; gap:10px; align-items:center;">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="/records">Records</NuxtLink>
      </div>
    </header>

    <section style="display:flex; gap:24px; margin-top:18px; align-items:flex-start;">
     <ClientOnly>
      <NewSudokuGrid
        :current="game.current"
        :given="game.given"
        :selected-index="selectedIndex"
        :last-move="lastMove"
        :last-hint="lastHint"
        :is-dev="isDev"
        @select="selectCell"
      />
     </ClientOnly>

      <aside style="min-width:260px;">
        <div><b>Score:</b> {{ game.score }}</div>
        <div><b>Errors:</b> {{ game.errors }}</div>
        <div><b>Hints:</b> {{ game.hintsUsed }} / 10</div>
        <div>
          <b>Elapsed:</b>
          <span :style="{ color: isPaused ? '#c00' : 'inherit' }">
            {{ formatElapsed(elapsedSec) }}
          </span>
        </div>

        <div style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
            <button @click="hint" :disabled="game.status === 'finished'">Hint</button>
            <button @click="pause" :disabled="game.status === 'finished'">Pause</button>
            <button @click="resume" :disabled="game.status === 'finished'">Resume</button>
            <button @click="load">Reload</button>

            <!-- DEV ONLY -->
            <button
                v-if="isDev"
                @click="debugSolve"
                style="border:1px dashed #c00; color:#c00;"
            >
                Debug Solve
            </button>
            </div>

        <p v-if="errorMsg" style="color:#c00; margin-top:12px;">{{ errorMsg }}</p>
        <p v-if="lastMoveInfo" style="margin-top:8px;">{{ lastMoveInfo }}</p>

        <div v-if="game.status === 'finished'" style="margin-top:16px; padding:10px; border:1px solid #ccc;">
          <b>Finished!</b>
          <div>Final score: {{ game.score }}</div>
        </div>

        <div style="margin-top:16px;">
          <b>Digit counts</b>
          <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:6px;">
            <span v-for="d in 9" :key="d" style="padding:4px 6px; border:1px solid #ddd;">
              {{ d }}: {{ game.digitCounts[d] }}
            </span>
          </div>
        </div>

        <div style="margin-top:16px; font-size: 13px; opacity:.75;">
          Tip: click a cell and press 1–9. Backspace clears.
        </div>
      </aside>
    </section>
  </main>

  <main v-else style="max-width: 900px; margin: 0 auto; padding: 24px;">
    Loading...
  </main>
</template>
