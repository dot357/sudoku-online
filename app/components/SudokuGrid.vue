<script setup lang="ts">
import anime from 'animejs'
import type { CellValue } from '~~/shared/types/sudoku'
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  current: CellValue[]
  given: boolean[]
  selectedIndex: number | null
  lastMove: { index: number; value: CellValue; isCorrect: boolean | null } | null
  lastHint: { index: number; value: number; penalty: number; hintsUsed: number } | null
  isDev?: boolean
}>()

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

const gridRef = ref<HTMLDivElement | null>(null)
const hiddenIndices = ref(new Set<number>())
const moveStamp = ref(new Map<number, number>())

function selectedValue() {
  if (props.selectedIndex === null) return null
  return props.current[props.selectedIndex]
}

function isRelated(i: number) {
  if (props.selectedIndex === null) return false
  const selectedRow = Math.floor(props.selectedIndex / 9)
  const selectedCol = props.selectedIndex % 9
  const row = Math.floor(i / 9)
  const col = i % 9
  const sameRow = row === selectedRow
  const sameCol = col === selectedCol
  const sameBox = Math.floor(row / 3) === Math.floor(selectedRow / 3)
    && Math.floor(col / 3) === Math.floor(selectedCol / 3)
  return sameRow || sameCol || sameBox
}

function isSameValue(i: number) {
  if (props.selectedIndex === null) return false
  if (props.selectedIndex === i) return false
  const value = selectedValue()
  if (value === null) return false
  return props.current[i] === value
}

function highlightType(i: number) {
  if (props.selectedIndex === i) return 'selected'
  if (isSameValue(i)) return 'same'
  if (isRelated(i)) return 'related'
  return 'none'
}

function highlightColor(i: number) {
  const type = highlightType(i)
  if (type === 'selected') return '#f6b94c'
  if (type === 'same') return '#ffe8b5'
  if (type === 'related') return '#e9f2ff'
  if (props.given[i]) return '#f6f6f6'
  return 'white'
}

function setHidden(index: number, hidden: boolean) {
  const next = new Set(hiddenIndices.value)
  if (hidden) next.add(index)
  else next.delete(index)
  hiddenIndices.value = next
}

function bumpStamp(index: number) {
  const next = new Map(moveStamp.value)
  const current = (next.get(index) ?? 0) + 1
  next.set(index, current)
  moveStamp.value = next
  return current
}

function displayValue(index: number, value: CellValue) {
  if (hiddenIndices.value.has(index)) return ''
  return value ?? ''
}

function cellBorderStyle(i: number) {
  const row = Math.floor(i / 9)
  const col = i % 9
  return {
    borderLeftWidth: col === 0 || col === 3 || col === 6 ? '2px' : '1px',
    borderTopWidth: row === 0 || row === 3 || row === 6 ? '2px' : '1px',
    borderRightWidth: col === 8 ? '2px' : '1px',
    borderBottomWidth: row === 8 ? '2px' : '1px',
  }
}

function applyHighlight() {
  if (!gridRef.value) return
  const buttons = Array.from(
    gridRef.value.querySelectorAll<HTMLButtonElement>('button[data-index]'),
  )
  for (const el of buttons) {
    const index = Number(el.dataset.index)
    el.style.backgroundColor = props.given[index] ? '#f6f6f6' : 'white'
    el.style.transform = 'scale(1)'
  }
  if (props.selectedIndex === null) return
  const targets = buttons.filter((el) => el.dataset.highlight === 'true')
  if (!targets.length) return
  const fromIndex = targets.findIndex((el) => el.dataset.selected === 'true')
  anime.remove(targets)
  anime({
    targets,
    backgroundColor: (el: HTMLElement) => {
      if (el.dataset.highlightType === 'selected') return '#f6b94c'
      if (el.dataset.highlightType === 'same') return '#ffe8b5'
      return '#e9f2ff'
    },
    delay: anime.stagger(18, { from: Math.max(fromIndex, 0) }),
    duration: 260,
    easing: 'easeOutQuad',
  })
}

function animateMove() {
  if (!gridRef.value || !props.lastMove) return
  const { index, isCorrect, value } = props.lastMove
  const button = gridRef.value.querySelector<HTMLButtonElement>(
    `button[data-index="${index}"]`,
  )
  if (!button) return

  const stamp = bumpStamp(index)
  const text = button.querySelector<HTMLSpanElement>('span[data-value="true"]')
  if (text) {
    anime.remove(text)
    text.style.opacity = '1'
    text.style.color = ''
  }
  setHidden(index, false)

  const baseColor = highlightColor(index)
  const flashColor = isCorrect === true ? '#8ed081' : isCorrect === false ? '#e86767' : baseColor

  anime.remove(button)
  anime({
    targets: button,
    scale: [1, 0.94, 1],
    backgroundColor: props.isDev && flashColor !== baseColor
      ? [
          { value: flashColor, duration: 140 },
          { value: baseColor, duration: 220 },
        ]
      : baseColor,
    duration: 360,
    easing: 'easeOutQuad',
    complete: () => {
      button.style.backgroundColor = baseColor
    },
  })

  if (isCorrect === true) {
    setHidden(index, false)
    if (text) text.style.opacity = '1'
    return
  }

  if (isCorrect === false && text && props.isDev) {
    text.style.color = '#e86767'
  }
}

function animateHint() {
  if (!gridRef.value || !props.lastHint) return
  const { index } = props.lastHint
  const button = gridRef.value.querySelector<HTMLButtonElement>(
    `button[data-index="${index}"]`,
  )
  if (!button) return

  const text = button.querySelector<HTMLSpanElement>('span[data-value="true"]')
  if (text) text.style.opacity = '1'
  setHidden(index, false)

  const baseColor = highlightColor(index)
  anime.remove(button)
  anime({
    targets: button,
    scale: [1, 0.94, 1],
    backgroundColor: [
      { value: '#87c7ff', duration: 140 },
      { value: baseColor, duration: 220 },
    ],
    duration: 360,
    easing: 'easeOutQuad',
    complete: () => {
      button.style.backgroundColor = baseColor
    },
  })
}

onMounted(() => {
  applyHighlight()
})

watch(
  () => props.selectedIndex,
  async () => {
    await nextTick()
    applyHighlight()
  },
)

watch(
  () => props.lastMove,
  async () => {
    await nextTick()
    animateMove()
  },
)

watch(
  () => props.lastHint,
  async () => {
    await nextTick()
    animateHint()
  },
)
</script>

<template>
  <div
    ref="gridRef"
    class="grid select-none"
    style="grid-template-columns: repeat(9, 40px); grid-template-rows: repeat(9, 40px); gap: 0;"
    role="grid"
  >
    <Cell
      v-for="(v, i) in current"
      :key="i"
      :value="displayValue(i, v)"
      :given="given[i]"
      :selected="selectedIndex === i"
      :related="highlightType(i) === 'related'"
      :same-value="highlightType(i) === 'same'"
      :row="Math.floor(i / 9)"
      :col="i % 9"
      :data-index="i"
      :data-highlight="highlightType(i) !== 'none' ? 'true' : 'false'"
      :data-selected="selectedIndex === i ? 'true' : 'false'"
      :data-highlight-type="highlightType(i)"
      :style="cellBorderStyle(i)"
      @click="emit('select', i)"
    />
  </div>
</template>
