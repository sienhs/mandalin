/**
 * Node ESM 리졸버 훅 — 확장자 없는 상대 import(`./sakura`)를 `.ts`로 이어준다.
 *
 * Node 24는 `.ts`를 타입 스트리핑으로 바로 실행할 수 있지만 ESM 해석은 확장자를 요구한다.
 * 이 훅 덕분에 export-catalog 스크립트가 번들러 없이(node_modules 없이도) 돌아간다.
 */
import { existsSync } from 'node:fs'
import { registerHooks } from 'node:module'
import { fileURLToPath } from 'node:url'

const CANDIDATES = ['.ts', '.tsx', '/index.ts']

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[mc]?[jt]sx?$/.test(specifier) && context.parentURL) {
      for (const ext of CANDIDATES) {
        const candidate = new URL(specifier + ext, context.parentURL)
        if (existsSync(fileURLToPath(candidate))) return nextResolve(specifier + ext, context)
      }
    }
    return nextResolve(specifier, context)
  },
})
