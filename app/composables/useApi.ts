export function useApi() {
  async function api<T>(url: string, opts: any = {}): Promise<T> {
    try {
      return await $fetch<T>(url, {
        ...opts,
        credentials: 'include', // keep sid cookie
      })
    } catch (e: any) {
      // Nitro errors typically have data/statusMessage
      const msg = e?.data?.statusMessage || e?.data?.message || e?.message || 'Request failed'
      throw new Error(msg)
    }
  }

  return { api }
}
