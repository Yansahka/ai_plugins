import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('../',import.meta.url));
const output = path.join(await fs.mkdtemp(path.join(os.tmpdir(),'contextoptimizer-demo-')),'Context_Ready.txt');
const result = spawnSync(process.execPath,[path.join(root,'src/cli.mjs'),path.join(root,'examples/gestion-idees'),'--out',output],{stdio:'inherit'});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
