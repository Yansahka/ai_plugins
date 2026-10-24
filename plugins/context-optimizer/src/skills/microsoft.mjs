import { parse } from 'yaml';
import { compactFx } from '../powerfx.mjs';

const visual = /^(X|Y|Width|Height|Fill|FillPortions|Color|Font|FontWeight|Size|Align|AlignInContainer|VerticalAlign|Border.*|Padding.*|Radius.*|Hover.*|Pressed.*|Disabled(?:Border.*|Color|Fill)|FocusedBorder.*|LoadingSpinnerColor|Appearance|BasePaletteColor|IconStyle|TemplateSize|TemplatePadding|Layout.*|DropShadow|ImagePosition)$/;
function canvasNodes(text) {
  const document = parse(text, {maxAliasCount: 20, uniqueKeys: true});
  const nodes = [];
  function visit(value, parts = []) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) { value.forEach(v => visit(v, parts)); return; }
    if (value.Properties || value.Control) nodes.push({name: parts.at(-1), path: parts.join('/'), type: value.Control ?? parts.at(-1), properties: Object.entries(value.Properties ?? {}).filter(([k,v]) => !visual.test(k) && typeof v === 'string').map(([k,v]) => [k, compactFx(v)])});
    for (const [key, child] of Object.entries(value)) {
      if (key === 'Properties') continue;
      visit(child, ['Children','Screens'].includes(key) ? parts : [...parts, key]);
    }
  }
  visit(document);
  if (!nodes.length) throw Error('YAML Canvas sans nœud Properties reconnu');
  return nodes;
}
function selectNodes(nodes, selected = []) {
  const explicit = nodes.filter(n => selected.includes(n.name));
  const keep = new Set(nodes.filter(n => !selected.length || n.path === 'App' || explicit.some(k => n.file === k.file && (n.path === k.path || n.path.startsWith(k.path+'/')))));
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      if (keep.has(node)) continue;
      if ([...keep].some(k => (k.file === node.file && k.path.startsWith(node.path+'/')) || k.properties.some(([,v]) => v.includes(node.name)))) {
        keep.add(node);
        // A referenced form needs its field bindings to explain SubmitForm.
        if (/^Form(?:@|$)/.test(node.type)) nodes.filter(n => n.file === node.file && n.path.startsWith(node.path+'/')).forEach(n => keep.add(n));
        changed = true;
      }
    }
  }
  return keep;
}
function canvas(text, options, file) {
  const nodes = canvasNodes(text);
  const keep = options.canvasSelection ? new Set(nodes.filter(n => options.canvasSelection.has(file+'/'+n.path))) : selectNodes(nodes,options.select);
  // Preserve control identities even when only visual properties (or defaults) exist.
  return {names: nodes.map(n => n.name), body: nodes.filter(n => keep.has(n)).map(n => `${n.path}[${n.type}]${n.properties.length ? '\n'+n.properties.map(([k,v]) => `${k}:${v}`).join('\n') : ''}`).join('\n')};
}
function flow(text) {
  const data = JSON.parse(text);
  const definition = data.properties?.definition ?? data.definition ?? data;
  if (!definition.actions) return null;
  function cleanAction(value) {
    const out = {...value};
    delete out.metadata;
    delete out.operationMetadataId;
    if (out.actions) out.actions = cleanActions(out.actions);
    if (out.else?.actions) out.else = {...out.else, actions: cleanActions(out.else.actions)};
    if (out.cases) out.cases = Object.fromEntries(Object.entries(out.cases).map(([k,v]) => [k, {...v, actions: cleanActions(v.actions ?? {})}]));
    if (out.default?.actions) out.default = {...out.default, actions: cleanActions(out.default.actions)};
    return out;
  }
  const cleanActions = actions => Object.fromEntries(Object.entries(actions).map(([k,v]) => [k,cleanAction(v)]));
  // Preserve inputs/expressions, runAfter, branches, retries and authentication references.
  return JSON.stringify({parameters: definition.parameters, triggers: definition.triggers && cleanActions(definition.triggers), actions: cleanActions(definition.actions), outputs: definition.outputs});
}
export const microsoft = {
  id: 'microsoft',
  prepare(files, options) {
    if (!options.select?.length) return options;
    const nodes = files.filter(f => /\.pa\.yaml$/i.test(f.path)).flatMap(f => canvasNodes(f.text).map(n => ({...n,file:f.path})));
    for (const name of options.select) if (!nodes.some(n => n.name===name)) throw Error('Composant inconnu: '+name);
    return {...options,canvasSelection:new Set([...selectNodes(nodes,options.select)].map(n => n.file+'/'+n.path))};
  },
  accepts: file => /\.pa\.yaml$|\.(fx|bicep|ps1)$|(?:flow|workflow|azure|deployment|parameters|settings|config|manifest|connections).*\.json$/i.test(file),
  extract(file, text, options) {
    if (/\.pa\.yaml$/i.test(file)) return canvas(text, options, file);
    if (/\.json$/i.test(file)) {
      const result = flow(text);
      return {body: result ?? JSON.stringify(JSON.parse(text)), mode: result ? 'flow' : 'config'};
    }
    if (/\.fx$/i.test(file)) return {body: compactFx(text)};
    // Deployment syntax is not Power Fx: no regex minification of shell/Bicep.
    return {body: text.trim(), mode: 'verbatim'};
  }
};
