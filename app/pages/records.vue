<script setup lang="ts">
const { api } = useApi()
const records = ref<any[]>([])
const errorMsg = ref<string | null>(null)

onMounted(async () => {
  try {
    const res = await api<{ records: any[] }>('/api/records')
    records.value = res.records
  } catch (e: any) {
    errorMsg.value = e.message
  }
})
</script>

<template>
  <main style="max-width: 900px; margin: 0 auto; padding: 24px;">
    <header style="display:flex; justify-content:space-between; align-items:center;">
      <h1>Records</h1>
      <NuxtLink to="/">Home</NuxtLink>
    </header>

    <p v-if="errorMsg" style="color:#c00;">{{ errorMsg }}</p>

    <ol v-else>
      <li v-for="r in records" :key="r.id" style="margin: 10px 0;">
        <b>{{ r.score }}</b> — {{ r.rank }} — {{ r.durationSec }}s
        <span style="opacity:.7;">(game: {{ r.gameId }})</span>
      </li>
    </ol>
  </main>
</template>
