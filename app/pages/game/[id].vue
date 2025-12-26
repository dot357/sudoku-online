<script setup lang="ts">
import type { CellValue, GamePublicStateDTO, HintResponseDTO, MoveResponseDTO } from '~/shared/types/sudoku'
import { debugSolveGame, fetchGame, pauseGame, requestHint, resumeGame, sendMove as sendMoveRequest } from '~~/app/requests/game'
import { formatElapsedSeconds, getStatusLabel } from '~/utils/games'

const isDevelopment = import.meta.env.DEV

const currentRoute = useRoute()
const { api: apiClient } = useApi()

const gameId = computed(() => String(currentRoute.params.id))
const gameState = ref<GamePublicStateDTO | null>(null)
const selectedCellIndex = ref<number | null>(null)
const lastMoveData = ref<MoveResponseDTO['move'] | null>(null)
const lastHintData = ref<HintResponseDTO['hint'] | null>(null)
const elapsedSeconds = ref(0)
const timerHandle = ref<number | null>(null)

const errorMessage = ref<string | null>(null)
const lastMoveMessage = ref<string | null>(null)

const isPaused = computed(() => gameState.value?.paused === true)
const isInProgress = computed(() => gameState.value?.status === 'in_progress')

function clearFeedback() {
  errorMessage.value = null
  lastMoveMessage.value = null
  lastMoveData.value = null
  lastHintData.value = null
}

async function loadGame() {
  clearFeedback()
  gameState.value = await fetchGame(apiClient, gameId.value)
}

function selectCellIndex(cellIndex: number) {
  selectedCellIndex.value = cellIndex
}

function clearTimer() {
  if (timerHandle.value !== null) {
    window.clearInterval(timerHandle.value)
    timerHandle.value = null
  }
}

function startTimer() {
  clearTimer()
  if (!gameState.value) return
  elapsedSeconds.value = gameState.value.elapsedSec
  if (!isInProgress.value || isPaused.value) return

  let lastTickMs = Date.now()
  timerHandle.value = window.setInterval(() => {
    if (!gameState.value || !isInProgress.value || isPaused.value) return
    const nowMs = Date.now()
    const deltaSeconds = Math.floor((nowMs - lastTickMs) / 1000)
    if (deltaSeconds > 0) {
      elapsedSeconds.value += deltaSeconds
      lastTickMs += deltaSeconds * 1000
    }
  }, 250)
}

function buildMoveMessage(move: MoveResponseDTO['move']) {
  if (move.isCorrect === true) return `✅ +${move.deltaScore}`
  if (move.isCorrect === false) return `❌ ${move.deltaScore}`
  return null
}

async function submitMove(cellIndex: number, cellValue: CellValue) {
  if (!gameState.value) return
  clearFeedback()
  try {
    const response = await sendMoveRequest(apiClient, gameId.value, { index: cellIndex, value: cellValue })
    gameState.value = response
    lastMoveData.value = response.move
    lastMoveMessage.value = buildMoveMessage(response.move)
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

async function requestHintAction() {
  if (!gameState.value) return
  clearFeedback()
  try {
    const response = await requestHint(apiClient, gameId.value)
    gameState.value = response
    lastHintData.value = response.hint
    lastMoveMessage.value = `Hint at ${response.hint.index} (${response.hint.value}) ${response.hint.penalty}`
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

async function pauseCurrentGame() {
  if (!gameState.value) return
  errorMessage.value = null
  try {
    const response = await pauseGame(apiClient, gameId.value)
    gameState.value = response
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

async function resumeCurrentGame() {
  if (!gameState.value) return
  errorMessage.value = null
  try {
    const response = await resumeGame(apiClient, gameId.value)
    gameState.value = response
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

function isGivenCell(cellIndex: number) {
  return gameState.value?.given[cellIndex] === true
}

function handleKeydown(event: KeyboardEvent) {
  if (!gameState.value) return
  if (selectedCellIndex.value === null) return

  const cellIndex = selectedCellIndex.value
  if (isGivenCell(cellIndex)) return

  if (event.key >= '1' && event.key <= '9') {
    submitMove(cellIndex, Number(event.key) as CellValue)
    return
  }

  if (event.key === 'Backspace' || event.key === 'Delete' || event.key === '0') {
    submitMove(cellIndex, null)
  }
}

function setSelectedCellDigit(digit: number) {
  if (!gameState.value) return
  if (selectedCellIndex.value === null) return
  const cellIndex = selectedCellIndex.value
  if (isGivenCell(cellIndex)) return
  submitMove(cellIndex, digit as CellValue)
}

async function solveWithDebug() {
  if (!isDevelopment) return
  errorMessage.value = null
  lastMoveMessage.value = null
  try {
    const response = await debugSolveGame(apiClient, gameId.value)
    gameState.value = response
    lastMoveMessage.value = '🧪 Solved via debug'
  } catch (error: any) {
    errorMessage.value = error.message
  }
}

onMounted(async () => {
  await loadGame()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
  clearTimer()
})

watch(
  () => [gameState.value?.id, gameState.value?.elapsedSec, gameState.value?.status, gameState.value?.paused],
  () => {
    startTimer()
  },
  { immediate: true },
)
</script>

<template>
  <main v-if="gameState" class="w-full mx-auto px-4 py-4">
    <header class="flex flex-col items-center justify-between">
      <div class="w-full text-center border-b border-stroke-light pb-2">
        <h1 class="text-2xl font-semibold opacity-70 ">
          {{ getStatusLabel(gameState.status) }}
        </h1>
        <div class="opacity-70 capitalize">{{ gameState.rank }}</div>
      </div>

       <div class="w-full flex items-center justify-center mt-3  flex-wrap gap-2 border-b border-stroke-light py-2 pb-4">
          <button
            class="px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80"
            :disabled="gameState.status === 'finished'"
            @click="requestHintAction"
          >
            Hint
          </button>
          <button
            class="px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80"
            :disabled="gameState.status === 'finished'"
            @click="pauseCurrentGame"
          >
            Pause
          </button>
          <button
            class="px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80"
            :disabled="gameState.status === 'finished'"
            @click="resumeCurrentGame"
          >
            Resume
          </button>
          <button
            class="px-3 py-1.5 text-sm border border-black/30 bg-background/50 hover:bg-background/80"
            @click="loadGame"
          >
            Reload
          </button>
          <button
            v-if="isDevelopment"
            class="px-3 py-1.5 text-sm border border-dashed border-red-500 text-red-600"
            @click="solveWithDebug"
          >
            Debug Solve
          </button>
        </div>
    </header>

    <section class="flex flex-col lg:flex-row gap-6 mt-6 items-start justify-center">
      <ClientOnly>
        <SudokuGrid
          :current="gameState.current"
          :given="gameState.given"
          :selected-index="selectedCellIndex"
          :last-move="lastMoveData"
          :last-hint="lastHintData"
          :is-dev="isDevelopment"
          @select="selectCellIndex"
        />
      </ClientOnly>

      <aside class="w-full lg:max-w-[280px]">
        <div class="border border-black/10 bg-white/70 px-4 py-3 space-y-1">
          <div class="flex items-center justify-between">
            <span class="opacity-70">Score</span>
            <span class="font-semibold">{{ gameState.score }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-70">Errors</span>
            <span class="font-semibold">{{ gameState.errors }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-70">Hints</span>
            <span class="font-semibold">{{ gameState.hintsUsed }} / 10</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="opacity-70">Elapsed</span>
            <span :class="isPaused ? 'text-red-600 font-semibold' : 'font-semibold'">
              {{ formatElapsedSeconds(elapsedSeconds) }}
            </span>
          </div>
        </div>

       

       

        <div v-if="gameState.status === 'finished'" class="mt-4 border border-black/10 bg-white/70 px-4 py-3">
          <div class="font-semibold">Finished!</div>
          <div>Final score: {{ gameState.score }}</div>
        </div>

        <div class="mt-4 border border-black/10 bg-white/70 px-4 py-3">
          <div class="font-semibold">Digits</div>
          <div class="grid grid-cols-3 gap-0 mt-2 border border-black/10 bg-white/80 w-fit">
            <button
              v-for="digit in 9"
              :key="digit"
              type="button"
              class="aspect-square w-12 sm:w-14 text-sm border border-black/10 -ml-px -mt-px"
              :disabled="selectedCellIndex === null || isGivenCell(selectedCellIndex)"
              @click="setSelectedCellDigit(digit)"
            >
              {{ digit }}
            </button>
          </div>
        </div>

        <div class="mt-3 text-xs opacity-70">Tip: click a cell and press 1–9. Backspace clears.</div>
      </aside>
    </section>
     <p v-if="errorMessage" class="text-red-600 mt-3">{{ errorMessage }}</p>
        <!-- <p v-if="lastMoveMessage" class="mt-2">{{ lastMoveMessage }}</p> -->
  </main>

  <main v-else class="w-full max-w-[900px] mx-auto px-4 py-4">
    Loading...
  </main>
</template>
