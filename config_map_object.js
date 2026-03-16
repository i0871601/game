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
        secret_room: { id: 'secret_room', col: 4, shadow: 5},
        secret_room_open: { id: 'secret_room_open', col: 6, step: 1},
        coin: { id: 'coin', col: 8, step: 4 },
        book: { id: 'book', col: 12 },
        book_coin: { id: 'book_coin', col: 13 },
        chest: { id: 'chest', col: 16 },
        mimic: { id: 'mimic', col: 16 },
        activ_mimic: { id: 'activ_mimic', col: 17, step: 2 },
        attack_mimic: { id: 'attack_mimic', col: 15, step: 1, shadow: 14 },
        level_cell: { id: 'level_cell', col: 19 },
        npc: { id: 'npc', col: 20 }
    },
    LENGTH_STYLES: 20,

    // Логіка колізій (Solid = твердий)
    PRIORITY_STEP: {
        0: { solid: false }, // Прохід
        1: { solid: true }, // Стіна
        'start': {solid: false },
        'exit': { solid: false },
        'path_portal': { solid: false },
        'secret_room': { solid: false },
        'coin': { solid: false },
        'book': { solid: false },
        'book_coin': { solid: false },
        'chest': { solid: true },
        'mimic': { solid: true },
        'level_cell': { solid: false },
        'npc': { solid: true }
    },

    // Логіка взаємодії
    INTERACTIVES: {
        'exit': { speed: 1 },
        'secret_room': { speed: 0 },
        'coin': { speed: 1 },
        'npc': { speed: 1 },
        'book': { speed: 1 },
        'book_coin': { speed: 1 },
        'chest': { speed: 1 },
        'mimic': { speed: 0 }
    }
};
