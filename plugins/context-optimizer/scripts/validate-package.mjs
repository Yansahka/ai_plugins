import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { parse } from 'yaml';

const root=fileURLToPath(new URL('../',import.meta.url));
const readJson=async p=>JSON.parse(await fs.readFile(path.join(root,p),'utf8'));
const pkg=await readJson('package.json');
const manifests=await Promise.all(['plugin.json','.codex-plugin/plugin.json','.claude-plugin/plugin.json'].map(readJson));
for(const manifest of manifests){assert.equal(manifest.name,'context-optimizer');assert.equal(manifest.version,pkg.version);}
const lock=await readJson('package-lock.json');
assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].name,pkg.name);
const expected=['optimize-context','microsoft-context','python-context','javascript-context'];
for(const name of expected){
  const source=await fs.readFile(path.join(root,'skills',name,'SKILL.md'),'utf8');
  const match=source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  assert.ok(match,'Frontmatter absent: '+name);
  const meta=parse(match[1]);
  assert.equal(meta.name,name);assert.ok(typeof meta.description==='string'&&meta.description.length>20);
  for(const match of source.matchAll(/\]\((\.\.?\/[^)]+)\)/g))await fs.access(path.resolve(root,'skills',name,match[1]));
}
await fs.access(path.join(root,'src/cli.mjs'));
await fs.access(path.join(root,'src/skills/python_ast.py'));
console.log(JSON.stringify({plugin:'context-optimizer',version:pkg.version,skills:expected,valid:true},null,2));
