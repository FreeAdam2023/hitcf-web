/**
 * Daily motivational quotes — famous attributable quotes in French.
 * Rotated by day-of-year in the MotivationStrip component.
 *
 * Selection criteria: literary weight, famous authorship, 打鸡血 energy.
 */
export const MOTIVATION_QUOTES: readonly { fr: string; author: string }[] = [
  // ── Napoléon Bonaparte ──
  { fr: "Impossible n'est pas français.", author: "Napoléon" },
  { fr: "La victoire appartient au plus persévérant.", author: "Napoléon" },

  // ── Albert Camus ──
  { fr: "Au milieu de l'hiver, j'ai découvert en moi un invincible été.", author: "Camus" },
  { fr: "De l'audace, encore de l'audace, toujours de l'audace !", author: "Danton" },

  // ── Victor Hugo ──
  { fr: "Même la nuit la plus sombre prendra fin et le soleil se lèvera.", author: "Hugo" },
  { fr: "L'avenir est une porte, le passé en est la clé.", author: "Hugo" },
  { fr: "Persévérez, c'est le secret de tous les triomphes.", author: "Hugo" },

  // ── Antoine de Saint-Exupéry ──
  { fr: "Fais de ta vie un rêve, et d'un rêve, une réalité.", author: "Saint-Exupéry" },

  // ── Friedrich Nietzsche ──
  { fr: "Ce qui ne me tue pas me rend plus fort.", author: "Nietzsche" },
  { fr: "Celui qui a un pourquoi peut supporter presque n'importe quel comment.", author: "Nietzsche" },

  // ── Winston Churchill ──
  { fr: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: "Churchill" },
  { fr: "Le succès, c'est d'aller d'échec en échec sans perdre son enthousiasme.", author: "Churchill" },

  // ── Nelson Mandela ──
  { fr: "Je ne perds jamais. Soit je gagne, soit j'apprends.", author: "Mandela" },
  { fr: "Cela semble toujours impossible jusqu'à ce que ce soit fait.", author: "Mandela" },

  // ── Confucius / Philosophie orientale ──
  { fr: "Un voyage de mille lieues commence toujours par un premier pas.", author: "Lao Tseu" },
  { fr: "Celui qui déplace la montagne commence par déplacer de petites pierres.", author: "Confucius" },
  { fr: "Tomber sept fois, se relever huit.", author: "Proverbe japonais" },

  // ── Voltaire ──
  { fr: "La chance ne sourit qu'aux esprits bien préparés.", author: "Pasteur" },

  // ── Honoré de Balzac ──
  { fr: "La persévérance est la noblesse de l'obstination.", author: "Balzac" },
  { fr: "Il n'existe pas de grande tâche difficile qui ne puisse être décomposée en petites tâches faciles.", author: "Balzac" },

  // ── Sénèque ──
  { fr: "Ce n'est pas parce que les choses sont difficiles que nous n'osons pas, c'est parce que nous n'osons pas qu'elles sont difficiles.", author: "Sénèque" },
  { fr: "La chance, c'est ce qui arrive quand la préparation rencontre l'opportunité.", author: "Sénèque" },

  // ── Steve Jobs ──
  { fr: "Seuls ceux qui sont assez fous pour penser qu'ils peuvent changer le monde y parviennent.", author: "Steve Jobs" },
  { fr: "Votre temps est limité, ne le gaspillez pas en vivant la vie d'un autre.", author: "Steve Jobs" },

  // ── Marie Curie ──
  { fr: "Dans la vie, rien n'est à craindre, tout est à comprendre.", author: "Marie Curie" },

  // ── Émile Zola ──
  { fr: "Si vous me demandez ce que je suis venu faire en ce monde, je vous répondrai : je suis venu vivre à haute voix.", author: "Zola" },

  // ── Jean-Paul Sartre ──
  { fr: "Il n'y a qu'un héroïsme au monde : voir le monde tel qu'il est et l'aimer.", author: "Romain Rolland" },

  // ── Alexandre Dumas ──
  { fr: "Toute la sagesse humaine est dans ces deux mots : attendre et espérer.", author: "Dumas" },

  // ── Proverbes français classiques ──
  { fr: "Vouloir, c'est pouvoir.", author: "Proverbe français" },
  { fr: "À cœur vaillant rien d'impossible.", author: "Proverbe français" },
  { fr: "Paris ne s'est pas fait en un jour.", author: "Proverbe français" },
  { fr: "Petit à petit, l'oiseau fait son nid.", author: "Proverbe français" },
  { fr: "La gloire se donne seulement à ceux qui l'ont toujours rêvée.", author: "de Gaulle" },

  // ── Autres grands penseurs ──
  { fr: "Le génie est un pour cent d'inspiration et quatre-vingt-dix-neuf pour cent de transpiration.", author: "Edison" },
  { fr: "L'éducation est l'arme la plus puissante pour changer le monde.", author: "Mandela" },
  { fr: "L'avenir appartient à ceux qui croient en la beauté de leurs rêves.", author: "Eleanor Roosevelt" },
  { fr: "La folie, c'est de faire toujours la même chose et de s'attendre à un résultat différent.", author: "Einstein" },
  { fr: "La discipline est le pont entre les objectifs et les résultats.", author: "Jim Rohn" },
  // ── 东方经典 (法语译) ──
  { fr: "La route est longue, mais qui marche y arrivera.", author: "Xunzi" },
  { fr: "Même face à des millions d'adversaires, j'avancerai.", author: "Mencius" },
  { fr: "Ce que l'on porte dans le cœur finit toujours par trouver écho.", author: "Li Shutong" },
  { fr: "Tant qu'il reste un souffle, on allume une flamme.", author: "Wong Kar-wai" },

  // ── Marcus Aurelius / Stoïcisme ──
  { fr: "Tu as le pouvoir sur ton esprit, pas sur les événements. Réalise cela, et tu trouveras la force.", author: "Marc Aurèle" },
  { fr: "L'obstacle sur le chemin devient le chemin.", author: "Marc Aurèle" },
] as const;
