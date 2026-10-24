# Architecture et limites

```text
CLI → capture en mémoire → registre de modules → extraction → rapport compact
                                                        → écriture externe exclusive
```

`src/optimizer.mjs` ne modifie aucun fichier du projet. Il collecte les octets et leurs empreintes, conserve la capture en mémoire puis vérifie que les sources capturées n'ont pas changé avant d'émettre le rapport. L'écriture se fait avec le mode exclusif `wx`. La vérification du parent réel empêche d'utiliser un alias symbolique vers la racine des sources. Ce mécanisme n'est pas un bac à sable système contre un processus hostile qui remplacerait les chemins pendant l'exécution.

## Modules

Un module exporte :

```javascript
{
  id: 'technology',
  accepts: relativePath => true,
  prepare: (files, options) => options, // facultatif, analyse inter-fichiers
  extract: (relativePath, text, options) => ({body, mode, names})
}
```

`body` contient le contexte ; `mode` et `names` sont facultatifs. Ajouter le module au tableau `skills` suffit. Les compétences agent n'embarquent pas de code du projet et ne sont pas chargées depuis le dossier analysé.

Le module Microsoft utilise YAML puis un compacteur lexical Power Fx. Sa préparation résout les références de contrôles entre fichiers de manière conservative, par occurrence textuelle des noms. Les faux positifs peuvent élargir le périmètre. Les références dynamiques ne sont pas résolues. Ce n'est ni un compilateur Power Fx ni une preuve d'équivalence sémantique.

Le module Python lance un script fourni par le plugin, avec le source sur stdin, et utilise `ast.parse`/`ast.unparse`. Il ne fait pas d'import du projet. Les fonctions sont remplacées par leur signature ; les déclarations de classe et champs restent. Les décorateurs et `urlpatterns` conservent les routes usuelles Django/FastAPI/Flask.

Le module JS/TS utilise le parseur TypeScript, sans transpiler ni exécuter le projet. Les composants, méthodes, callbacks de wrappers et fonctions reconnus gardent leurs déclarations. Les types/interfaces/enums restent explicites. Des marqueurs remplacent les corps et les valeurs ordinaires ; la sortie est un schéma de lecture non compilable.

## Limites assumées

- Les styles et la géométrie Canvas sont retirés même lorsqu'ils contiennent des calculs dynamiques. Le nom/type des contrôles reste, mais il faut relire les sources pour modifier le rendu.
- Seules les propriétés Canvas textuelles des arbres ordinaires sont extraites. Les définitions complexes de composants, fichiers annexes et ressources média peuvent nécessiter une analyse spécifique.
- Le compacteur Power Fx n'effectue ni résolution de noms, ni validation des types, ni vérification de délégation. Les formats atypiques, interpolations complexes et évolutions du langage exigent une relecture ciblée ; aucune correction automatique de formule n'est tentée.
- Les routes Python enregistrées de manière impérative ou calculée, et les définitions profondément imbriquées, ne sont pas toutes cartographiées.
- Les routes JS littérales sont détectées par heuristique ; les appels `.get` d'un objet quelconque peuvent être identifiés à tort. Les routes calculées et certains exports ne sont pas représentés intégralement.
- Vue est traité par extraction de blocs script : template/style sont omis ; aucun compilateur SFC n'est embarqué.
- Les `.ps1` et `.bicep` sont conservés verbatim. Les autres fichiers de configuration n'ont pas tous un parseur.
- Limite de 2 Mio par fichier, aucune limite globale de tokens configurable dans cette version. Une grande capture peut rester volumineuse.
- La sélection et le focus sont explicites ; aucun hook automatique, recherche vectorielle, cache conversationnel ou détection Git n'est fourni.

## Validation

Les tests couvrent les littéraux et frontières lexicales Power Fx, la conservation des branches de flux et champs métier `metadata`, les modèles/routes Python, les types/routes JS, les contrôles Canvas vides, les dépendances de formulaire inter-fichiers, le refus d'écrasement et les empreintes sources. La validation de paquet contrôle les manifestes, versions et compétences. Les tests n'établissent pas une équivalence sémantique générale de tous les langages.
