<script setup lang="ts">
import type { CellValue } from '~/shared/types/sudoku'

const props = defineProps<{
  value: CellValue
  given?: boolean
  selected?: boolean
  related?: boolean
  sameValue?: boolean
  disabled?: boolean
  row?: number
  col?: number
}>()

const label = computed(() => {
  const row = props.row !== undefined ? props.row + 1 : null
  const col = props.col !== undefined ? props.col + 1 : null
  const position = row && col ? `Row ${row}, Column ${col}` : 'Cell'
  const valueText = props.value ? `Value ${props.value}` : 'Empty'
  return `${position}. ${valueText}.`
})

const backgroundClass = computed(() => {
  if (props.selected) return 'bg-amber-300 text-slate-900'
  if (props.sameValue) return 'bg-amber-100 text-slate-900'
  if (props.related) return 'bg-blue-50 text-slate-900'
  if (props.given) return 'bg-slate-100 text-slate-900'
  return 'bg-white text-slate-900'
})
</script>

<template>
  <button
    type="button"
    class="flex h-10 w-10 items-center justify-center crimson-text  border border-slate-300 text-2xl leading-none transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 disabled:cursor-not-allowed disabled:text-slate-400"
    :class="[
      backgroundClass,
      given ? 'font-semibold' : 'font-light',
    ]"
    :disabled="disabled"
    :aria-label="label"
    :aria-selected="selected ? 'true' : 'false'"
    role="gridcell"
  >
    <span data-value="true">{{ value ?? '' }}</span>
  </button>
</template>
