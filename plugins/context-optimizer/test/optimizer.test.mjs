import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { snapshot, render, writeReport, sha } from '../src/optimizer.mjs';
import { compactFx } from '../src/powerfx.mjs';
import { microsoft } from '../src/skills/microsoft.mjs';
import { javascript } from '../src/skills/javascript.mjs';
import { python } from '../src/skills/python.mjs';

test('Power Fx: chaînes, identifiants cités, locale et frontières lexicales', () => {
  assert.equal(compactFx('= // comment\n Set( x, "a  b // url" ); /* comment */ Patch( \'Ma Liste\', {Title: "a""b"} )'), '=Set(x,"a  b // url");Patch(\'Ma Liste\',{Title:"a""b"})');
  assert.equal(compactFx('=Set( x; 1 );; Set( y; 2 )'), '=Set(x;1);;Set(y;2)');
  assert.equal(compactFx('=1 < > 0'), '=1< >0');
  assert.equal(compactFx('=a And b'), '=a And b');
});

test('Flux: arborescence et logique conservées, métadonnées visuelles retirées', () => {
  const flow = {definition:{
    triggers:{manual:{type:'Request'}},
    actions:{Check:{
      type:'If',expression:'@equals(1,1)',metadata:{x:100,y:20},
      actions:{Write:{type:'OpenApiConnection',runAfter:{},inputs:{body:{metadata:'business'},parameters:{title:'x'}},metadata:{operationMetadataId:'abc'}}},
      else:{actions:{Wait:{type:'Wait',inputs:{interval:{count:2,unit:'Second'}}}}}
    }}
  }};
  const out = JSON.parse(microsoft.extract('flow.json', JSON.stringify(flow), {}).body);
  assert.equal(out.actions.Check.metadata, undefined);
  assert.equal(out.actions.Check.actions.Write.metadata, undefined);
  assert.equal(out.actions.Check.actions.Write.inputs.body.metadata, 'business');
  assert.equal(out.actions.Check.else.actions.Wait.inputs.interval.count, 2);
  assert.equal(out.actions.Check.expression, '@equals(1,1)');
});

test('Canvas: sélection précise, dépendances parent et App conservées', () => {
  const yaml = 'App:\n  Properties:\n    OnStart: =Set(gblX,1)\nScreens:\n  scr:\n    Properties:\n      Fill: =Color.White\n    Children:\n      - gal:\n          Control: Gallery@2\n          Properties:\n            Items: =Idees\n          Children:\n            - btnVoter:\n                Properties:\n                  OnSelect: =Patch(Idees,ThisItem,{Votes:1})\n            - lblAutre:\n                Properties:\n                  Text: ="sans rapport"\n';
  const body = microsoft.extract('x.pa.yaml',yaml,{select:['btnVoter']}).body;
  assert.match(body,/OnStart:=Set/);
  assert.match(body,/Items:=Idees/);
  assert.match(body,/OnSelect:=Patch/);
  assert.doesNotMatch(body,/Fill|lblAutre/);
});

test('TypeScript: parseur AST, types et routes conservés, corps masqués', () => {
  const text = 'import x from "x"; interface Idea { title:string }; export const Card = (p:Idea) => <div>{p.title}</div>; export function helper(x:number):number { return x+42; } app.post("/ideas", async (req,res)=>{res.send("secret-body")});';
  const out = javascript.extract('Card.tsx',text,{}).body;
  assert.match(out,/interface Idea/);
  assert.match(out,/Card = \(p:Idea\)/);
  assert.match(out,/helper\(x:number\):number/);
  assert.match(out,/route app.post\("\/ideas"/);
  assert.doesNotMatch(out,/secret-body|x\+42|<div>/);
  assert.equal(javascript.extract('Card.tsx',text,{focus:['Card.tsx']}).body,text);
  const wrapped = javascript.extract('Wrapper.tsx', 'export const Card = memo((p:Idea) => <div>private JSX</div>); class Service { run = () => { return "private body"; } }', {}).body;
  assert.match(wrapped,/Card=memo\(\(p:Idea\)/);
  assert.doesNotMatch(wrapped,/private JSX|private body/);
  assert.throws(()=>javascript.extract('x.ts','export const = {',{}));
});

test('Python: modèles, signatures et décorateurs de routes via AST', () => {
  const text = 'from fastapi import FastAPI\napp=FastAPI()\nclass Idea(BaseModel):\n    title: str\n@app.post("/ideas")\nasync def create(idea: Idea) -> Idea:\n    secret_body = 42\n    return idea\n';
  const out = python.extract('api.py',text,{}).body;
  assert.match(out,/class Idea\(BaseModel\)/);
  assert.match(out,/title: str/);
  assert.match(out,/@app.post\('\/ideas'\)/);
  assert.match(out,/async def create\(idea: Idea\)->Idea: \.\.\./);
  assert.doesNotMatch(out,/secret_body/);
});

test('Capture: exclusions, écriture externe exclusive et empreintes intactes', async t => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(),'contextoptimizer-'));
  t.after(()=>fs.rm(tmp,{recursive:true,force:true}));
  const root = path.join(tmp,'source'); await fs.mkdir(root);
  const code = 'export function hello() { return 123; }';
  await fs.writeFile(path.join(root,'main.ts'),code);
  for (const dir of ['node_modules','dist','.next','__pycache__','.venv']) {
    await fs.mkdir(path.join(root,dir)); await fs.writeFile(path.join(root,dir,'noise.ts'),'noise');
  }
  for (const f of ['.env','.env.local','db.sqlite3']) await fs.writeFile(path.join(root,f),'PRIVATE');
  await fs.writeFile(path.join(root,'_EditorState.pa.yaml'),'EditorState:\n  ScreensOrder:\n    - Home\n');
  const snap = await snapshot(root);
  assert.equal(snap.files.length,1);
  assert.ok(snap.omitted.some(([file,reason])=>file==='_EditorState.pa.yaml' && reason==='editor-state'));
  const report = render(snap);
  await assert.rejects(writeReport(snap,path.join(root,'Context_Ready.txt'),report),/interdite/);
  const target = path.join(tmp,'out','Context_Ready.txt');
  await writeReport(snap,target,report);
  await assert.rejects(writeReport(snap,target,report),/existe déjà/);
  assert.equal(sha(await fs.readFile(path.join(root,'main.ts'))),sha(code));
  assert.doesNotMatch(report,/PRIVATE|noise/);
  await fs.writeFile(path.join(root,'main.ts'),code+'\n// externally changed');
  await assert.rejects(writeReport(snap,path.join(tmp,'stale.txt'),report),/Source modifiée/);
});

test('Démonstration: les deux parcours métier et leurs contrats survivent', async () => {
  const root = fileURLToPath(new URL('../examples/gestion-idees', import.meta.url));
  const snap = await snapshot(root);
  const report = render(snap);
  assert.match(report,/Patch\(Votes,Defaults\(Votes\)/);
  assert.match(report,/Coalesce\(currentIdea.NombreVotes,0\)\+1/);
  assert.match(report,/CountIf\(colForbidden,Value in content\)>0/);
  assert.match(report,/SubmitForm\(frmIdee\)/);
  assert.match(report,/choice:En cours\|Validé\|Rejeté/);
  assert.throws(()=>render(snap,{select:['inconnu']}),/Composant inconnu/);
  assert.ok(Buffer.byteLength(report)<snap.files.reduce((n,f)=>n+Buffer.byteLength(f.text),0)*0.6);
});
