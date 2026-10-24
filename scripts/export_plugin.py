"""Export the marketplace and plugin, excluding installed dependencies and captures."""
import pathlib
import sys
import zipfile

root = pathlib.Path(__file__).resolve().parent.parent
target = pathlib.Path(sys.argv[1]).resolve()
if not target.parent.is_dir():
    raise SystemExit('Le dossier parent de sortie doit exister.')
excluded = {'node_modules', '__pycache__', '.git', 'runs', 'exports'}
entries = [root / 'README.md', root / '.gitignore', root / '.agents/plugins/marketplace.json', root / '.claude-plugin/marketplace.json', root / 'scripts/export_plugin.py']
plugin = root / 'plugins/context-optimizer'
for candidate in sorted(plugin.rglob('*')):
    relative = candidate.relative_to(root)
    if any(part in excluded for part in relative.parts):
        continue
    if candidate.is_symlink():
        raise SystemExit('Lien symbolique refusé: ' + str(relative))
    if candidate.is_file() and candidate.suffix != '.pyc' and not candidate.name.startswith('.env'):
        entries.append(candidate)
with zipfile.ZipFile(target, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
    for entry in entries:
        archive.write(entry, str(pathlib.Path('ai_plugins') / entry.relative_to(root)))
print(str(target))
