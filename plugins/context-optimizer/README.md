# ContextOptimizer 0.2.0

**Un filtre local de contexte, en lecture seule sur le projet.** Il capture les fichiers compatibles, extrait les structures et formules utiles puis produit un unique `Context_Ready.txt` en Markdown compact dans un dossier externe.

## Démarrage

```sh
npm ci --ignore-scripts
npm run validate
npm test
npm run demo
node src/cli.mjs /projets/mon-app --out /contextes/session-001/Context_Ready.txt
```

Node.js 20+ requis. L'extracteur Python nécessite Python 3.9+ ; préciser `--python /chemin/python` ou `CONTEXT_OPTIMIZER_PYTHON` au besoin. Le scanner ne lance jamais le code du projet.

## Compétences interchangeables

| Compétence agent | Module | Contexte retenu |
|---|---|---|
| optimize-context | registre mixte | Détection par fichier, orchestration et mesure |
| microsoft-context | microsoft.mjs | Canvas YAML, Power Fx, actions de flux JSON, configurations et scripts de déploiement |
| python-context | python.mjs + python_ast.py | Imports, signatures, modèles, décorateurs et urlpatterns |
| javascript-context | javascript.mjs | Composants, signatures, classes, types/interfaces et routes littérales |

Les compétences agent sont des `SKILL.md` courts ; les extracteurs sont des modules de code indépendants. Aucun serveur MCP supplémentaire, aucune clé API et aucun LLM ne sont nécessaires au moteur local.

```sh
node src/cli.mjs /projets/canvas --select Gallery1 --out /contextes/session-002/Context_Ready.txt
node src/cli.mjs /projets/api --skill python --focus api/views.py --out /contextes/session-003/Context_Ready.txt
node src/cli.mjs /projets/web --skill javascript --focus src/Card.tsx --out /contextes/session-004/Context_Ready.txt
```

Le focus conserve le fichier complet pour Python/JS/TS/Vue. Il est explicite et ne repose pas sur Git. La sélection Canvas conserve les initialisations globales et les dépendances textuelles détectées, y compris entre fichiers.

## Préservation des sources

- Le moteur ouvre les fichiers du projet en lecture et écrit exclusivement hors de leur racine.
- Toute sortie existante est refusée, y compris les liens physiques ; les liens symboliques dans le projet sont ignorés.
- Les empreintes SHA-256 sont vérifiées avant la génération. Les douze premiers caractères figurent dans le rapport.
- `node_modules`, `.next`, `dist`, caches, environnements virtuels, bases locales et état éditeur Canvas sont exclus.
- Aucun formatage des sources, aucune compilation Canvas et aucune suppression du code réel.

## Mesures et portée

Une capture Canvas réelle a servi de test de développement : **5 866 → 1 668 tokens (−71,6 %)** pour la vue globale, **640 tokens (−89,1 %)** pour la sélection de sa galerie. Le second gain combine filtrage du périmètre et compression. Ces chiffres décrivent le prototype testé à cette date ; les changements de format d'une version peuvent déplacer le décompte. Les captures privées ne sont pas incluses.

La CLI mesure chaque exécution avec `cl100k_base`, sortie complète comprise. Le gain ne représente pas les prompts système, les conversations, les appels MCP ni le tokenizer de tous les modèles. Il n'est pas garanti pour un projet quelconque et peut être négatif pour de très petits fichiers.

La sortie est une vue partielle, pas un remplacement compilable du projet. Les corps Python/JS sont masqués, les propriétés visuelles Canvas sont retirées, et certaines routes dynamiques ne sont pas cartographiées. Une modification exige la relecture ciblée des originaux. Voir les [limites détaillées](docs/architecture.md).

## Documentation

- [Installation Codex et Claude Code](docs/install.md)
- [Options, exemples et utilisation avec un agent](docs/usage.md)
- [Architecture, extension des modules et limites](docs/architecture.md)
- [Données et confidentialité](docs/privacy.md)
- [Historique](CHANGELOG.md)

Le code est livré avec neuf tests de comportement. La démo génère une nouvelle sortie temporaire à chaque exécution ; elle ne réécrit jamais ses sources fictives.
