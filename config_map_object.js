const OBJECT_MAP = {
    SET_LEVEL: {
      1: "tileset.png",
      2: ""//майбутьному
    },
    TILE_SIZE: 16,
    // Стилі для рендеру
    STYLES: {
        wall: { id: 'wall', col: 1 },
        path: { id: 'path', col: 2 },
        start: { id: 'start', col: 3 },
        exit: { id: 'exit', col: 4 },
        boss_room: { id: 'boss_room', col: 5},
        coin: { id: 'coin', col: 6},
        book: { id: 'book', col: 7}, // 5-idle, 6-active
        book_coin: { id: 'book_coin', col: 8},
        chest: { id: 'chest', col: 9 },
        level_cell: { id: 'level_cell', col: 10 },
        npc: { id: 'npc', col: 11 }
    },
    LENGTH_STYLES: 11,

    // Логіка колізій (Solid = твердий)
    PRIORITY_STEP: {
        0: { solid: false }, // Прохід
        1: { solid: true }, // Стіна
        'start': {solid: false },
        'exit': { solid: false },
        'boss_room': { solid: true },
        'coin': { solid: false },
        'book': { solid: false },
        'book_coin': { solid: false },
        'chest': { solid: true },
        'npc': { solid: true }
    },

    // Логіка взаємодії
    INTERACTIVES: {
        'exit': { priority: 1 },
        'boos_room': {priority: 2 },
        'coin': { priority: 3 },
        'npc': { priority: 4 },
        'book': { priority: 5 },
        'book_coin': {priority: 6},
        'chest': { priority: 7 }
    },
};
