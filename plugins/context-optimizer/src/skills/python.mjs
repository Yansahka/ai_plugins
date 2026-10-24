import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const helper = fileURLToPath(new URL('./python_ast.py', import.meta.url));
export const python = {
  id: 'python', accepts: file => file.endsWith('.py'),
  extract(file, text, options) {
    if (options.focus?.includes(file)) return {body: text, mode: 'full'};
    const result = spawnSync(options.python ?? process.env.CONTEXT_OPTIMIZER_PYTHON ?? 'python', [helper], {input: text, encoding: 'utf8', timeout: 15000, maxBuffer: 4*1024*1024});
    if (result.error || result.status !== 0) throw Error(`Python AST indisponible ou syntaxe invalide: ${result.error?.message ?? result.stderr.trim()}`);
    return {body: result.stdout.trim(), mode: 'AST; corps omis'};
  }
};
