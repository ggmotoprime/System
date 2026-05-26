// ══════════════════════════════════════════════
// DATA.JS — Toutes les données statiques
// ══════════════════════════════════════════════

const HABITS = ['Sport','Nutrition','Coran','Islam','Arabe','Pushup','No Scroll','Priere','Skill','Chess'];
const NOTION_NAMES = {'Sport':'Sport','Nutrition':'Nutrition','Quran':'Coran','Islam':'Islam','Arabe':'Arabe','Pushup':'Pushup','No phone':'No Scroll','Prayer':'Priere','Skill':'Skill','Chess':'Chess'};
const NOTION_KEYS = Object.keys(NOTION_NAMES);
const COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899','#14b8a6','#f43f5e'];
const CATEGORIES = {'Tout':null,'Sport':['Sport','Pushup'],'Religion':['Coran','Islam','Priere'],'Apprentissage':['Arabe','Skill','Chess'],'Discipline':['No Scroll','Nutrition']};

const RANKS = [
  {n:'E — Recrue',         e:'🪨', min:0,       max:2000,    c:'#9ca3af', d:'Le debut.',                        passif:null},
  {n:'D — Apprenti',       e:'🛡️', min:2000,    max:6000,    c:'#cd7f32', d:'La routine s installe.',           passif:{id:'endurance',  desc:'Les jours 9/10 comptent pour le streak.'}},
  {n:'C — Chasseur',       e:'⚔️', min:6000,    max:14000,   c:'#a0a0a0', d:'Tu es constant.',                  passif:{id:'resilience', desc:'Boss échoué = -150 PD au lieu de -300 PD.'}},
  {n:'B — Guerrier',       e:'🏹', min:14000,   max:28000,   c:'#f59e0b', d:'Tu depasses la moyenne.',          passif:{id:'momentum',   desc:'Semaine 7/7 ≥ 7/10 → +200 PD automatiques.'}},
  {n:'A — Elite',          e:'🔥', min:28000,   max:50000,   c:'#22c55e', d:'Peu arrivent ici.',                passif:{id:'mastery',    desc:'Chaque habitude vaut +2 PA supplémentaires.'}},
  {n:'S — Maitre',         e:'💎', min:50000,   max:80000,   c:'#60a5fa', d:'Ta discipline est un exemple.',    passif:{id:'ascension',  desc:'Bonus streak doublé à partir de 7 jours.'}},
  {n:'SS — Legende',       e:'👑', min:80000,   max:120000,  c:'#e879f9', d:'Tu as transforme ta vie.',         passif:null},
  {n:'SSS — Transcendant', e:'⭐', min:120000,  max:Infinity, c:'#fbbf24', d:'365 jours de discipline absolue.', passif:null},
];

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

const TITLES = [
  {id:'premier_pas',    name:'Premier Pas',           condition: d => d.totalDays >= 1},
  {id:'inarretable',    name:'Inarrêtable',            condition: d => d.best >= 14},
  {id:'centurion',      name:'Le Centurion',           condition: d => d.best >= 100},
  {id:'recitant',       name:'Récitant',               condition: d => (d.habitCounts['Coran']||0) >= 30},
  {id:'hors_du_bruit',  name:'Hors du Bruit',          condition: d => (d.habitStreaks['No Scroll']||0) >= 14},
  {id:'fils_du_fer',    name:'Fils du Fer',            condition: d => d.bossWonCount >= 3},
  {id:'chasseur',       name:'Chasseur',               condition: d => d.rankIndex >= 2},
  {id:'guerrier',       name:'Guerrier',               condition: d => d.rankIndex >= 3},
  {id:'elite',          name:'Élite',                  condition: d => d.rankIndex >= 4},
  {id:'vainqueur',      name:'Vainqueur de l\'Ombre',  condition: d => d.bossWonCount >= 5},
  {id:'silencieux',     name:'Le Silencieux',          condition: d => (d.habitCounts['No Scroll']||0) >= 50},
  {id:'priant',         name:'Le Priant',              condition: d => (d.habitCounts['Priere']||0) >= 60},
  {id:'sans_faille',    name:'Sans Faille',            condition: d => d.bossWonCount >= 5 && d.rankIndex >= 1},
  {id:'fils_ummah',     name:'Fils de la Ummah',       condition: d => (d.habitCounts['Priere']||0) >= 60 && (d.habitCounts['Coran']||0) >= 60},
  {id:'sobre',          name:'Le Sobre',               condition: d => (d.habitStreaks['Nutrition']||0) >= 30},
  {id:'maitre_ombres',  name:'Maître des Ombres',      condition: d => (d.habitCounts['No Scroll']||0) >= 100},
  {id:'gardien_temple', name:'Gardien du Temple',      condition: d => (d.habitCounts['Priere']||0) >= 100},
  {id:'erudit',         name:'L\'Érudit',              condition: d => (d.habitCounts['Chess']||0) >= 50 && (d.habitCounts['Arabe']||0) >= 50},
  {id:'architecte',     name:'Architecte',             condition: d => d.rankIndex >= 3 && d.bossWonCount >= 8},
  {id:'transcendant',   name:'Transcendant',           condition: d => d.rankIndex >= 6},
];

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

const BOSS_PA_BY_DIFF   = { 'Normale':60, 'Difficile':130, 'Extreme':220, 'Legendaire':350, 'Mythique':500 };
const QUEST_PA_BY_DIFF  = { 'easy':30, 'medium':60, 'hard':100 };
const SKILL_PA_MAP = {
  'Calisthenics':           'physique',
  'Endurance & Course':     'physique',
  'Force & Musculation':    'physique',
  'Mobilite & Souplesse':   'physique',
  'Arts Martiaux & Grappling': 'physique',
  'Natation':               'physique',
  'Echecs':                 'intelligence',
  'Coran & Islam':          'spiritualite',
  'Langue Arabe':           'intelligence',
  'Code & Tech':            'execution',
  'Mecanique & Bricolage':  'execution',
  'Cuisine & Nutrition':    'nutrition',
  'Finance & Business':     'execution',
  'Survie & Autonomie':     'mental',
  'Memoire & Apprentissage':'intelligence',
  'Creation & Expression':  'intelligence',
  'Psychologie & Discipline':'mental',
  'Culture Generale':       'intelligence',
};
const SKILL_PA_AMOUNT = 80;

const BOSSES_DEFAULT = [
  {n:'L Ascete du Silence',i:'🔕',d:'Difficile',l:'Aucune musique, YouTube, podcast. 7 jours.',s:['Aucune musique lundi','Aucune musique mardi','Aucune musique mercredi','Aucune musique jeudi','Aucune musique vendredi','Aucune video semaine','Aucun podcast semaine'],r:600,a:'mental',week:1},
  {n:'Le Reveil du Guerrier',i:'🌅',d:'Extreme',l:'5h du matin, 7 jours.',s:['5h00 lundi','5h00 mardi','5h00 mercredi','5h00 jeudi','5h00 vendredi','5h00 samedi','5h00 dimanche'],r:800,a:'discipline',week:2},
  {n:'Le Marcheur de l Infini',i:'🦶',d:'Extreme',l:'200 000 pas en 7 jours.',s:['28k pas lundi','28k pas mardi','28k pas mercredi','28k pas jeudi','28k pas vendredi','28k pas samedi','28k pas dimanche'],r:950,a:'physique',week:3},
  {n:'Le Bain de Glace',i:'🧊',d:'Difficile',l:'Douche froide chaque matin. 7 jours.',s:['Douche froide lundi','Douche froide mardi','Douche froide mercredi','Douche froide jeudi','Douche froide vendredi','Douche froide samedi','Douche froide dimanche'],r:500,a:'mental',week:4},
  {n:'Le Conquerant des Echecs',i:'♟️',d:'Legendaire',l:'+100 Elo en une semaine.',s:['Analyser 1 partie/jour','5 parties min/jour','Gagner 3 consecutives','+100 Elo net'],r:1000,a:'intelligence',week:5},
  {n:'Le Double Effort',i:'💥',d:'Extreme',l:'2 seances de sport par jour, 7 jours.',s:['2 seances lundi','2 seances mardi','2 seances mercredi','2 seances jeudi','2 seances vendredi','2 seances samedi','2 seances dimanche'],r:900,a:'physique',week:7},
  {n:'Le Centurion',i:'💪',d:'Extreme',l:'100 pompes d affilee dimanche.',s:['Max pompes lundi','Battre record mercredi','S approcher 100 vendredi','100 pompes dimanche'],r:750,a:'physique',week:9},
  {n:"Le Purgatoire Numérique",i:"📵",d:"Extreme",l:"Zéro réseau social, zéro YouTube, zéro série. 7 jours. Seul le nécessaire.",s:["Jour sans réseaux lundi","Jour sans réseaux mardi","Jour sans réseaux mercredi","Jour sans réseaux jeudi","Jour sans réseaux vendredi","Jour sans réseaux samedi","Jour sans réseaux dimanche"],r:900,a:"discipline",week:10},
  {n:'L Abstinent Total',i:'🚫',d:'Difficile',l:'Zero nourriture transformee. 7 jours.',s:['Zero junk lundi','Zero junk mardi','Zero junk mercredi','Zero junk jeudi','Zero junk vendredi','Zero junk samedi','Zero junk dimanche'],r:600,a:'nutrition',week:11},
  {n:'L Invisible Social',i:'🗣️',d:'Difficile',l:'1 inconnu par jour. 7 jours.',s:['Inconnu lundi','Inconnu mardi','Inconnu mercredi','Inconnu jeudi','Inconnu vendredi','Inconnu samedi','Inconnu dimanche'],r:650,a:'social',week:12},
  {n:'Le Moine du Lever',i:'🌙',d:'Extreme',l:'Fajr + 20min dhikr avant tout ecran. 7j.',s:['Fajr+dhikr lundi','Fajr+dhikr mardi','Fajr+dhikr mercredi','Fajr+dhikr jeudi','Fajr+dhikr vendredi','Fajr+dhikr samedi','Fajr+dhikr dimanche'],r:800,a:'spiritualite',week:13},
  {n:'Le Polyglotte',i:'🌍',d:'Difficile',l:'100 mots arabes/jour + test final.',s:['100 mots lundi','100 mots mardi','100 mots mercredi','100 mots jeudi','100 mots vendredi','100 mots samedi','Test 80% dimanche'],r:700,a:'intelligence',week:14},
  {n:"Le Spartiate",i:"🏕️",d:"Extreme",l:"Dormir sur le sol (tapis fin ou rien), pas de confort superflu, 7 jours.",s:["Nuit sur sol lundi","Nuit sur sol mardi","Nuit sur sol mercredi","Nuit sur sol jeudi","Nuit sur sol vendredi","Nuit sur sol samedi","Nuit sur sol dimanche"],r:800,a:"mental",week:15},
  {n:'Le Leve-Tot Absolu',i:'⚡',d:'Legendaire',l:'5h + douche froide + sport + Coran avant 7h. 7j.',s:['Protocole complet lundi','Protocole mardi','Protocole mercredi','Protocole jeudi','Protocole vendredi','Protocole samedi','Protocole dimanche'],r:1200,a:'discipline',week:16},
  {n:'Le Handstand',i:'🤸',d:'Legendaire',l:'Tenir un handstand 10 secondes.',s:['Entrainement mur lundi','Entrainement mur mardi','Equilibre mercredi','Equilibre jeudi','Raffinement vendredi','Raffinement samedi','Handstand 10s dimanche'],r:1100,a:'physique',week:17},
  {n:'Le Marathon',i:'🏃',d:'Legendaire',l:'Courir 42km. Semaine de preparation.',s:['10km lundi','Recuperation mardi','15km mercredi','Recuperation jeudi','5km vendredi','Repos samedi','Marathon dimanche'],r:1500,a:'physique',week:18},
  {n:'Le Nageur',i:'🌊',d:'Difficile',l:'1km non-stop, 7 jours.',s:['1km nage lundi','1km nage mardi','1km nage mercredi','1km nage jeudi','1km nage vendredi','1km nage samedi','1km nage dimanche'],r:750,a:'physique',week:19},
  {n:'L Immersif Arabophone',i:'🌍',d:'Extreme',l:'Penser et ecrire en arabe. 7j.',s:['Penser arabe lundi','Ecrire arabe mardi','Conversation arabe mercredi','Journal arabe jeudi','Revision vendredi','Test oral samedi','Bilan dimanche'],r:1000,a:'intelligence',week:24},
  {n:'Le 1000 Reps',i:'🏋️',d:'Extreme',l:'1000 repetitions sur la semaine.',s:['200 reps lundi','200 reps mardi','200 reps mercredi','200 reps jeudi','200 reps vendredi'],r:800,a:'physique',week:25},
  {n:'Le Stoique',i:'😶',d:'Difficile',l:'Zero plainte, zero commentaire negatif. 7j.',s:['Zero plainte lundi','Zero plainte mardi','Zero plainte mercredi','Zero plainte jeudi','Zero plainte vendredi','Zero plainte samedi','Zero plainte dimanche'],r:650,a:'mental',week:26},
  {n:'Le Vide Total',i:'📵',d:'Legendaire',l:'Zero divertissement + 5h + douche froide. 7j.',s:['Vide complet lundi','Vide complet mardi','Vide complet mercredi','Vide complet jeudi','Vide complet vendredi','Vide complet samedi','Vide complet dimanche'],r:1300,a:'discipline',week:27},
  {n:'La Retraite Spirituelle',i:'🤲',d:'Extreme',l:'5 prieres + Coran 1h + dhikr + tahajjud. 7j.',s:['5 prieres + Coran 1h lundi','Dhikr matin+soir lundi','Meme mar-mer','Meme jeu-ven','Reciter sourate samedi','Bilan dimanche'],r:1100,a:'spiritualite',week:28},
  {n:'Le Backflip',i:'🔄',d:'Legendaire',l:'Reussir un backflip.',s:['Rotation body lundi','Rotation body mardi','Backflip assiste mercredi','Backflip assiste jeudi','Semi-assiste vendredi','Semi-assiste samedi','Backflip solo dimanche'],r:1400,a:'physique',week:31},
  {n:'Les 100km de Marche',i:'🚶',d:'Legendaire',l:'Marcher 100km en une journee.',s:['Preparation physique J-7','Alimentation optimale J-3','Equipement prepare','Depart 4h matin','50km atteints','75km atteints','100km - Terminer'],r:2000,a:'physique',week:32},
  {n:'Lire le Coran en Entier',i:'📖',d:'Legendaire',l:'Lire les 114 sourates en 7 jours.',s:['Juzz 1-4 lundi','Juzz 5-8 mardi','Juzz 9-12 mercredi','Juzz 13-16 jeudi','Juzz 17-20 vendredi','Juzz 21-25 samedi','Juzz 26-30 dimanche'],r:1800,a:'spiritualite',week:33},
  {n:'Apprendre Juzz Amma',i:'🌟',d:'Extreme',l:'Memoriser les sourates de Juzz Amma.',s:['Sourates 114-110 lundi','Sourates 109-105 mardi','Sourates 104-100 mercredi','Sourates 99-95 jeudi','Sourates 94-90 vendredi','Revision samedi','Recitation complete dimanche'],r:1300,a:'spiritualite',week:34},
  {n:'L Expose',i:'🎤',d:'Extreme',l:'Parler devant un groupe sur un sujet complexe.',s:['Choisir sujet + recherche','Structurer discours','Repetition solo','Repetition filmee','Corriger erreurs','Repetition devant 1 personne','Expose devant le groupe'],r:900,a:'social',week:35},
  {n:'Le Connecteur',i:'🤝',d:'Difficile',l:'Creer 5 nouvelles relations utiles en 7 jours.',s:['Relation 1','Relation 2','Relation 3','Relation 4','Relation 5','Suivre chaque relation','Consolider 2'],r:700,a:'social',week:36},
  {n:'L Assertif',i:'🧠',d:'Extreme',l:'Dire clairement ce que tu penses dans 5 situations.',s:['Dire non clairement','Exprimer desaccord','Demander quelque chose','Recadrer quelqu un','Exprimer un besoin'],r:850,a:'social',week:37},
  {n:'Le Leader',i:'🎯',d:'Legendaire',l:'Organiser quelque chose.',s:['Concevoir le projet','Recruter participants','Planifier en detail','Briefer tout le monde','Jour J - execution','Post-bilan','Ameliorer pour la prochaine'],r:1100,a:'social',week:38},
  {n:'Creer un Site Web',i:'💻',d:'Legendaire',l:'Creer un site web professionnel.',s:['Choisir niche + domaine','Configurer hebergement','Creer structure HTML/CSS','Ajouter contenu x3 pages','Rendre responsive','SEO basique','Mettre en ligne et tester'],r:1200,a:'intelligence',week:39},
  {n:'1000 Pompes en une Journee',i:'💥',d:'Legendaire',l:'1000 pompes dans la meme journee.',s:['100 pompes matin','100 pompes matin 2','100 pompes midi','100 pompes apres-midi 1','100 pompes apres-midi 2','200 pompes soir 1','200 pompes soir 2'],r:1500,a:'physique',week:40},
  {n:"Le Gladiateur",i:"🥊",d:"Legendaire",l:"7 entraînements de sport de combat dans la semaine. Sparring réel le samedi.",s:["Entraînement combat lundi","Entraînement combat mardi","Entraînement combat mercredi","Entraînement combat jeudi","Entraînement combat vendredi","Sparring samedi","Bilan dimanche"],r:1100,a:"physique",week:45},
  {n:"Apprendre à lire l'arabe parfaitement",i:"🔤",d:"Legendaire",l:"Lire couramment tout texte arabe sans voyelles, vitesse normale.",s:["Alphabet + voyelles courts","Lecture mots sans voyelles","Texte simple 1 page","Texte Coran 1 page fluide","Texte arabe standard","Lecture 10 min non-stop","Test final : lire une page sans hésitation"],r:1500,a:"intelligence",week:53},
  {n:"Courir 100km sur une piste",i:"🏅",d:"Mythique",l:"Courir 100km en une seule journée sur piste ou route.",s:["Entraînement long J-14","Entraînement long J-7","Préparation matérielle","Départ — 0 à 25km","25 à 50km atteints","50 à 75km atteints","75 à 100km — Terminer"],r:3000,a:"physique",week:54},
  {n:"Apprendre la Citadelle du Musulman",i:"🤲",d:"Extreme",l:"Mémoriser et comprendre toutes les duas essentielles de la Citadelle.",s:["Duas du matin complètes","Duas du soir complètes","Duas de la prière","Duas quotidiennes (repas, voyage...)","Duas de protection","Révision globale","Récitation complète de mémoire"],r:1400,a:"spiritualite",week:55},
  {n:"Faire toutes les prières à la mosquée",i:"🕌",d:"Difficile",l:"Les 5 prières à la mosquée, 7 jours de suite sans exception.",s:["Fajr mosquée lundi","Fajr mosquée mardi","Fajr mosquée mercredi","Fajr mosquée jeudi","Fajr mosquée vendredi","Fajr mosquée samedi","5 prières mosquée dimanche"],r:800,a:"spiritualite",week:56},
];

const QUESTS_DEFAULT = [
  {i:'🏋️',n:'50 pompes d affilee',d:'Consecutives, sans pause.',diff:'hard',r:250,a:'physique'},
  {i:'🤸',n:'10 tractions d affilee',d:'Propres, consecutives.',diff:'hard',r:250,a:'physique'},
  {i:'🏃',n:'Courir 20km',d:'En une seule sortie.',diff:'hard',r:400,a:'physique'},
  {i:'🏊',n:'Nager 500m non-stop',d:'Sans s arreter.',diff:'hard',r:280,a:'physique'},
  {i:'🏔️',n:'Marcher 10km en nature',d:'Dehors, en nature.',diff:'hard',r:320,a:'physique'},
  {i:'💪',n:'100 pompes en plus',d:'En plus de ton entrainement habituel.',diff:'hard',r:300,a:'physique'},
  {i:'🤸',n:'100 abdos',d:'En une seule session.',diff:'medium',r:200,a:'physique'},
  {i:"🏋️",n:"Faire 30 tractions en une session",d:"Consécutives ou en clusters.",diff:"hard",r:280,a:"physique"},
  {i:"🤸",n:"Tenir L-sit 15 secondes",d:"Au sol ou aux barres.",diff:"medium",r:200,a:"physique"},
  {i:"🏃",n:"Courir 10km",d:"En une seule sortie.",diff:"hard",r:350,a:"physique"},
  {i:"🏃",n:"Courir 20km",d:"En une seule sortie.",diff:"hard",r:500,a:"physique"},
  {i:"🏃",n:"Courir 40km",d:"En une seule sortie.",diff:"hard",r:700,a:"physique"},
  {i:"💪",n:"200 squats en une session",d:"Sans pause significative.",diff:"hard",r:280,a:"physique"},
  {i:"🧘",n:"Tenir le gainage 5 minutes d'affilée",d:"Planche continue, sans poser les genoux.",diff:"medium",r:180,a:"physique"},
  {i:"🏊",n:"Nager 1km en moins de 30min",d:"Crawl ou brasse.",diff:"hard",r:300,a:"physique"},
  {i:"🚴",n:"Faire 50km à vélo en une sortie",d:"Sans arrêt prolongé.",diff:"hard",r:350,a:"physique"},
  {i:"🏔️",n:"Randonnée avec dénivelé 1000m+",d:"En nature, aller-retour ou boucle.",diff:"hard",r:400,a:"physique"},
  {i:"🤸",n:"Faire un muscle-up",d:"Strict, sans élan excessif.",diff:"hard",r:400,a:"physique"},
  {i:"💥",n:"50 burpees sans pause",d:"Complets, toucher le sol et sauter.",diff:"medium",r:220,a:"physique"},
  {i:"🦵",n:"100 fentes consécutives",d:"50 par jambe, enchaînées.",diff:"medium",r:200,a:"physique"},
  {i:'🙏',n:'5 prieres a l heure',d:'Exactement a l heure.',diff:'medium',r:200,a:'spiritualite'},
  {i:'🌙',n:'1h de Coran d un trait',d:'Sans interruption.',diff:'medium',r:200,a:'spiritualite'},
  {i:'🧠',n:'Fiche Islam complete',d:'Un sujet islamique complete.',diff:'easy',r:150,a:'spiritualite'},
  {i:'📖',n:'Memoriser une sourate',d:'Recitee de memoire.',diff:'hard',r:350,a:'spiritualite'},
  {i:'🤲',n:'1000 dhikr en une journee',d:'1000 repetitions de dhikr.',diff:'medium',r:180,a:'spiritualite'},
  {i:"🌙",n:"Prier tahajjud 7 nuits consécutives",d:"Se lever la nuit pour prier avant Fajr.",diff:"hard",r:320,a:"spiritualite"},
  {i:"📖",n:"Lire 5 juzz en une journée",d:"150 pages de Coran en une journée.",diff:"hard",r:380,a:"spiritualite"},
  {i:"🤲",n:"Réciter Juzz Amma de mémoire",d:"Les 37 sourates du 30e juzz, de mémoire.",diff:"hard",r:500,a:"spiritualite"},
  {i:"📿",n:"500 dhikr matin + 500 dhikr soir",d:"En une journée, avec présence du cœur.",diff:"medium",r:180,a:"spiritualite"},
  {i:"🌟",n:"Apprendre 20 nouveaux hadiths",d:"Mémorisés et compris.",diff:"medium",r:200,a:"spiritualite"},
  {i:"🤲",n:"Apprendre 20 duas essentielles",d:"Mémorisées en arabe, sens compris.",diff:"medium",r:220,a:"spiritualite"},
  {i:"📿",n:"Apprendre tous les dhikr du matin et du soir",d:"Citadelle complète, matin + soir.",diff:"hard",r:350,a:"spiritualite"},
  {i:"🧠",n:"Résumer la Sira du Prophète par écrit",d:"Chronologie + événements clés, par toi-même.",diff:"hard",r:350,a:"spiritualite"},
  {i:"🕌",n:"Faire toutes les prières à la mosquée un jour entier",d:"Les 5 prières, toutes à la mosquée.",diff:"medium",r:200,a:"spiritualite"},
  {i:'🥗',n:'Journee nutrition parfaite',d:'Zero sucre, zero grignotage.',diff:'medium',r:180,a:'nutrition'},
  {i:'🍳',n:'Apprendre une nouvelle recette',d:'Cuisine et mange un plat nouveau.',diff:'easy',r:120,a:'nutrition'},
  {i:'🥗',n:'Cuisiner tous ses repas',d:'Toi-meme, toute la journee.',diff:'medium',r:170,a:'nutrition'},
  {i:"🥗",n:"7 jours zéro sucre ajouté",d:"Zéro sucre industriel, sodas, bonbons.",diff:"hard",r:300,a:"nutrition"},
  {i:"🍳",n:"Meal prep complet pour 5 jours",d:"Préparer tous ses repas le dimanche.",diff:"medium",r:180,a:"nutrition"},
  {i:"💧",n:"2L d'eau minimum pendant 14 jours",d:"Chaque jour sans exception.",diff:"medium",r:160,a:"nutrition"},
  {i:"🥩",n:"Calculer et atteindre ses macros 7 jours",d:"Protéines, glucides, lipides — chaque jour.",diff:"medium",r:200,a:"nutrition"},
  {i:"🚫",n:"Zéro fast food pendant 30 jours",d:"Aucun McDonald's, KFC, Burger King.",diff:"hard",r:350,a:"nutrition"},
  {i:"🍱",n:"Cuisiner 5 recettes nouvelles en une semaine",d:"Jamais cuisiné avant.",diff:"medium",r:200,a:"nutrition"},
  {i:'💬',n:'Discussion islamique',d:'Echange serieux sur un sujet islamique.',diff:'medium',r:170,a:'social'},
  {i:'🤝',n:'Parler a un inconnu',d:'Vraie conversation.',diff:'medium',r:200,a:'social'},
  {i:'💌',n:'Message de gratitude',d:'Message sincere a quelqu un.',diff:'easy',r:100,a:'social'},
  {i:'📞',n:'Appel d un ami perdu de vue',d:'Non contacte depuis 1 mois minimum.',diff:'easy',r:100,a:'social'},
  {i:'⚔️',n:'Le 10 Inconnus',d:'Parler a 10 inconnus dans la meme journee.',diff:'hard',r:400,a:'social'},
  {i:'🙅',n:'Le Rejet',d:'Provoquer 5 refus volontairement.',diff:'hard',r:350,a:'social'},
  {i:'👁️',n:'Le Regard',d:'Maintenir contact visuel toute la journee.',diff:'medium',r:220,a:'social'},
  {i:'🗣️',n:'Parler en public',d:'Devant un groupe, meme petit.',diff:'hard',r:350,a:'social'},
  {i:'🤝',n:'Aider quelqu un sans rien attendre',d:'Un acte concret et gratuit.',diff:'easy',r:130,a:'social'},
  {i:"👥",n:"Organiser un événement avec au moins 5 personnes",d:"Toi à l'initiative, tout organisé.",diff:"hard",r:380,a:"social"},
  {i:"💬",n:"Avoir une vraie conversation profonde avec un inconnu",d:"Pas small talk — sujet réel, échange vrai.",diff:"medium",r:220,a:"social"},
  {i:"🎤",n:"Prendre la parole en public sans préparation",d:"Improvisation, devant au moins 3 personnes.",diff:"hard",r:350,a:"social"},
  {i:"📞",n:"Appeler quelqu'un que tu as blessé et t'excuser sincèrement",d:"Sincèrement, pas pour l'ego.",diff:"hard",r:400,a:"social"},
  {i:"🤝",n:"Rendre un service majeur sans rien attendre",d:"Acte concret, significatif.",diff:"medium",r:200,a:"social"},
  {i:"💌",n:"Écrire une lettre manuscrite à quelqu'un d'important",d:"À la main, envoyée ou remise.",diff:"easy",r:130,a:"social"},
  {i:"👁️",n:"Maintenir un contact visuel assertif toute une journée",d:"Avec chaque personne à qui tu parles.",diff:"medium",r:180,a:"social"},
  {i:'🧊',n:'Douche froide 5min',d:'5 min eau froide.',diff:'medium',r:150,a:'mental'},
  {i:'🤫',n:'Journee sans parole inutile',d:'Parler uniquement quand c est utile.',diff:'hard',r:280,a:'mental'},
  {i:'🧘',n:'20min meditation',d:'Pleine conscience.',diff:'medium',r:160,a:'mental'},
  {i:'🪑',n:'1h assis sans bouger',d:'En silence, sans distraction.',diff:'hard',r:250,a:'mental'},
  {i:'🗺️',n:'Aller dans endroit inconnu seul',d:'Rester 1h dans un lieu inconnu.',diff:'medium',r:200,a:'mental'},
  {i:'🚶',n:'Marcher 2h sans destination',d:'Partir sans but precis.',diff:'medium',r:170,a:'mental'},
  {i:'☕',n:'Cafe seul sans distraction',d:'Sans telephone ni musique.',diff:'medium',r:180,a:'mental'},
  {i:"🧊",n:"Bain froid 5 minutes",d:"Eau glacée, entrer et tenir.",diff:"hard",r:280,a:"mental"},
  {i:"😤",n:"Rester calme dans une situation frustrante intentionnelle",d:"Se provoquer une frustration et ne pas réagir.",diff:"medium",r:200,a:"mental"},
  {i:"📵",n:"48h sans smartphone du tout",d:"Téléphone éteint ou donné à quelqu'un.",diff:"hard",r:320,a:"mental"},
  {i:"🌑",n:"Nuit seul en nature sans distraction",d:"Forêt ou campagne, seul, pas de téléphone.",diff:"hard",r:400,a:"mental"},
  {i:"🤫",n:"24h de silence total volontaire",d:"Zéro parole, zéro message vocal.",diff:"hard",r:350,a:"mental"},
  {i:"🎯",n:"Finir ce que tu as commencé et abandonné",d:"Un projet ou défi laissé en cours.",diff:"medium",r:220,a:"mental"},
  {i:'🌅',n:'Lever avant 6h',d:'Sans telephone 1h apres.',diff:'medium',r:200,a:'discipline'},
  {i:'🚶',n:'Marche 5km sans telephone',d:'5km, telephone a la maison.',diff:'medium',r:180,a:'discipline'},
  {i:'🛏️',n:'Au lit avant 22h',d:'Couche avant 22h.',diff:'easy',r:130,a:'discipline'},
  {i:'📵',n:'Pas de telephone la journee',d:'Aucun telephone pendant tout le jour.',diff:'hard',r:300,a:'discipline'},
  {i:'🔇',n:'3h sans telephone',d:'3 heures productives.',diff:'medium',r:180,a:'discipline'},
  {i:'🌿',n:'Journee sans reseaux',d:'Instagram, TikTok - off 24h.',diff:'hard',r:280,a:'discipline'},
  {i:"🌅",n:"Lever avant 5h pendant 7 jours",d:"Sans exception, alarm ou pas.",diff:"hard",r:350,a:"discipline"},
  {i:"🛏️",n:"Couché avant 22h pendant 7 jours",d:"Au lit, lumières éteintes.",diff:"hard",r:300,a:"discipline"},
  {i:"📋",n:"Tenir un planning précis pendant 7 jours",d:"Chaque heure planifiée et respectée.",diff:"medium",r:180,a:"discipline"},
  {i:'✍️',n:'Lettre a ton futur toi',d:'Ecris a toi-meme dans 1 an.',diff:'easy',r:120,a:'intelligence'},
  {i:'📚',n:'Lire 30 pages',d:'En session continue.',diff:'easy',r:130,a:'intelligence'},
  {i:'📊',n:'Analyser 5 parties d echecs',d:'Parties perdues, analysees proprement.',diff:'medium',r:180,a:'intelligence'},
  {i:'✍️',n:'Fiche de revision complete',d:'Sur un sujet appris recemment.',diff:'easy',r:140,a:'intelligence'},
  {i:'📝',n:'Reviser 200 mots arabes',d:'Repetition espacee sur la journee.',diff:'medium',r:200,a:'intelligence'},
  {i:'📚',n:'Resumer un concept complexe',d:'Avec tes propres mots, par ecrit.',diff:'medium',r:170,a:'intelligence'},
  {i:'🎓',n:'Enseigner un sujet a voix haute',d:'Expliquer comme si tu enseignais quelqu un.',diff:'medium',r:180,a:'intelligence'},
  {i:'✍️',n:'Texte honnete sur toi-meme',d:'Ecrire honnement sur toi, tes forces et defauts.',diff:'medium',r:180,a:'intelligence'},
  {i:"♟️",n:"Gagner 5 parties d'échecs consécutives",d:"En ligne, même cadence.",diff:"hard",r:350,a:"intelligence"},
  {i:"📚",n:"Finir un livre",d:"De la première à la dernière page.",diff:"hard",r:280,a:"intelligence"},
  {i:"🗣️",n:"Tenir une conversation de 10 min en arabe",d:"Avec un locuteur natif ou en solo voix haute.",diff:"hard",r:400,a:"intelligence"},
  {i:"✍️",n:"Écrire un essai de 1000 mots sur un sujet complexe",d:"Argumenté, structuré, sans aide.",diff:"medium",r:220,a:"intelligence"},
  {i:"🧮",n:"Résoudre 200 puzzles tactiques d'échecs",d:"En une journée.",diff:"medium",r:200,a:"intelligence"},
  {i:"📝",n:"Créer un système de fiches Anki complet sur un sujet",d:"50 cartes minimum, organisées.",diff:"medium",r:180,a:"intelligence"},
  {i:"💻",n:"Créer un script utile qui t'aide au quotidien",d:"Python, JS — peu importe, mais il doit tourner.",diff:"hard",r:300,a:"intelligence"},
  {i:"🌍",n:"Apprendre toutes les capitales du monde",d:"Les 195 pays et leurs capitales.",diff:"medium",r:200,a:"intelligence"},
  {i:"🗺️",n:"Apprendre tous les drapeaux et la position des pays",d:"Reconnaître et placer chaque pays sur une carte.",diff:"hard",r:300,a:"intelligence"},
  {i:'🎯',n:'3 objectifs du mois',d:'Precis, mesurables, ecrits.',diff:'easy',r:120,a:'execution'},
  {i:'🧹',n:'Desencombrement',d:'Donner ou jeter 10 objets inutiles.',diff:'easy',r:100,a:'execution'},
  {i:'🎨',n:'Creer quelque chose',d:'Dessine, ecris, code ou compose.',diff:'medium',r:180,a:'execution'},
  {i:'🔧',n:'Reparer quelque chose',d:'Reparer ou ameliorer un objet chez toi.',diff:'medium',r:180,a:'execution'},
  {i:'🎯',n:'Definir ce que tu veux devenir',d:'Ecrire exactement la personne que tu veux etre.',diff:'easy',r:160,a:'execution'},
  {i:'🧠',n:'Identifier 3 defauts reels',d:'Tes 3 plus gros defauts actuels, par ecrit.',diff:'easy',r:140,a:'execution'},
  {i:'📋',n:'Planifier sa semaine entiere',d:'Le dimanche soir, ecrire objectifs et planning.',diff:'easy',r:120,a:'execution'},
  {i:'🗺️',n:'Explorer un endroit nouveau',d:'Un lieu jamais visite.',diff:'easy',r:120,a:'social'},
  {i:'📋',n:'Trier et organiser ses notes',d:'Organiser et purger tes notes digitales.',diff:'easy',r:80,a:'execution'},
  {i:"🎯",n:"Finir un projet commencé depuis trop longtemps",d:"Pas une tâche — un vrai projet inachevé.",diff:"hard",r:400,a:"execution"},
  {i:"🧹",n:"Nettoyer et organiser toute ta chambre/appart en une session",d:"De A à Z, sans s'arrêter.",diff:"medium",r:180,a:"execution"},
  {i:"📊",n:"Créer un tableau de bord de suivi de tes objectifs",d:"Papier ou digital, utilisable vraiment.",diff:"easy",r:140,a:"execution"},
  {i:"💡",n:"Avoir une idée et l'exécuter dans la journée",d:"Pas demain — aujourd'hui.",diff:"medium",r:200,a:"execution"},
  {i:"📬",n:"Vider complètement sa boîte mail",d:"Inbox zéro.",diff:"easy",r:100,a:"execution"},
  {i:"🗑️",n:"Désinstaller les apps inutiles + organiser son téléphone",d:"Ne garder que ce qui sert.",diff:"easy",r:120,a:"execution"},
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
  {e:'🎧',n:'Acheter un album / musique',c:300,cond:'Rang >= D',mr:1},
  {e:'📚',n:'Acheter un livre',c:200,cond:'Rang >= E',mr:0},
  {e:'🎯',n:'Journee totalement libre',c:500,cond:'Semaine parfaite',mr:0},
  {e:'🏖️',n:'Week-end relax',c:1000,cond:'Rang >= B',mr:3},
  {e:'🎲',n:'Soiree jeux avec amis',c:300,cond:'Rang >= D',mr:1},
  {e:'🍦',n:'Dessert / glace',c:150,cond:'Journee >= 8/10',mr:0},
  {e:'💆',n:'Massage / spa',c:700,cond:'Rang >= C',mr:2},
  {e:'🎁',n:'Se faire un cadeau',c:1200,cond:'Rang >= B',mr:3},
  {e:'🍷',n:'Repas gastronomique',c:900,cond:'Rang >= A',mr:4},
  {e:'🏋️',n:'Abonnement salle / equipement',c:600,cond:'Rang >= C',mr:2},
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
  {e:'🍦',n:'Dessert non merite',c:200},
  {e:'🎧',n:'Musique pour procrastiner',c:150},
  {e:'📺',n:'YouTube en boucle',c:300},
  {e:'🛍️',n:'Shopping impulsif',c:800},
  {e:'🍷',n:'Sortie non meritee',c:600},
  {e:'😪',n:'Rater son reveil',c:200},
  {e:'🚗',n:'Trajet faisable a pied pris en transport',c:150},
  {e:'🍫',n:'Grignotage sucre non merite',c:180},
  {e:'🎯',n:'Journee sans rien faire',c:400},
  {e:'📵',n:'Rater ses prieres',c:250},
  {e:'🧠',n:'Journee sans apprendre',c:200},
  {e:'⏰',n:'Arriver en retard par manque de discipline',c:150},
];

const SKILLS_DATA_DEFAULT = [
  {cat:'Calisthenics',icon:'💪',items:['Faire 1 muscle-up strict','Faire 5 muscle-ups consecutifs','Tenir un front lever 5 secondes','Tenir un back lever 5 secondes','Faire un human flag 3 secondes','Tenir handstand 10s contre mur','Tenir un handstand libre 5 secondes','Faire un handstand push-up','Faire 20 tractions strictes','Faire 10 tractions a une main assistee','Faire 50 pompes consecutives','Faire des pompes diamant x30','Faire des archer push-ups x10 par cote','Tenir un L-sit 10 secondes au sol','Tenir un L-sit 5 secondes aux barres','Faire 20 dips aux barres paralleles','Faire un planche lean 3 secondes','Faire 10 pike push-ups','Realiser un backflip depuis le sol','Realiser un frontflip depuis le sol']},
  {cat:'Endurance & Course',icon:'🏃',items:['Courir 5km sans arreter','Courir 10km en moins d 1h','Courir un semi-marathon 21km','Finir un marathon 42km','Courir 5km en moins de 22 min','Faire 100 burpees en moins de 10 min','Nager 1km en continu','Nager 2km en continu','Faire 1000 sauts a la corde en continu','Marcher 30km en une journee','Marcher 50km en une journee','Faire du velo 50km en une sortie','Atteindre 10 000 pas par jour 30j','Faire 200 squats en une session','Faire une seance HIIT 20 min sans pause']},
  {cat:'Force & Musculation',icon:'🏋️',items:['Squatter 1x son propre poids de corps','Developpe couche 1x son poids de corps','Souleve de terre 1.5x son poids','10 repetitions squat avec 80kg','10 repetitions developpe couche 70kg','Overhead press avec 60kg','Bulgarian split squats x15 par jambe','Hip thrust avec charge maitrise','Face pulls correctement executes','Romanian deadlift technique propre','Faire 100 pompes en une journee','Faire 100 squats en une session','Faire 100 tractions en une journee','Faire 200 abdos en une session','Realiser programme 100 pompes en 6 semaines']},
  {cat:'Mobilite & Souplesse',icon:'🤸',items:['Toucher ses orteils jambes tendues','Faire le grand ecart complet','Faire le pont wheel pose complet','Tenir posture du pigeon 2 min par cote','Rotation complete des epaules','Maitriser le squat profond ass to grass','Tenir la posture du lotus complet','Rotations de hanches completes','Maitriser les etirements du psoas','Tenir la posture du scorpion']},
  {cat:'Arts Martiaux & Grappling',icon:'🥊',items:['Apprendre la chute arriere ukemi','Apprendre la chute avant','Maitriser la prise de garde boxe','Realiser un takedown double jambe','Maitriser le rear naked choke','Passer la garde en grappling','Faire un armbar depuis la garde','Maitriser le triangle choke','Faire un hip throw o-goshi propre','Tenir 3 min de sparring debout','Tenir 5 min de roulage BJJ','Maitriser le croc-en-jambe','Defense contre une cle de bras','Sortir d un etranglement arriere','Connaitre 5 positions de controle au sol']},
  {cat:'Natation',icon:'🏊',items:['Nager le crawl sur 25m technique propre','Nager le dos crawle sur 50m','Nager la brasse sur 100m sans pause','Nager le papillon sur 25m','Apprendre le virage culbute flip turn','Nager en apnee 25m sous l eau','Sauver quelqu un qui se noie','Plonger depuis 5m de hauteur','Nager en eau libre 500m','Tenir l eau 10 min sans bouger les bras']},
  {cat:'Echecs',icon:'♟️',items:['Atteindre 1200 Elo en ligne','Atteindre 1500 Elo en ligne','Atteindre 1800 Elo en ligne','Atteindre 2000 Elo en ligne','Maitriser l ouverture italienne','Maitriser la defense sicilienne','Maitriser l attaque espagnole','Connaitre 10 fins de partie theoriques','Analyser 50 parties perdues','Resoudre 500 puzzles tactiques','Maitriser le mat du couloir','Maitriser le mat des 2 tours','Apprendre la methode Silman pour finales','Jouer en blitz 3min avec confiance','Jouer en bullet 1min regulierement']},
  {cat:'Coran & Islam',icon:'🕌',items:['Memoriser Al-Fatiha parfaitement','Memoriser Juz Amma complet 30e','Memoriser les 10 dernieres sourates','Memoriser Ayat Al-Kursi','Memoriser Al-Baqarah 10 premiers versets','Lire le Coran entier une fois','Apprendre le Tajwid basique','Apprendre les regles de la madd','Apprendre les regles du ghunna','Comprendre 300 mots arabes coraniques','Apprendre 20 douas essentielles','Connaitre les 5 piliers en detail','Connaitre les 6 piliers de la foi','Connaitre les regles de la priere','Apprendre les ablutions woudou','Connaitre les regles de purification','Apprendre les regles du jeune Ramadan','Connaitre 50 hadiths Nawawi','Connaitre la Sira du Prophete en resume','Apprendre les 99 noms d Allah et leur sens']},
  {cat:'Langue Arabe',icon:'🗣️',items:['Apprendre l alphabet arabe complet','Lire des mots arabes sans voyelles','Ecrire l alphabet arabe en cursive','Apprendre 500 mots de vocabulaire courant','Apprendre 1000 mots de vocabulaire','Comprendre une conversation simple','Tenir une conversation de 5 min en arabe','Connaitre les regles de base de la grammaire','Maitriser les conjugaisons au passe madi','Maitriser les conjugaisons au present mudari','Apprendre les pronoms personnels arabes','Comprendre un extrait de journal arabe','Regarder une video en arabe et comprendre 70%','Ecrire un paragraphe en arabe de sa tete','Connaitre les racines triliteres communes']},
  {cat:'Code & Tech',icon:'💻',items:['Creer une page web HTML CSS complete','Rendre un site responsive mobile','Creer une animation CSS','Ecrire un script JavaScript fonctionnel','Creer un formulaire avec validation JS','Utiliser l API fetch pour afficher des donnees','Deployer un site sur GitHub Pages','Creer un repo GitHub et faire des commits','Utiliser VS Code avec extensions utiles','Ecrire un script Python de base','Automatiser une tache repetitive avec Python','Creer un bot simple Discord ou Telegram','Comprendre ce qu est une API REST','Creer et lire un fichier JSON en Python','Manipuler des donnees avec pandas','Faire un graphique avec matplotlib','Comprendre les bases de SQL','Faire une requete SELECT JOIN WHERE','Creer une base de donnees SQLite','Utiliser l IA pour coder efficacement']},
  {cat:'Mecanique & Bricolage',icon:'⚙️',items:['Changer une roue de voiture seul','Verifier et faire l appoint d huile moteur','Changer les plaquettes de frein','Lire un plan de montage complexe','Visser un chevron dans un mur porteur','Installer une prise electrique','Remplacer un robinet qui fuit','Lire un multimetre electrique','Souder deux fils electriques proprement','Demonter et remonter un velo complet','Changer une chambre a air de velo','Comprendre un schema electrique simple','Monter un meuble complexe IKEA avance','Percer et fixer une etagere au mur','Peindre une piece proprement']},
  {cat:'Cuisine & Nutrition',icon:'🍳',items:['Cuisiner un poulet roti entier','Preparer une sauce bechamel maison','Faire du pain maison sans machine','Preparer des sushis maison','Cuisiner un tajine complet','Preparer des maklouba riz arabe renverse','Faire du hummus maison','Calculer ses macros journalieres','Preparer ses repas pour la semaine meal prep','Cuisiner sans huile saturee pendant 30j','Lire et comprendre une etiquette nutritionnelle','Calculer ses besoins caloriques de maintenance','Faire un plan alimentaire pour prise de masse','Faire un plan alimentaire pour seche','Maitriser la cuisson des oeufs toutes formes']},
  {cat:'Finance & Business',icon:'💰',items:['Creer un budget mensuel personnel','Epargner 10% de ses revenus pendant 3 mois','Ouvrir un livret d epargne','Comprendre ce qu est un ETF','Investir pour la premiere fois meme 50 euros','Comprendre la difference actions obligations','Lire un bilan comptable simple','Creer une micro-entreprise en ligne','Vendre quelque chose en ligne','Negocier un prix ou un salaire','Creer une offre de service claire','Comprendre les charges sociales en France','Comprendre ce qu est la TVA','Faire une declaration de revenus seul','Comprendre l interet compose et le calculer']},
  {cat:'Survie & Autonomie',icon:'🧭',items:['Allumer un feu sans briquet silex ou friction','S orienter avec une boussole','Lire une carte topographique','Filtrer de l eau en nature','Construire un abri d urgence en foret','Faire un noeud de chaise bowline','Faire un noeud de cabestan','Reconnaitre 10 plantes comestibles locales','Reconnaitre 5 plantes toxiques locales','Faire un garrot d urgence','Pratiquer le RCP reanimation cardio-pulmonaire','Poser un bandage propre sur une plaie','Identifier les symptomes d hypothermie','Survivre une nuit en plein air sans tente','Trouver le nord sans boussole']},
  {cat:'Memoire & Apprentissage',icon:'🧠',items:['Memoriser 50 mots etrangers en une semaine','Utiliser la methode des palais de memoire','Memoriser un jeu de 52 cartes dans l ordre','Appliquer la repetition espacee Anki 30j','Memoriser les 44 presidents americains en ordre','Memoriser 50 capitales du monde','Memoriser les tables de multiplication jusqu a 20','Apprendre a lire 2x plus vite','Resumer un livre de 200 pages en 1 page','Retenir le contenu d une conference sans notes']},
  {cat:'Creation & Expression',icon:'🎨',items:['Dessiner un portrait ressemblant','Dessiner en perspective 1 point de fuite','Apprendre les bases du shading','Ecrire une nouvelle courte 1000 mots','Ecrire un poeme de 3 strophes','Monter une video de 2 min avec musique','Prendre une photo avec la regle des tiers','Maitriser la balance des blancs en photo','Creer un logo simple avec Canva','Composer une beat simple sur GarageBand ou FL']},
  {cat:'Psychologie & Discipline',icon:'🧘',items:['Mediter 10 min pendant 30j consecutifs','Tenir un journal pendant 60 jours','Completer un challenge 75 Hard','Pratiquer la visualisation positive 30j','Identifier ses 5 biais cognitifs principaux','Pratiquer le stoicisme 30j journaling','Resister a une habitude negative 30j','Apprendre la respiration Wim Hof','Faire une retraite de silence volontaire 1j','Maitriser la technique de box breathing']},
  {cat:'Culture Generale',icon:'🌍',items:['Connaitre les 195 pays et leur continent','Connaitre les 10 plus grandes economies mondiales','Comprendre ce qu est l OTAN et ses membres','Comprendre le fonctionnement de l ONU','Connaitre les grandes phases de l Histoire de France','Comprendre les bases de l economie de marche','Connaitre les grandes religions mondiales','Comprendre le fonctionnement d une election presidentielle','Lire 10 livres de non-fiction dans l annee','Regarder 5 documentaires sur sujets inconnus']},
  {cat:'Premiers Secours & RCP',icon:'🆘',items:['Pratiquer le RCP (réanimation cardio-pulmonaire) sur mannequin','Maîtriser la manœuvre de Heimlich sur adulte','Maîtriser la manœuvre de Heimlich sur enfant','Placer quelquun en position latérale de sécurité (PLS)','Faire un garrot d urgence correctement','Poser un bandage compressif sur une plaie','Reconnaître les signes d un AVC (FAST)','Reconnaître les signes d un infarctus','Réagir face à une personne inconsciente qui respire','Réagir face à une personne inconsciente qui ne respire pas','Utiliser un défibrillateur (DAE) correctement','Gérer une brûlure grave','Gérer une fracture en attendant les secours','Appeler les secours efficacement (18, 15, 112)','Passer le PSC1 (certificat de premiers secours)']},
  {cat:'Boxe & Frappe',icon:'🥊',items:['Adopter une garde correcte et stable','Jab-cross-hook enchaîné fluide','Esquive slip des deux côtés','Uppercut avec rotation du bassin','Défense en couverture shell','Travailler au sac 3×3min','Shadow boxing 5min fluide','Travail de pieds en carré','Esquiver une frappe réelle en sparring','Comprendre les distances de frappe','Lire les intentions de l adversaire','Combinaison à 6 frappes mémorisée','Parry et contre-attaque','Tenir 5 rounds de shadow boxing','Sparring technique 5 rounds complets']},
  {cat:'Conduite & Mécanique',icon:'🔧',items:['Vérifier la pression des pneus seul','Changer une roue en moins de 15min','Lire les voyants du tableau de bord','Changer les essuie-glaces','Faire le plein d huile et vérifier le niveau','Comprendre un devis mécanique','Changer les plaquettes de frein','Lire un compte-rendu de contrôle technique','Utiliser une jauge de pression','Nettoyer et entretenir un filtre à air','Régler les phares','Comprendre les différents types de pneus','Diagnostiquer un bruit suspect','Faire l entretien de base soi-même','Négocier un achat de voiture d occasion']},
  

