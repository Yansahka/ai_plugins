# Données et confidentialité

Le moteur CLI s'exécute localement. Il n'utilise aucun modèle distant, n'envoie aucune télémétrie et n'accède pas au réseau pour analyser les sources. La première installation des dépendances npm télécharge les bibliothèques ; la récupération d'une Canvas App dépend séparément des accès de son connecteur Microsoft.

Les sorties contiennent du code, des noms de fichiers et des données présentes dans les sources. Les fichiers `.env*`, clés usuelles, bases locales, caches et dossiers Git sont exclus, mais cette liste n'est pas un détecteur de secrets. Un secret codé en dur dans une formule ou une configuration compatible peut rester dans le rapport. Vérifier le contenu avant un partage externe.

Les captures, contextes réels, identifiants d'applications et chemins privés de développement ne font pas partie de la distribution. Les exemples du dépôt sont fictifs. Les mesures de développement publiées sont agrégées, sans les sources de l'application utilisée pour les obtenir.

Le plugin écrit les snapshots à l'endroit choisi et ne les supprime pas automatiquement. Leur conservation relève de l'utilisateur. Désinstaller le plugin ne supprime pas ces fichiers externes. Faire lire un contexte par un agent distant reste une transmission à ce service selon ses propres paramètres.
