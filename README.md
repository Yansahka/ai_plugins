# Yansahka AI Plugins

Catalogue personnel de plugins pour agents IA. Premier plugin : **[ContextOptimizer](plugins/context-optimizer/README.md)**, un filtre local qui extrait l'essentiel du code dans `Context_Ready.txt` sans modifier les sources.

| Plugin | Version | Compétences |
|---|---|---|
| context-optimizer | 0.2.0 | optimize-context, microsoft-context, python-context, javascript-context |

## Installer dans Codex

```sh
codex plugin marketplace add Yansahka/ai_plugins --ref main
codex plugin add context-optimizer@yansahka-ai-plugins --json
```

Le second appel retourne `installedPath`. Initialiser les dépendances dans ce chemin, puis ouvrir un nouveau chat :

```sh
npm ci --ignore-scripts --prefix "<installedPath>"
```

Exemple de demande : « Utilise ContextOptimizer pour générer un contexte compact de ce projet, sans modifier ses sources. » Voir le [guide d'installation](plugins/context-optimizer/docs/install.md) pour la vérification, les mises à jour, la désinstallation et Claude Code.

## Exécuter sans agent

```sh
git clone https://github.com/Yansahka/ai_plugins.git
cd ai_plugins/plugins/context-optimizer
npm ci --ignore-scripts
npm run validate
npm test
npm run demo
node src/cli.mjs /chemin/projet --out /chemin/contextes/session-001/Context_Ready.txt
```

Prérequis : Node.js 20+, Python 3.9+ pour l'extracteur Python et la suite complète de tests. `CONTEXT_OPTIMIZER_PYTHON` permet d'indiquer un exécutable Python spécifique.

## Contenu et export

Les manifestes `.agents/plugins/marketplace.json` et `.claude-plugin/marketplace.json` exposent le même plugin. Les sources réelles, données de test privées, dépendances installées et captures d'applications ne sont pas publiées. Les exemples fournis sont fictifs.

```sh
python scripts/export_plugin.py /chemin/export/context-optimizer-0.2.0.zip
```

L'archive contient les catalogues, le plugin, sa documentation, ses tests et les exemples fictifs. Elle exclut `node_modules`, les captures et les fichiers de travail. Après extraction, installer le dossier comme catalogue local ou utiliser directement la CLI. La publication dans ce dépôt ne constitue pas une publication dans un annuaire public de plugins ni sur npm. Aucun droit de réutilisation général n'est accordé par ce dépôt ; le paquet npm est marqué `UNLICENSED` et privé.
