# BELLELUXHAIR

Deux pages : `index.html` (perruques) et `bijoux.html` (bijoux, lien direct à partager).

## Modifier les produits

| Fichier | Contenu |
| --- | --- |
| `produits-hair.js` | Perruques : nom, prix, photos, description, détails |
| `produits-bijoux.js` | Bijoux : idem, avec `precommande: true` ou `false` pour chaque pièce |

Champs utiles :

* `images: ['photo1.jpg', 'photo1-dos.jpg']` : plusieurs photos, elles défilent dans la fiche
* `acompte: 0.30` : taux d'acompte affiché partout
* `whatsapp` : numéro au format international sans le +
* `cadrage: '50% 35%'` : point de recadrage de la photo

## Lien direct d'une fiche

`index.html#golden-hour` ou `bijoux.html#bague-celeste` ouvre directement la fiche du produit.

## Fichiers partagés

`boutique.js` et `boutique.css` gèrent les fiches, le panier, la précommande, le bandeau défilant et le bouton WhatsApp sur les deux pages.
