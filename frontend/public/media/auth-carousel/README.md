# Carrousel — pages connexion / inscription

Photos affichées en fondu enchaîné sur la colonne gauche des pages
`/login` et `/register`. La liste et l'ordre des images sont pilotés par
`images.json`, pas par le contenu du dossier.

## Ajouter une photo

1. Dépose le fichier image (`.webp` recommandé, `.jpg`/`.png` acceptés) dans ce dossier.
2. Ajoute une entrée dans `images.json` :

```json
{ "file": "03-nom-du-fichier.webp", "alt": "Description courte de la photo" }
```

## Retirer une photo

Supprime son entrée dans `images.json` (le fichier peut rester ou être supprimé du dossier, seule la liste JSON compte).

## Réordonner

L'ordre d'affichage suit l'ordre des entrées dans `images.json` — déplace les
lignes dans le fichier pour changer l'ordre (le préfixe numérique du nom de
fichier n'a qu'une valeur indicative, il n'est pas lu par le code).

## Remplacer une photo existante

Écrase le fichier en gardant le même nom, ou change le champ `file` dans
`images.json` pour pointer vers un nouveau fichier.
