# Installation et tests

## Codex

Depuis un terminal possédant la CLI Codex et Node.js :

```sh
codex plugin marketplace add Yansahka/ai_plugins --ref main
codex plugin add context-optimizer@yansahka-ai-plugins --json
codex plugin list --json
```

Récupérer `installedPath` dans le résultat d'installation et exécuter :

```sh
npm ci --ignore-scripts --prefix "<installedPath>"
node "<installedPath>/scripts/validate-package.mjs"
node "<installedPath>/scripts/demo.mjs"
```

Sous PowerShell, on peut utiliser :

```powershell
$pluginInstall = codex plugin add context-optimizer@yansahka-ai-plugins --json | ConvertFrom-Json
npm ci --ignore-scripts --prefix $pluginInstall.installedPath
node (Join-Path $pluginInstall.installedPath 'scripts/demo.mjs')
```

L'installation par catalogue ne lance pas de script npm de préparation. L'étape `npm ci` est donc nécessaire dans chaque nouvelle copie installée. Elle concerne uniquement le plugin, jamais les projets analysés. Les bibliothèques sont fixées par le lockfile. Les accès réseau d'installation et les écritures dans le cache restent soumis aux permissions de l'hôte.

Ouvrir un nouveau chat après installation ; redémarrer l'application si les nouvelles compétences n'apparaissent pas. Ne pas interrompre automatiquement la session courante pour cela. Les compétences sont `optimize-context`, `microsoft-context`, `python-context` et `javascript-context`, sous l'espace de noms du plugin. On peut demander en langage naturel :

> Utilise ContextOptimizer pour produire le contexte de ce dépôt dans un nouveau dossier externe, sans modifier ses sources.

## Installation depuis une archive ou une copie locale

Extraire l'archive ZIP en conservant les fichiers cachés `.agents`, `.claude-plugin` et `.codex-plugin`. Le dossier racine extrait contient le catalogue :

```sh
codex plugin marketplace add /chemin/ai_plugins
codex plugin add context-optimizer@yansahka-ai-plugins --json
```

Initialiser ensuite les dépendances dans le `installedPath` retourné. Pour un simple test CLI, `npm ci --ignore-scripts` dans `plugins/context-optimizer` suffit ; l'enregistrement du catalogue n'est pas nécessaire.

## Claude Code

Le même dépôt fournit le catalogue et le manifeste `.claude-plugin` :

```text
/plugin marketplace add Yansahka/ai_plugins
/plugin install context-optimizer@yansahka-ai-plugins
```

Dans une nouvelle session, demander l'utilisation de ContextOptimizer. Le skill résout le chemin installé depuis son propre `SKILL.md` et initialise les dépendances si nécessaire, sous réserve des permissions. Cette distribution a été testée avec la CLI Node et Codex ; le chargement dans Claude Code n'a pas été testé sur la machine de développement.

## Vérifier et tester

Dans le dossier du plugin installé :

```sh
npm run validate
npm test
npm run demo
```

La suite complète nécessite Python 3.9+. Sous Windows, si `python` pointe vers un alias Microsoft Store indisponible :

```powershell
$env:CONTEXT_OPTIMIZER_PYTHON = 'C:/chemin/python.exe'
npm test
```

Le test réel d'une Canvas App exige en plus un connecteur Canvas Authoring disponible, une session ouverte et la coédition activée. ContextOptimizer ne fournit pas ce connecteur et ne demande jamais de compilation pour lire l'app.

## Mettre à jour ou retirer

```sh
codex plugin marketplace upgrade yansahka-ai-plugins
codex plugin add context-optimizer@yansahka-ai-plugins --json
```

Après une mise à jour, réinstaller les dépendances dans le chemin retourné et ouvrir un nouveau chat. Si la version de Codex conserve une ancienne installation, désinstaller puis réinstaller le plugin. Les snapshots externes sont indépendants de son cache.

```sh
codex plugin remove context-optimizer@yansahka-ai-plugins --json
```

Supprimer le catalogue n'est utile que pour cesser de distribuer tous ses plugins : `codex plugin marketplace remove yansahka-ai-plugins`. Un catalogue local pointe vers la copie locale ; un catalogue Git doit être rafraîchi pour récupérer les commits distants.

Références : [paquet de plugin OpenAI](https://developers.openai.com/plugins/build/plugins), [commandes développeur Codex](https://learn.chatgpt.com/docs/developer-commands), [plugins Claude Code](https://code.claude.com/docs/en/plugins).
