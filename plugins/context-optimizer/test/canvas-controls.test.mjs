import test from 'node:test';
import assert from 'node:assert/strict';
import { microsoft } from '../src/skills/microsoft.mjs';
import { render, sha } from '../src/optimizer.mjs';

test('Canvas réel: préserver les entrées sans formule métier et les contrôles par défaut', () => {
  const yaml = 'Screens:\n  Home:\n    Properties:\n      Fill: =Color.White\n    Children:\n      - txtSearch:\n          Control: ModernTextInput\n          Properties:\n            Width: =300\n            AlignInContainer: =AlignInContainer.Stretch\n      - cbxCategory:\n          Control: ModernCombobox\n';
  const out = microsoft.extract('Home.pa.yaml', yaml, {});
  assert.match(out.body,/txtSearch\[ModernTextInput\]/);
  assert.match(out.body,/cbxCategory\[ModernCombobox\]/);
  assert.doesNotMatch(out.body,/Width|Fill|AlignInContainer/);
  assert.ok(out.names.includes('cbxCategory'));
});

test('Canvas: dépendance vers un formulaire sur un autre écran/fichier', () => {
  const first = 'Screens:\n  Home:\n    Properties:\n      Fill: =Color.White\n    Children:\n      - btnSend:\n          Control: Button\n          Properties:\n            OnSelect: =SubmitForm(frmIdea)\n';
  const second = 'Screens:\n  Edit:\n    Properties:\n      Fill: =Color.White\n    Children:\n      - frmIdea:\n          Control: Form\n          Properties:\n            DataSource: =Ideas\n          Children:\n            - titleCard:\n                Control: TypedDataCard\n                Properties:\n                  Update: =txtTitle.Value\n            - txtTitle:\n                Control: ModernTextInput\n';
  const files = [['Home.pa.yaml',first],['Edit.pa.yaml',second]].map(([path,text])=>({path,text,hash:sha(text),skill:microsoft}));
  const out=render({files,omitted:[]},{select:['btnSend']});
  assert.match(out,/DataSource:=Ideas/);
  assert.match(out,/Update:=txtTitle.Value/);
  assert.match(out,/txtTitle\[ModernTextInput\]/);
});
