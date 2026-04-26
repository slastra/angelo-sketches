export interface Sketch {
  id: string
  date: string
  dateIso: string
  tags: string[]
  image: string | null
  pinned: boolean
  position: number
  version: number
}

export function useSketches() {
  return useFetch<Sketch[]>('/api/sketches', { default: () => [] })
}
