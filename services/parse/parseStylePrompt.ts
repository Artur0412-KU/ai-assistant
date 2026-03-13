type Weight = 'normal' | 'semibold' | 'bold'

type Chunk = {
  text: string
  weight: Weight
}

const HASH_LEVELS = [4, 3, 2] as const
const STAR_TOKEN = '**'

function weightFromHashCount(count: number): Weight {
  if (count >= 3) return 'bold'
  if (count === 2) return 'semibold'
  return 'normal'
}

function mergeWeights(base: Weight, next: Weight): Weight {
  if (base === 'bold' || next === 'bold') return 'bold'
  if (base === 'semibold' || next === 'semibold') return 'semibold'
  return 'normal'
}

function isSafeInput(input: unknown): input is string {
  return typeof input === 'string'
}

function pushChunk(chunks: Chunk[], text: string, weight: Weight) {
  if (!text) return

  const previous = chunks[chunks.length - 1]
  if (previous && previous.weight === weight) {
    previous.text += text
    return
  }

  chunks.push({ text, weight })
}

function hasTokenAt(text: string, index: number, token: string): boolean {
  return text.startsWith(token, index)
}

function readHashDelimiterLength(text: string, index: number): 2 | 3 | 4 | null {
  for (const level of HASH_LEVELS) {
    const token = '#'.repeat(level)
    if (hasTokenAt(text, index, token)) {
      return level
    }
  }

  return null
}

function findClosingHash(text: string, startIndex: number, level: 2 | 3 | 4): number {
  const token = '#'.repeat(level)
  let searchIndex = startIndex

  while (searchIndex < text.length) {
    const matchIndex = text.indexOf(token, searchIndex)
    if (matchIndex === -1) {
      return -1
    }

    return matchIndex
  }

  return -1
}

function findClosingStars(text: string, startIndex: number): number {
  return text.indexOf(STAR_TOKEN, startIndex)
}

function parseInline(text: string, baseWeight: Weight): Chunk[] {
  const chunks: Chunk[] = []
  let cursor = 0
  let plainTextStart = 0

  while (cursor < text.length) {
    const hashLevel = readHashDelimiterLength(text, cursor)

    if (hashLevel !== null) {
      const contentStart = cursor + hashLevel
      const closingIndex = findClosingHash(text, contentStart, hashLevel)

      if (closingIndex !== -1) {
        pushChunk(chunks, text.slice(plainTextStart, cursor), baseWeight)

        const innerText = text.slice(contentStart, closingIndex)
        const innerWeight = mergeWeights(baseWeight, weightFromHashCount(hashLevel))
        const innerChunks = parseInline(innerText, innerWeight)

        for (const chunk of innerChunks) {
          pushChunk(chunks, chunk.text, chunk.weight)
        }

        cursor = closingIndex + hashLevel
        plainTextStart = cursor
        continue
      }
    }

    if (hasTokenAt(text, cursor, STAR_TOKEN)) {
      const contentStart = cursor + STAR_TOKEN.length
      const closingIndex = findClosingStars(text, contentStart)

      if (closingIndex !== -1) {
        pushChunk(chunks, text.slice(plainTextStart, cursor), baseWeight)

        const innerText = text.slice(contentStart, closingIndex)
        const innerWeight = mergeWeights(baseWeight, 'semibold')
        const innerChunks = parseInline(innerText, innerWeight)

        for (const chunk of innerChunks) {
          pushChunk(chunks, chunk.text, chunk.weight)
        }

        cursor = closingIndex + STAR_TOKEN.length
        plainTextStart = cursor
        continue
      }
    }

    cursor += 1
  }

  pushChunk(chunks, text.slice(plainTextStart), baseWeight)
  return chunks
}

export function parseStyledPrompt(input: string): Chunk[] {
  const safeInput = isSafeInput(input) ? input : ''
  return parseInline(safeInput, 'normal')
}
