#!/usr/bin/env node
import path from 'node:path';
import { snapshot, render, writeReport } from './optimizer.mjs';
import { getEncoding } from 'js-tiktoken';

const args = process.argv.slice(2);
if (!args.length || args.includes('--help')) {
  console.log('node src/cli.mjs PROJET [--out CHEMIN_EXTERNE] [--skill microsoft|python|javascript] [--select ctrl1,ctrl2] [--focus src/fichier.ts] [--python EXECUTABLE]');
} else {
  try {
    const project = args.shift(), options = {};
    for (let i=0;i<args.length;i+=2) {
      const key = args[i].replace(/^--/, '');
      if (!['out','skill','select','focus','python'].includes(key) || !args[i+1]) throw Error('Option invalide: '+args[i]);
      options[key] = ['select','focus'].includes(key) ? args[i+1].split(',') : args[i+1];
    }
    const snap = await snapshot(project, options);
    const report = render(snap, options);
    const output = await writeReport(snap, options.out ?? path.resolve(project,'..',path.basename(path.resolve(project))+'.context','Context_Ready.txt'), report);
    const tokenizer = getEncoding('cl100k_base');
    const raw = snap.files.reduce((n,f)=>n+tokenizer.encode(f.text).length,0), compact = tokenizer.encode(report).length;
    console.log(JSON.stringify({output, files:snap.files.length, bytesBefore:snap.files.reduce((n,f)=>n+Buffer.byteLength(f.text),0), bytesAfter:Buffer.byteLength(report), tokenizer:'cl100k_base (référence; pas un compte universel)', tokensBefore:raw, tokensAfter:compact, reduction:((1-compact/raw)*100).toFixed(1)+'%'}, null, 2));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
