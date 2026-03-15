function handleInteraction(entity) {
    const type = entity.type.toLowerCase();
    const { cellSize } = RENDER_MAP.createPerfectSquareBalancedGrid();
    const el = document.getElementById(entity.id);
    const entityIdx = LEVELS.dynamicEntities.findIndex(e => e.id === entity.id);
    let nextName = '';

    switch (type) {
        case 'chest':
          console.log("Ви відкрили скриню!");
          const lootRoll = Math.floor(Math.random() * 10) + 1;
          nextName = lootRoll <= 6 ? 'book' : 'book_coin';
          renewal(el, entityIdx, nextName, cellSize, entity.x, entity.y);
          break;

        case 'npc':
            console.log("NPC вітає вас.");
            // Логіка: запуск діалогу
            break;

        case 'book':
            console.log("Ви читаєте стародавню книгу.");
            // Логіка: показати текст на екрані
            cleaning(entity);
            break;
        case 'coin':
            cleaning(entity);
            break;
        case 'book_coin':
            cleaning(entity);
            break;
        case 'boss_room_closed':
            LEVELS.map[entity.y][entity.x] = 0;
            const mapElement = document.getElementById('Map');
            const width = LEVELS.map[0].length;
            const cellIdx = entity.y * width + entity.x;
            const cell = mapElement.children[cellIdx];
            nextName = 'path_portal';
            applySpriteStyles(cell, nextName, cellSize);

            nextName = 'boss_room_open';
            renewal(el, entityIdx, nextName, cellSize, entity.x, entity.y);
            const element = document.getElementById('boss_room_open');
            element.style.animationDuration = `${(2+PLAYER.speed) * 100 / 1000}s`;
            isFight = true;
            break;
        case 'exit':
            console.log("Перехід на наступний рівень...");
            const currentExit = LEVELS.entities.find(ent => ent.id === "exitPoint");
            // Запам'ятовуємо, де ми вийшли
            const nextStartCoords = { x: currentExit.x, y: currentExit.y };
            LEVELS.sub_level++;
            initLevel(nextStartCoords); // Передаємо ці координати в новий рівень
            break;

        default:
            console.log(`Взаємодія з ${type} не прописана.`);
    }
}
//Оновлення сутностей
function renewal(el, entityIdx, nextName, cellSize, x, y) {
    if (entityIdx !== -1) {
      LEVELS.dynamicEntities[entityIdx].type = nextName;
      LEVELS.dynamicEntities[entityIdx].id = nextName;
      el.id = nextName;
      el.className = `entity ${nextName}`;
      applySpriteStyles(el, nextName, cellSize, x, y);
      console.log(`Ого! З'явилася ${nextName}.`);
    }
}
//Очищення сутностей
function cleaning(entity) {
    // 1. Видаляємо з логічного масиву
    LEVELS.dynamicEntities = LEVELS.dynamicEntities.filter(e => e.id !== entity.id);

    // 2. Видаляємо візуально
    const el = document.getElementById(entity.id);
    if (el) {
      el.remove();
      //renderEntities()
    }

}
