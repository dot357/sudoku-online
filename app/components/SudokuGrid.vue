<script setup lang="ts">
import anime from 'animejs'
import type { CellValue } from '~/shared/types/sudoku'
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  current: CellValue[]
  given: boolean[]
  selectedIndex: number | null
  lastMove: { index: number; value: CellValue; isCorrect: boolean | null } | null
  lastHint: { index: number; value: number; penalty: number; hintsUsed: number } | null
}>()

const gridRef = ref<HTMLDivElement | null>(null)
const hiddenIndices = ref(new Set<number>())

const emit = defineEmits<{
  (e: 'select', index: number): void
}>()

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

function selectedValue() {
  if (props.selectedIndex === null) return null
  return props.current[props.selectedIndex]
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

function displayValue(index: number, value: CellValue) {
  if (hiddenIndices.value.has(index)) return ''
  return value ?? ''
}

function setHidden(index: number, hidden: boolean) {
  const next = new Set(hiddenIndices.value)
  if (hidden) next.add(index)
  else next.delete(index)
  hiddenIndices.value = next
}

function animateMove() {
  if (!gridRef.value || !props.lastMove) return
  const { index, isCorrect, value } = props.lastMove
  const button = gridRef.value.querySelector<HTMLButtonElement>(
    `button[data-index="${index}"]`,
  )
  if (!button) return

  const text = button.querySelector<HTMLSpanElement>('span[data-value="true"]')
  if (text) text.style.opacity = '1'
  if (value === null) setHidden(index, false)

  const baseColor = highlightColor(index)
  const flashColor = isCorrect === true ? '#8ed081' : isCorrect === false ? '#e86767' : baseColor

  anime.remove(button)
  anime({
    targets: button,
    scale: [1, 0.94, 1],
    backgroundColor: flashColor === baseColor
      ? baseColor
      : [
          { value: flashColor, duration: 140 },
          { value: baseColor, duration: 220 },
        ],
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

  if (isCorrect === false && text) {
    anime.remove(text)
    anime({
      targets: text,
      opacity: [1, 0],
      delay: 120,
      duration: 650,
      easing: 'easeOutQuad',
      complete: () => {
        setHidden(index, true)
        text.style.opacity = '1'
      },
    })
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
    style="
      display:grid;
      grid-template-columns: repeat(9, 40px);
      grid-template-rows: repeat(9, 40px);
      gap:0;
      user-select:none;
    "
  >
    <button
      v-for="(v, i) in current"
      :key="i"
      @click="emit('select', i)"
      :data-index="i"
      :data-highlight="highlightType(i) !== 'none' ? 'true' : 'false'"
      :data-selected="selectedIndex === i ? 'true' : 'false'"
      :data-highlight-type="highlightType(i)"
      :style="{
        width: '40px',
        height: '40px',
        border: '1px solid #999',
        fontWeight: given[i] ? '700' : '500',
        cursor: 'pointer',
        // thicker borders for 3x3 boxes
        borderLeftWidth: (i % 9 === 0 || i % 9 === 3 || i % 9 === 6) ? '2px' : '1px',
        borderTopWidth: (Math.floor(i/9) === 0 || Math.floor(i/9) === 3 || Math.floor(i/9) === 6) ? '2px' : '1px',
        borderRightWidth: (i % 9 === 8) ? '2px' : '1px',
        borderBottomWidth: (Math.floor(i/9) === 8) ? '2px' : '1px',
      }"
    >
      <span data-value="true">{{ displayValue(i, v) }}</span>
    </button>
  </div>
</template>
