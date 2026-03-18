import ts from 'typescript'
export { ts }
export type { CompilerOptions } from 'typescript'
export { createDefaultMapFromCDN, createSystem, createVirtualTypeScriptEnvironment, knownLibFilesForCompilerOptions } from '@typescript/vfs'
export { tsFacet, tsSync, tsHover } from '@valtown/codemirror-ts'
