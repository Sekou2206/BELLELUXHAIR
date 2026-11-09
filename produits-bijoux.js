const UNSPLASH = id => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`;

window.BOUTIQUE = {
  nom: 'Bellelux Bijoux',
  whatsapp: '2250720626963',
  acompte: 0.30,
  precommandeParDefaut: false,
  cle: 'bellelux_bijoux_panier',
  grille: 'produits',
  ancreCatalogue: 'catalogue',
  classeActif: 'actif',
  article: 'le bijou',
  champCadeau: true,
  messageContact: 'Bonjour Bellelux Bijoux, je souhaite avoir des renseignements sur vos bijoux.',
  produits: [
    {
      id: 'collier-aurore',
      nom: 'Collier Aurore',
      categorie: 'Collier',
      precommande: false,
      images: [UNSPLASH('photo-1599643478518-a784e5dc4c8f')],
      prix: 25000,
      badge: 'Signature',
      resume: 'Plaqué or · Pendentif fin',
      description: 'Une chaîne délicate et un pendentif fin qui accroche la lumière.\n\nLe collier qui se porte tous les jours et sublime aussi bien un décolleté qu’un col roulé.',
      details: [['Matière', 'Plaqué or'], ['Style', 'Pendentif fin']]
    },
    {
      id: 'bague-celeste',
      nom: 'Bague Céleste',
      categorie: 'Bague',
      precommande: true,
      images: [UNSPLASH('photo-1605100804763-247f67b3557e')],
      prix: 18000,
      badge: '',
      resume: 'Doré · Zircon solitaire',
      description: 'Un solitaire en zircon monté sur un anneau doré.\n\nUne bague lumineuse, simple et élégante, à offrir ou à s’offrir.',
      details: [['Matière', 'Doré'], ['Pierre', 'Zircon']]
    },
    {
      id: 'creoles-soleil',
      nom: 'Créoles Soleil',
      categorie: 'Boucles',
      precommande: false,
      images: [UNSPLASH('photo-1535632066927-ab7c9ab60908')],
      prix: 15000,
      badge: 'Coup de cœur',
      resume: 'Plaqué or · Anneaux',
      description: 'Des créoles plaquées or au volume juste.\n\nElles illuminent le visage et s’accordent avec toutes les tenues.',
      details: [['Matière', 'Plaqué or'], ['Style', 'Créoles']]
    },
    {
      id: 'jonc-eclat',
      nom: 'Jonc Éclat',
      categorie: 'Bracelet',
      precommande: true,
      images: [UNSPLASH('photo-1611591437281-460bfbe1220a')],
      prix: 22000,
      badge: '',
      resume: 'Doré · Finition polie',
      description: 'Un jonc doré à la finition polie, net et lumineux.\n\nSeul ou associé à d’autres bracelets, il apporte une touche précieuse au poignet.',
      details: [['Matière', 'Doré'], ['Finition', 'Polie']]
    },
    {
      id: 'collier-perle-douce',
      nom: 'Collier Perle Douce',
      categorie: 'Collier',
      precommande: false,
      images: [UNSPLASH('photo-1602173574767-37ac01994b2a')],
      prix: 28000,
      badge: 'Nouveau',
      resume: 'Perles · Fermoir doré',
      description: 'Un rang de perles au fermoir doré.\n\nL’élégance classique, idéale pour les cérémonies et les grandes occasions.',
      details: [['Matière', 'Perles'], ['Fermoir', 'Doré']]
    },
    {
      id: 'alliance-lumiere',
      nom: 'Alliance Lumière',
      categorie: 'Bague',
      precommande: true,
      images: [UNSPLASH('photo-1515562141207-7a88fb7ce338')],
      prix: 20000,
      badge: '',
      resume: 'Argenté · Pierres serties',
      description: 'Un anneau argenté serti de petites pierres tout autour.\n\nUne bague qui scintille à chaque mouvement de la main.',
      details: [['Matière', 'Argenté'], ['Pierres', 'Serties']]
    },
    {
      id: 'pendantes-etoile',
      nom: 'Pendantes Étoile',
      categorie: 'Boucles',
      precommande: false,
      images: [UNSPLASH('photo-1617038220319-276d3cfab638')],
      prix: 17000,
      badge: '',
      resume: 'Doré · Cristaux',
      description: 'Des boucles pendantes dorées ornées de cristaux.\n\nElles dansent avec la lumière et donnent du relief à une coiffure relevée.',
      details: [['Matière', 'Doré'], ['Pierres', 'Cristaux']]
    },
    {
      id: 'bracelet-maillons',
      nom: 'Bracelet Maillons',
      categorie: 'Bracelet',
      precommande: true,
      images: [UNSPLASH('photo-1573408301185-9146fe634ad0')],
      prix: 24000,
      badge: 'Édition limitée',
      resume: 'Plaqué or · Maille fine',
      description: 'Une maille fine plaquée or, souple au poignet.\n\nUn bracelet raffiné qui se superpose avec élégance.',
      details: [['Matière', 'Plaqué or'], ['Maille', 'Fine']]
    }
  ]
};
