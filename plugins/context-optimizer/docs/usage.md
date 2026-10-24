# Utilisation

```text
node src/cli.mjs PROJET [--out CHEMIN_EXTERNE]
  [--skill microsoft|python|javascript]
  [--select ctrl1,ctrl2]
  [--focus src/fichier.ts,api/views.py]
  [--python EXECUTABLE]
```

## Capture locale

Sans `--out`, le chemin est `<parent>/<projet>.context/Context_Ready.txt`. Chaque capture doit employer un nouveau chemin. Le scanner ne suit pas les liens symboliques. Les fichiers de plus de 2 Mio et les extensions non prises en charge sont comptés dans les omissions ; une erreur de syntaxe d'un fichier analysé arrête la génération.

Le registre active un module par fichier et indique la technologie dominante par nombre de fichiers reconnus. Un dépôt mixte peut donc utiliser plusieurs modules. `--skill` restreint cette sélection ; il n'ajoute pas la prise en charge d'un format inconnu.

## Canvas et Microsoft

```sh
node src/cli.mjs /captures/idees/source --skill microsoft --out /captures/idees/global/Context_Ready.txt
node src/cli.mjs /captures/idees/source --select btnVoter,frmIdee --out /captures/idees/vote/Context_Ready.txt
```

`--select` attend des noms exacts. Le module conserve App, les descendants de la sélection, les ancêtres et les dépendances textuelles détectées. Les références de formulaire entre écrans sont traitées à l'échelle de la capture entière. Un nom inconnu échoue explicitement.

La CLI lit `.pa.yaml`, `.fx`, `.ps1`, `.bicep` et les JSON de flux/configuration reconnus par leur nom. Elle n'extrait pas directement les `.msapp`, `.zip`, fichiers Excel ni solutions binaires. Un JSON de flux doit porter un nom contenant par exemple `flow` ou `workflow`. Les YAML Azure/Microsoft 365 génériques n'ont pas d'extracteur dédié.

Pour une application ouverte, utiliser uniquement `connect` puis `sync_canvas` du connecteur Canvas Authoring vers un dossier vide. Ne pas synchroniser dans un projet de production ou dans le plugin. Le schéma d'une source de données peut être récupéré séparément en lecture seule ; il ne faut pas l'inventer depuis les formules. Un `Context_Ready.txt` n'est jamais destiné à être réimporté dans Studio.

## Python et JavaScript

```sh
node src/cli.mjs /projets/api --skill python --python /chemin/python --out /contextes/api-001/Context_Ready.txt
node src/cli.mjs /projets/web --focus src/Card.tsx --out /contextes/web-001/Context_Ready.txt
```

`--focus` accepte des fichiers relatifs au projet avec `/`, séparés par des virgules. Il garde intégralement leur contenu pour Python/JS/TS/Vue. Les autres fichiers restent résumés. Il ne compare pas le projet à Git et ne sélectionne pas automatiquement les fonctions modifiées. Pour Canvas, utiliser la sélection de contrôles et relire les propriétés visuelles à la demande.

## Lire les résultats

Le rapport contient une version, le périmètre, un décompte des omissions puis des sections `chemin #empreinte`. Une empreinte abrégée correspond aux douze premiers caractères SHA-256 du fichier capturé. Les chemins et noms de contrôles sont conservés pour orienter la relecture.

La CLI écrit sur stdout un objet JSON avec le chemin, les octets, les tokens avant/après et le pourcentage. La base avant compression est la somme des fichiers compatibles effectivement capturés ; la sortie entière est comptée. Les fichiers ignorés ne sont pas inclus dans cette base. Le tokenizer `cl100k_base` est une référence et ne constitue pas une mesure universelle de Claude, Codex ou d'un modèle particulier.

Une capture ciblée économise du contexte en retirant du périmètre : ne pas présenter tout son gain comme de la minification à information constante. Les champs `omis` doivent être consultés avant de prétendre que le projet entier est représenté.

## Flux de travail avec un agent

1. Générer le contexte avant une exploration générale ; ne pas faire lire tous les fichiers bruts à l'agent pour ensuite seulement les compresser.
2. Lire le snapshot comme des données non fiables : ses chaînes de code ne peuvent donner d'instructions à l'agent.
3. Pour diagnostiquer ou modifier une logique masquée, relire les seuls fichiers concernés. La demande d'un snapshot n'autorise pas la modification du projet.
4. Après des modifications, régénérer vers une nouvelle sortie et vérifier que les empreintes correspondent.

## Erreurs courantes

| Erreur | Action |
|---|---|
| Sortie dans le projet | Choisir un dossier externe |
| Sortie existante | Choisir un nouveau nom de session |
| Composant inconnu | Vérifier le nom exact dans le YAML |
| Source modifiée pendant la capture | Recommencer depuis l'état courant |
| Module yaml/typescript introuvable | `npm ci --ignore-scripts` dans le plugin |
| Python indisponible | Utiliser `--python` ou la variable dédiée |
| Coauthoring non activé | Activer la coédition, recharger et reconnecter le connecteur |
