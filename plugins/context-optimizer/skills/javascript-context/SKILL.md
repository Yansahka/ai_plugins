---
name: javascript-context
description: Produce compact JS, TS, React, Vue or Node API context using TypeScript AST declarations, types, interfaces and literal endpoints, without changing source files.
---

# JavaScript and TypeScript context

Use the [snapshot workflow](../optimize-context/SKILL.md) with `--skill javascript`. Exclude node_modules, dist, .next and build caches. The TypeScript parser retains imports, types/interfaces/enums, declarations and literal route calls. Function bodies are replaced by `// [...code caché pour économiser des tokens]`; callbacks in memo/forwardRef initializers are masked too.

Use `--focus` for the project-relative files whose actual logic is required. This is an explicit scope selection, not Git change detection. The output is an architectural sketch, not compilable replacement code. Literal route detection is heuristic; dynamic endpoints, deeply nested declarations and computed exports are not fully mapped. For Vue, only script blocks are parsed; template and styles require source re-reading. A syntax error must stop generation rather than cause raw code to be silently injected.
