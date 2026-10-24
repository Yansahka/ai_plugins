import ts from 'typescript';

const hidden = '// [...code caché pour économiser des tokens]';
export const javascript = {
  id: 'javascript',
  accepts: file => /\.(m?[jt]sx?|c[jt]s|vue)$/.test(file),
  extract(file, text, options) {
    if (options.focus?.includes(file)) return {body: text, mode: 'full'};
    let script = text;
    if (file.endsWith('.vue')) {
      script = [...text.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n');
      if (!script) return {body: '[Vue: template/style omis; aucun script]', mode: 'summary'};
    }
    const source = ts.createSourceFile(file.endsWith('.vue') ? file+'.ts' : file, script, ts.ScriptTarget.Latest, true);
    if (source.parseDiagnostics.length) throw Error('Erreur de syntaxe TypeScript/JavaScript');
    const lines = [];
    const printer = ts.createPrinter({removeComments: true});
    const print = node => printer.printNode(ts.EmitHint.Unspecified, node, source).trim();
    function trim(node) {
      if (!node.body) return print(node);
      return script.slice(node.getStart(source), node.body.getStart(source)).trimEnd() + ' { '+hidden+'\n}';
    }
    function signature(node) {
      const before = script.slice(node.getStart(source), node.body?.getStart(source) ?? node.end).trimEnd();
      return `${before} { ${hidden}\n}`;
    }
    function redactInitializer(node) {
      const edits = [];
      function visit(child) {
        if ((ts.isArrowFunction(child) || ts.isFunctionExpression(child)) && child.body) {
          edits.push([child.body.getStart(source), child.body.end, '{ '+hidden+'\n}']);
          return; // The outer function body already covers any nested functions.
        }
        ts.forEachChild(child, visit);
      }
      visit(node);
      if (!edits.length) return null;
      const start = node.getStart(source);
      let value = node.getText(source);
      for (const [a,b,replacement] of edits.sort((a,b)=>b[0]-a[0])) value = value.slice(0,a-start)+replacement+value.slice(b-start);
      return value;
    }
    for (const node of source.statements) {
      if (ts.isImportDeclaration(node) || ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node) || ts.isEnumDeclaration(node) || ts.isExportDeclaration(node)) lines.push(print(node));
      else if (ts.isExportAssignment(node)) lines.push('export default '+(redactInitializer(node.expression) ?? (ts.isIdentifier(node.expression) ? print(node.expression) : '[valeur omise]')));
      else if (ts.isFunctionDeclaration(node)) lines.push(trim(node));
      else if (ts.isClassDeclaration(node)) {
        const start = script.slice(node.getStart(source), node.members.pos).trimEnd();
        lines.push(start+'\n'+node.members.map(member => member.body ? trim(member) : member.initializer ? `${print(member.name)}${member.type ? ':'+print(member.type) : ''} = ${redactInitializer(member.initializer) ?? '[valeur omise]'}` : print(member)).join('\n')+'\n}');
      } else if (ts.isVariableStatement(node)) {
        for (const decl of node.declarationList.declarations) {
          if (decl.initializer && (ts.isArrowFunction(decl.initializer) || ts.isFunctionExpression(decl.initializer))) lines.push(`${node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ? 'export ' : ''}const ${print(decl.name)} = ${signature(decl.initializer)}`);
          else lines.push(`${ts.getCombinedModifierFlags(node) & ts.ModifierFlags.Export ? 'export ' : ''}const ${print(decl.name)}${decl.type ? ':'+print(decl.type) : ''}=${decl.initializer ? redactInitializer(decl.initializer) ?? '[valeur omise]' : '[valeur omise]'}`);
        }
      }
    }
    function endpoints(node) {
      if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && /^(get|post|put|patch|delete|options|head|use|route)$/.test(node.expression.name.text)) {
        const first = node.arguments[0];
        if (first && (ts.isStringLiteral(first) || ts.isNoSubstitutionTemplateLiteral(first))) lines.push(`route ${print(node.expression)}(${print(first)},…)`);
      }
      ts.forEachChild(node, endpoints);
    }
    endpoints(source);
    return {body: lines.join('\n'), mode: 'signatures; corps/valeurs/template omis'};
  }
};
