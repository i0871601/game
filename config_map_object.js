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
        exit: { id: 'exit', col: 3 },
        path_portal: { id: 'path_portal', col: 4 },
        boss_room_closed: { id: 'boss_room_closed', col: 5},
        boss_room_open: { id: 'boss_room_open', col: 6, step: 1 },
        coin: { id: 'coin', col: 8, step: 4 },
        book: { id: 'book', col: 12 }, // 5-idle, 6-active
        book_coin: { id: 'book_coin', col: 13 },
        chest: { id: 'chest', col: 14 },
        level_cell: { id: 'level_cell', col: 15 },
        npc: { id: 'npc', col: 16 }
    },
    LENGTH_STYLES: 16,

    // Логіка колізій (Solid = твердий)
    PRIORITY_STEP: {
        0: { solid: false }, // Прохід
        1: { solid: true }, // Стіна
        'start': {solid: false },
        'exit': { solid: false },
        'path_portal': { solid: false },
        'boss_room_closed': { solid: false },
        'boss_room_open': {solid: false },
        'coin': { solid: false },
        'book': { solid: false },
        'book_coin': { solid: false },
        'chest': { solid: true },
        'level_cell': { solid: false },
        'npc': { solid: true }
    },

    // Логіка взаємодії
    INTERACTIVES: {
        'exit': { speed: 1 },
        'boss_room_closed': { speed: 0 },
        'coin': { speed: 1 },
        'npc': { speed: 1 },
        'book': { speed: 1 },
        'book_coin': { speed: 1 },
        'chest': { speed: 1 }
    }
};
