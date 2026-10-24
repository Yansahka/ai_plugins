// Lexical compaction only: literals, quoted identifiers and locale separators survive.
export function compactFx(source) {
  const tokens = source.match(/"(?:""|[^"])*"|'(?:''|[^'])*'|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\s+|[^\s]/g) ?? [];
  let result = '', gap = false;
  for (const token of tokens) {
    if (/^\s+$|^\/\/|^\/\*/.test(token)) { gap = true; continue; }
    const a = result.at(-1) ?? '', b = token[0];
    if (gap && ((/[\p{L}\p{N}_$"']/u.test(a) && /[\p{L}\p{N}_$"']/u.test(b)) || ['//','/*','*/','<=','>=','<>','&&','||',';;'].includes(a+b))) result += ' ';
    result += token; gap = false;
  }
  return result;
}
