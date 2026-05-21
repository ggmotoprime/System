// ══════════════════════════════════════════════
// DATA.JS — Toutes les données statiques
// ══════════════════════════════════════════════

const HABITS = ['Sport','Nutrition','Coran','Islam','Arabe','Pushup','No Scroll','Priere','Skill','Chess'];
const NOTION_NAMES = {'Sport':'Sport','Nutrition':'Nutrition','Quran':'Coran','Islam':'Islam','Arabe':'Arabe','Pushup':'Pushup','No phone':'No Scroll','Prayer':'Priere','Skill':'Skill','Chess':'Chess'};
const NOTION_KEYS = Object.keys(NOTION_NAMES);
const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e'];
const CATEGORIES = {'Tout':null,'Sport':['Sport','Pushup'],'Religion':['Coran','Islam','Priere'],'Apprentissage':['Arabe','Skill','Chess'],'Discipline':['No Scroll','Nutrition']};

const RANKS = [
  {n:'E — Recrue',    e:'🪨', min:0,      max:2000,    c:'#9ca3af', d:'Le debut.',                        passif:null},
  {n:'D — Apprenti',  e:'🛡️', min:2000,   max:6000,    c:'#cd7f32', d:'La routine s installe.',           passif:{id:'endurance',  desc:'Les jours 9/10 comptent pour le streak.'}},
  {n:'C — Chasseur',  e:'⚔️', min:6000,   max:14000,   c:'#a0a0a0', d:'Tu es constant.',                  passif:{id:'resilience', desc:'Boss échoué = -150 PD au lieu de -300 PD.'}},
  {n:'B — Guerrier',  e:'🏹', min:14000,  max:28000,   c:'#f59e0b', d:'Tu depasses la moyenne.',          passif:{id:'momentum',   desc:'Semaine 7/7 ≥ 7/10 → +200 PD automatiques.'}},
  {n:'A — Elite',     e:'🔥', min:28000,  max:50000,   c:'#22c55e', d:'Peu arrivent ici.',                passif:{id:'mastery',    desc:'Chaque habitude vaut +2 PA supplémentaires.'}},
  {n:'S — Maitre',    e:'💎', min:50000,  max:80000,   c:'#60a5fa', d:'Ta discipline est un exemple.',    passif:{id:'ascension',  desc:'Bonus streak doublé à partir de 7 jours.'}},
  {n:'SS — Legende',  e:'👑', min:80000,  max:120000,  c:'#e879f9', d:'Tu as transforme ta vie.',         passif:null},
  {n:'SSS — Transcendant', e:'⭐', min:120000, max:Infinity, c:'#fbbf24', d:'365 jours de discipline absolue.', passif:null},
];

// Textes d'Éveil par rang
const RANK_AWAKENING = {
  'D': {
    title: "L'Apprenti est Né",
    text: "Tu as prouvé que tu n'étais pas là par accident. Le Système t'a évalué. Tu passes du chaos à la routine. Ce n'est pas encore la puissance. C'est la fondation.",
    unlocks: ["Passif débloqué : les jours 9/10 comptent pour ton streak", "Nouveaux bonus boutique accessibles"]
  },
  'C': {
    title: "Le Chasseur Émerge",
    text: "Tu n'es plus celui que tu étais. Le Système a mis à jour son évaluation. Ta constance n'est plus une tentative — c'est une réalité mesurable.",
    unlocks: ["Passif débloqué : boss échoué = -150 PD seulement", "Boss Légendaires accessibles", "Titre Chasseur débloqué"]
  },
  'B': {
    title: "Le Guerrier Reconnu",
    text: "La majorité s'arrête ici. Le Système a enregistré que tu n'es pas la majorité.",
    unlocks: ["Passif débloqué : semaine parfaite → +200 PD auto", "Titre Guerrier débloqué"]
  },
  'A': {
    title: "L'Élite Confirmée",
    text: "Peu de gens voient cet écran. Le Système n'a pas de mots pour les autres — seulement pour toi.",
    unlocks: ["Passif débloqué : +2 PA par habitude", "Titre Elite débloqué"]
  },
  'S': {
    title: "Le Maître Éveillé",
    text: "Le Système enregistre ceci comme un événement rare. Tu as traversé ce que la plupart ne commencent jamais.",
    unlocks: ["Passif débloqué : bonus streak doublé", "Titre Maître débloqué"]
  },
  'SS': {
    title: "La Légende Vivante",
    text: "Au-delà des rangs. Le Système n'a plus de cases pour ce que tu es devenu.",
    unlocks: ["Statut Légende permanent"]
  },
};

// Messages du Système — voix narrative adaptative
const SYSTEM_MESSAGES = {
  perfect: [
    "10/10. Le Système enregistre. Rang provisoire : DIGNE.",
    "Journée parfaite. Ces données ne se perdent pas.",
    "Complet. Le Système note : tu peux le faire.",
    "10 sur 10. Le Système n'a rien à ajouter."
  ],
  streak_30: [
    "30 jours. Le Système reclassifie : ce n'est plus une habitude. C'est une nature.",
    "Trente jours consécutifs. Le Système observe. Tu es devenu autre chose."
  ],
  streak_14: [
    "14 jours sans faillir. Le Système commence à te reconnaître différemment.",
    "Deux semaines. Le Système enregistre : la constance est réelle."
  ],
  streak_7: [
    "Chasseur. Tes pas sont calculés. Le Système a remarqué.",
    "7 jours. Le hasard ne tient pas 7 jours. C'est de la volonté.",
    "Semaine complète. Le Système te réévalue."
  ],
  boss_won: [
    "Boss vaincu. Le Système a enregistré ta victoire. Continue.",
    "Le donjon est fermé. Tu as survécu. Le Système note la méthode."
  ],
  first_fail_after_streak: [
    "Tu as glissé. Le Système n'oublie pas. Mais il te regarde encore.",
    "La fissure est enregistrée. Elle ne te définit pas — sauf si tu la laisses faire.",
    "Chute enregistrée. Le Système a vu pire se relever."
  ],
  comeback: [
    "Tu reviens. Le Système avait noté l'absence. Il note aussi le retour.",
    "Retour après l'obscurité. Le Système préfère ça à l'abandon."
  ],
  monday_zero: [
    "La semaine commence. Le Système attend. Qu'est-ce que tu choisiras d'être ?",
    "Lundi. Page blanche. Le Système ne te juge pas encore.",
    "Nouveau cycle. Les boss de la semaine sont en position."
  ],
  high: [
    "Solide. Le Système enregistre.",
    "Au-dessus du seuil. Continue.",
    "Le Système note : tu tiens."
  ],
  mid: [
    "Encore des cases vides. Le Système attend la suite.",
    "Mi-chemin. Le Système ne se prononce pas encore.",
    "Tu peux tout renverser. Le Système regarde."
  ],
  low: [
    "Le Système a enregistré cette journée. Elle n'est pas terminée.",
    "Faible. Mais le Système enregistre même ça.",
    "La discipline commence par recommencer."
  ],
  zero_morning: [
    "Le Système attend. La journée n'a pas encore décidé de ce qu'elle sera.",
    "Rien encore. Le Système ne juge pas les débuts — seulement les abandons."
  ]
};

// Titres débloquables
const TITLES = [
  {id:'inarretable',   name:'Inarrêtable',      condition: d => d.best >= 14},
  {id:'centurion',     name:'Le Centurion',      condition: d => d.best >= 100},
  {id:'recitant',      name:'Récitant',          condition: d => (d.habitCounts['Coran']||0) >= 30},
  {id:'hors_du_bruit', name:'Hors du Bruit',     condition: d => (d.habitStreaks['No Scroll']||0) >= 14},
  {id:'fils_du_fer',   name:'Fils du Fer',       condition: d => d.bossWonCount >= 3},
  {id:'chasseur',      name:'Chasseur',          condition: d => d.rankIndex >= 2},
  {id:'guerrier',      name:'Guerrier',          condition: d => d.rankIndex >= 3},
  {id:'elite',         name:'Élite',             condition: d => d.rankIndex >= 4},
  {id:'vainqueur',     name:'Vainqueur de l\'Ombre', condition: d => d.bossWonCount >= 5},
  {id:'silencieux',    name:'Le Silencieux',     condition: d => (d.habitCounts['No Scroll']||0) >= 50},
  {id:'priant',        name:'Le Priant',         condition: d => (d.habitCounts['Priere']||0) >= 60},
  {id:'premier_pas',   name:'Premier Pas',       condition: d => d.totalDays >= 1},
];

// Textes narratifs par palier d'attribut
const ATTR_NARRATIVES = {
  discipline:    {5:"La routine commence à tenir.",10:"L'effort n'est plus une question — c'est une réponse.",20:"Tu portes quelque chose que la plupart ne cherchent jamais.",50:"Niveau 50. Le Système reclassifie : Discipliné Confirmé.",100:"Maximum. Le Système n'a plus rien à mesurer ici."},
  physique:      {5:"Ton corps commence à comprendre le langage de l'effort.",10:"L'effort n'est plus une douleur. C'est un dialogue.",20:"Tu portes quelque chose que la plupart n'ont jamais cherché.",50:"Niveau 50 — Physique. Athlète Confirmé.",100:"Maximum. Le Système n'a plus rien à mesurer ici."},
  nutrition:     {5:"Le corps reçoit ce qu'il mérite.",10:"La discipline alimentaire devient une seconde nature.",20:"Tu nourris autre chose que la faim.",50:"Niveau 50 — Nutrition. Le Système approuve.",100:"Maximum."},
  spiritualite:  {5:"Le lien commence à se tisser.",10:"La prière n'est plus une obligation. C'est une ancre.",20:"Tu te rapproches de ce qui compte vraiment.",50:"Niveau 50 — Spiritualité. Le Système s'incline.",100:"Maximum. Au-delà des rangs."},
  intelligence:  {5:"L'apprentissage commence à s'ancrer.",10:"Tu retiens. Tu construis.",20:"L'intelligence n'est pas un don. Tu l'as prouvé.",50:"Niveau 50 — Intelligence. Savant Confirmé.",100:"Maximum."},
  mental:        {5:"La résistance commence à se former.",10:"L'inconfort ne te surprend plus.",20:"Tu contrôles ce que la plupart subissent.",50:"Niveau 50 — Mental. Moine Confirmé.",100:"Maximum."},
  social:        {5:"La présence commence à se développer.",10:"Tu prends ta place naturellement.",20:"L'aisance n'est plus un effort.",50:"Niveau 50 — Social.",100:"Maximum."},
  execution:     {5:"Tu commences à finir ce que tu commences.",10:"L'action précède la motivation.",20:"Tu exécutes pendant que les autres planifient.",50:"Niveau 50 — Exécution. Le Système enregistre.",100:"Maximum."},
};

const ATTRIBUTES = [
  {id:'discipline',   name:'Discipline',       emoji:'⚔️', color:'#06b6d4', desc:'La base absolue.',              goal:'Maitriser ses impulsions, respecter sa routine sans exception.',
   subs:[{id:'disc_noscroll',name:'No Scroll',desc:'Resistance numerique'},{id:'disc_routine',name:'Routine',desc:'Reveil tot, protocole'},{id:'disc_exec',name:'Execution',desc:'Agir sans reporter'},{id:'disc_constance',name:'Constance',desc:'Tenir sur la duree'}]},
  {id:'physique',     name:'Physique',          emoji:'💪', color:'#ef4444', desc:'Force, endurance, technique.',   goal:'Corps fonctionnel et puissant.',
   subs:[{id:'phy_force',name:'Force',desc:'Musculation, calisthenics'},{id:'phy_endurance',name:'Endurance',desc:'Course, marche, cardio'},{id:'phy_technique',name:'Technique',desc:'Grappling, natation'},{id:'phy_vitesse',name:'Vitesse',desc:'Explosivite, sprint'}]},
  {id:'nutrition',    name:'Nutrition',         emoji:'🥗', color:'#22c55e', desc:'70-75kg / 1m75 muscle.',        goal:'Nutrition propre. Corps muscle.',
   subs:[{id:'nut_qualite',name:'Qualite repas',desc:'Manger propre'},{id:'nut_cuisinier',name:'Cuisinier',desc:'Cuisiner soi-meme'},{id:'nut_compo',name:'Composition',desc:'Ratio muscle/graisse'},{id:'nut_connaissance',name:'Connaissance',desc:'Macros, timing'}]},
  {id:'spiritualite', name:'Spiritualite',      emoji:'🌙', color:'#a78bfa', desc:'Se rapprocher d Allah.',         goal:'5 prieres a l heure, memoriser sourates, Sira, Hadith.',
   subs:[{id:'spi_salat',name:'Salat',desc:'5 prieres a l heure'},{id:'spi_coran',name:'Coran',desc:'Lecture + memorisation'},{id:'spi_ilm',name:'Connaissance',desc:'Hadith, Sira, Fiqh'},{id:'spi_dhikr',name:'Dhikr',desc:'Dhikr quotidien'}]},
  {id:'intelligence', name:'Intelligence',      emoji:'🧠', color:'#f97316', desc:'Apprendre, analyser, retenir.',  goal:'Arabe maitrise, competences reelles, 2000 Elo.',
   subs:[{id:'int_arabe',name:'Arabe',desc:'Vocabulaire et grammaire'},{id:'int_skill',name:'Competences',desc:'Apprentissage actif'},{id:'int_echecs',name:'Echecs 2000 Elo',desc:'Strategie, calcul'},{id:'int_memoire',name:'Memoire',desc:'Retention, fiches'}]},
  {id:'mental',       name:'Controle Mental',   emoji:'🧘', color:'#8b5cf6', desc:'Resistance a l inconfort.',      goal:'Gerer emotions, resister distractions, stabilite.',
   subs:[{id:'men_resist',name:'Resistance',desc:'Douche froide, bain glace'},{id:'men_ennui',name:'Gestion ennui',desc:'Tenir sans distractions'},{id:'men_impulse',name:'Impulsions',desc:'Resister aux envies'},{id:'men_stabilite',name:'Stabilite',desc:'Constance humeur'}]},
  {id:'social',       name:'Social',            emoji:'🗣️', color:'#ec4899', desc:'Aisance et presence naturelle.', goal:'A l aise avec les gens, conversations, connexions.',
   subs:[{id:'soc_aisance',name:'Aisance',desc:'Approcher sans hesiter'},{id:'soc_confiance',name:'Confiance',desc:'Presence, assurance'},{id:'soc_comm',name:'Communication',desc:'Clarte, ecoute'},{id:'soc_presence',name:'Presence',desc:'Impact dans un groupe'}]},
  {id:'execution',    name:'Execution',         emoji:'⚡', color:'#14b8a6', desc:'Intention action. Sans delai.',   goal:'Finir ce qu on commence. Constance.',
   subs:[{id:'exe_finish',name:'Finir',desc:'Aller jusqu au bout'},{id:'exe_prio',name:'Priorisation',desc:'Identifier ce qui compte'},{id:'exe_vitesse',name:'Vitesse',desc:'Agir rapidement'},{id:'exe_constance',name:'Constance',desc:'Maintenir effort'}]},
];

// PA donnés par boss selon difficulté (répartis sur l'attribut du boss)
const BOSS_PA_BY_DIFF = { 'Normale':60, 'Difficile':120, 'Extreme':200, 'Legendaire':300 };

// PA donnés par quête selon difficulté
const QUEST_PA_BY_DIFF = { 'easy':30, 'medium':60, 'hard':100 };

// PA donnés par skill maîtrisé selon catégorie
const SKILL_PA_MAP = {
  'Calisthenics':'physique', 'Endurance':'physique', 'Force':'physique',
  'Echecs':'intelligence', 'Coran et Islam':'spiritualite', 'Langue Arabe':'intelligence',
  'Mental':'mental', 'Code et Tech':'execution', 'Cuisine':'execution',
};
const SKILL_PA_AMOUNT = 80;

const BOSSES_DEFAULT = [
  {n:'L Ascete du Silence',i:'🔕',d:'Difficile',l:'Aucune musique, YouTube, podcast. 7 jours.',s:['Aucune musique lundi','Aucune musique mardi','Aucune musique mercredi','Aucune musique jeudi','Aucune musique vendredi','Aucune video semaine','Aucun podcast semaine'],r:600,a:'mental',week:1},
  {n:'Le Reveil du Guerrier',i:'🌅',d:'Extreme',l:'5h du matin, 7 jours.',s:['5h00 lundi','5h00 mardi','5h00 mercredi','5h00 jeudi','5h00 vendredi','5h00 samedi','5h00 dimanche'],r:800,a:'discipline',week:2},
  {n:'Le Marcheur de l Infini',i:'🦶',d:'Extreme',l:'200 000 pas en 7 jours.',s:['28k pas lundi','28k pas mardi','28k pas mercredi','28k pas jeudi','28k pas vendredi','28k pas samedi','28k pas dimanche'],r:950,a:'physique',week:3},
  {n:'Le Bain de Glace',i:'🧊',d:'Difficile',l:'Douche froide chaque matin. 7 jours.',s:['Douche froide lundi','Douche froide mardi','Douche froide mercredi','Douche froide jeudi','Douche froide vendredi','Douche froide samedi','Douche froide dimanche'],r:500,a:'mental',week:4},
  {n:'Le Conquerant des Echecs',i:'♟️',d:'Legendaire',l:'+100 Elo en une semaine.',s:['Analyser 1 partie/jour','5 parties min/jour','Gagner 3 consecutives','+100 Elo net'],r:1000,a:'intelligence',week:5},
  {n:'L Ermite Numerique',i:'📵',d:'Legendaire',l:'Telephone eteint a 20h. 7 jours.',s:['Eteint 20h lundi','Eteint 20h mardi','Eteint 20h mercredi','Eteint 20h jeudi','Eteint 20h vendredi','Eteint 20h samedi','Eteint 20h dimanche'],r:700,a:'discipline',week:6},
  {n:'Le Double Effort',i:'💥',d:'Extreme',l:'2 seances de sport par jour, 7 jours.',s:['2 seances lundi','2 seances mardi','2 seances mercredi','2 seances jeudi','2 seances vendredi','2 seances samedi','2 seances dimanche'],r:900,a:'physique',week:7},
  {n:'La Recitation Totale',i:'📖',d:'Legendaire',l:'3 nouvelles sourates memorisees.',s:['Memoriser sourate 1 j1-2','Reciter sourate 1 sans regarder','Memoriser sourate 2 j3-4','Reciter sourate 2 sans regarder','Memoriser sourate 3 j5-6','Reciter les 3 dimanche'],r:1000,a:'spiritualite',week:8},
  {n:'Le Centurion',i:'💪',d:'Extreme',l:'100 pompes d affilee dimanche.',s:['Max pompes lundi','Battre record mercredi','S approcher 100 vendredi','100 pompes dimanche'],r:750,a:'physique',week:9},
  {n:'Le Journal du Sage',i:'✍️',d:'Normale',l:'1 page de journal chaque soir.',s:['Page lundi','Page mardi','Page mercredi','Page jeudi','Page vendredi','Page samedi','Page dimanche'],r:400,a:'intelligence',week:10},
  {n:'L Abstinent Total',i:'🚫',d:'Difficile',l:'Zero nourriture transformee. 7 jours.',s:['Zero junk lundi','Zero junk mardi','Zero junk mercredi','Zero junk jeudi','Zero junk vendredi','Zero junk samedi','Zero junk dimanche'],r:600,a:'nutrition',week:11},
  {n:'L Invisible Social',i:'🗣️',d:'Difficile',l:'1 inconnu par jour. 7 jours.',s:['Inconnu lundi','Inconnu mardi','Inconnu mercredi','Inconnu jeudi','Inconnu vendredi','Inconnu samedi','Inconnu dimanche'],r:650,a:'social',week:12},
  {n:'Le Moine du Lever',i:'🌙',d:'Extreme',l:'Fajr + 20min dhikr avant tout ecran. 7j.',s:['Fajr+dhikr lundi','Fajr+dhikr mardi','Fajr+dhikr mercredi','Fajr+dhikr jeudi','Fajr+dhikr vendredi','Fajr+dhikr samedi','Fajr+dhikr dimanche'],r:800,a:'spiritualite',week:13},
  {n:'Le Polyglotte',i:'🌍',d:'Difficile',l:'100 mots arabes/jour + test final.',s:['100 mots lundi','100 mots mardi','100 mots mercredi','100 mots jeudi','100 mots vendredi','100 mots samedi','Test 80% dimanche'],r:700,a:'intelligence',week:14},
  {n:'La Diete Mentale',i:'🧘',d:'Difficile',l:'10min meditation + 30min sans telephone. 7j.',s:['Meditation lundi','Meditation mardi','Meditation mercredi','Meditation jeudi','Meditation vendredi','Meditation samedi','Meditation dimanche'],r:500,a:'mental',week:15},
];

const QUESTS_DEFAULT = [
  {i:'🏋️',n:'50 pompes d affilee',d:'Consecutives, sans pause.',diff:'hard',r:250,a:'physique'},
  {i:'🤸',n:'10 tractions d affilee',d:'Propres, consecutives.',diff:'hard',r:250,a:'physique'},
  {i:'🏃',n:'Courir 20km',d:'En une seule sortie.',diff:'hard',r:400,a:'physique'},
  {i:'🏊',n:'Nager 500m non-stop',d:'Sans s arreter.',diff:'hard',r:280,a:'physique'},
  {i:'🙏',n:'5 prieres a l heure',d:'Exactement a l heure.',diff:'medium',r:200,a:'spiritualite'},
  {i:'🌙',n:'1h de Coran d un trait',d:'Sans interruption.',diff:'medium',r:200,a:'spiritualite'},
  {i:'🧠',n:'Fiche Islam complete',d:'Un sujet islamique complete.',diff:'easy',r:150,a:'spiritualite'},
  {i:'📖',n:'Memoriser une sourate',d:'Recitee de memoire.',diff:'hard',r:350,a:'spiritualite'},
  {i:'🥗',n:'Journee nutrition parfaite',d:'Zero sucre, zero grignotage.',diff:'medium',r:180,a:'nutrition'},
  {i:'🍳',n:'Apprendre une nouvelle recette',d:'Cuisine et mange un plat nouveau.',diff:'easy',r:120,a:'nutrition'},
  {i:'💬',n:'Discussion islamique',d:'Echange serieux sur un sujet islamique.',diff:'medium',r:170,a:'social'},
  {i:'🤝',n:'Parler a un inconnu',d:'Vraie conversation.',diff:'medium',r:200,a:'social'},
  {i:'💌',n:'Message de gratitude',d:'Message sincere a quelqu un.',diff:'easy',r:100,a:'social'},
  {i:'🧊',n:'Douche froide 5min',d:'5 min eau froide.',diff:'medium',r:150,a:'mental'},
  {i:'🌅',n:'Lever avant 6h',d:'Sans telephone 1h.',diff:'medium',r:200,a:'discipline'},
  {i:'🛏️',n:'Au lit avant 22h',d:'Couche avant 22h.',diff:'easy',r:130,a:'discipline'},
  {i:'📵',n:'Pas de telephone la journee',d:'Aucun telephone pendant tout le jour.',diff:'hard',r:300,a:'discipline'},
  {i:'🧘',n:'20min meditation',d:'Pleine conscience.',diff:'medium',r:160,a:'mental'},
  {i:'✍️',n:'Lettre a ton futur toi',d:'Ecris a toi-meme dans 1 an.',diff:'easy',r:120,a:'intelligence'},
  {i:'📚',n:'Lire 30 pages',d:'En session continue.',diff:'easy',r:130,a:'intelligence'},
  {i:'🎯',n:'3 objectifs du mois',d:'Precis et mesurables.',diff:'easy',r:120,a:'execution'},
  {i:'🔇',n:'3h sans telephone',d:'3 heures productives.',diff:'medium',r:180,a:'discipline'},
  {i:'🎨',n:'Creer quelque chose',d:'Dessine, ecris, code, compose.',diff:'medium',r:180,a:'intelligence'},
  {i:'🌿',n:'Journee sans reseaux',d:'Instagram, TikTok - off 24h.',diff:'hard',r:280,a:'discipline'},
  {i:'📊',n:'Analyser 5 parties d echecs',d:'Parties perdues, analysees.',diff:'medium',r:180,a:'intelligence'},
];

const BONUSES_DEFAULT = [
  {e:'🍽️',n:'Repas au restaurant',c:500,cond:'Rang >= D',mr:1},
  {e:'🍕',n:'Cheat meal',c:300,cond:'Semaine >= 70%',mr:0},
  {e:'🎬',n:'Soiree serie / film',c:150,cond:'Journee >= 7/10',mr:0},
  {e:'🎮',n:'Session gaming',c:250,cond:'Streak >= 7j',mr:0},
  {e:'👕',n:'Achat vetements',c:800,cond:'Rang >= C',mr:2},
  {e:'🛒',n:'Achat non-essentiel',c:600,cond:'Rang >= B',mr:3},
  {e:'🛍️',n:'Achat tech / gadget',c:1500,cond:'Rang >= A',mr:4},
  {e:'✈️',n:'Sortie / voyage',c:3000,cond:'Rang >= S',mr:5},
  {e:'🎉',n:'Soiree entre amis',c:400,cond:'Rang >= D',mr:1},
  {e:'🍔',n:'Fast food',c:200,cond:'Journee >= 8/10',mr:0},
  {e:'📚',n:'Acheter un livre',c:200,cond:'Rang >= E',mr:0},
  {e:'🎯',n:'Journee totalement libre',c:500,cond:'Semaine parfaite',mr:0},
];

const MALUSES_DEFAULT = [
  {e:'🍽️',n:'Resto sans meriter',c:800},
  {e:'🍕',n:'Cheat meal non merite',c:500},
  {e:'📱',n:'Reseaux non merites',c:350},
  {e:'🛒',n:'Achat impulsif',c:1000},
  {e:'🎮',n:'Gaming non merite',c:400},
  {e:'🎬',n:'Serie non meritee',c:300},
  {e:'🍔',n:'Fast food non merite',c:350},
  {e:'😴',n:'Grasse matinee non meritee',c:250},
  {e:'📺',n:'YouTube en boucle',c:300},
  {e:'🛍️',n:'Shopping impulsif',c:800},
  {e:'😪',n:'Rater son reveil',c:200},
  {e:'📵',n:'Rater ses prieres',c:250},
  {e:'🧠',n:'Journee sans apprendre',c:200},
];

const SKILLS_DATA_DEFAULT = [
  {cat:'Calisthenics',icon:'💪',items:['Faire 1 muscle-up strict','Faire 5 muscle-ups consecutifs','Tenir un front lever 5 secondes','Tenir handstand 10s contre mur','Tenir un handstand libre 5 secondes','Faire 20 tractions strictes','Faire 50 pompes consecutives','Realiser un backflip depuis le sol','Realiser un frontflip depuis le sol']},
  {cat:'Endurance',icon:'🏃',items:['Courir 5km sans arreter','Courir 10km en moins d 1h','Courir un semi-marathon 21km','Finir un marathon 42km','Nager 1km en continu','Marcher 30km en une journee','Atteindre 10 000 pas par jour 30j']},
  {cat:'Force',icon:'🏋️',items:['Squatter 1x son propre poids','100 pompes en une journee','100 tractions en une journee','200 abdos en une session']},
  {cat:'Echecs',icon:'♟️',items:['Atteindre 1200 Elo en ligne','Atteindre 1500 Elo en ligne','Atteindre 1800 Elo en ligne','Atteindre 2000 Elo en ligne','Maitriser l ouverture italienne','Resoudre 500 puzzles tactiques']},
  {cat:'Coran et Islam',icon:'🕌',items:['Memoriser Al-Fatiha parfaitement','Memoriser Juz Amma complet 30e','Memoriser les 10 dernieres sourates','Memoriser Ayat Al-Kursi','Lire le Coran entier une fois','Apprendre le Tajwid basique','Connaitre les 5 piliers en detail','Connaitre 50 hadiths Nawawi']},
  {cat:'Langue Arabe',icon:'🗣️',items:['Apprendre l alphabet arabe complet','Lire des mots arabes sans voyelles','Apprendre 500 mots de vocabulaire','Apprendre 1000 mots de vocabulaire','Tenir une conversation de 5 min en arabe']},
  {cat:'Code et Tech',icon:'💻',items:['Creer une page web HTML CSS complete','Rendre un site responsive mobile','Creer un script JavaScript fonctionnel','Deployer un site sur GitHub Pages','Ecrire un script Python de base']},
  {cat:'Cuisine',icon:'🍳',items:['Cuisiner un poulet roti entier','Calculer ses macros journalieres','Preparer ses repas pour la semaine','Cuisiner sans huile saturee pendant 30j']},
  {cat:'Mental',icon:'🧘',items:['Mediter 10 min pendant 30j consecutifs','Tenir un journal pendant 60 jours','Pratiquer le stoicisme 30j journaling','Resister a une habitude negative 30j']},
];
