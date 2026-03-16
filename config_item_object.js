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

        case 'mimic':
            nextName = 'activ_mimic';
            renewal(el, entityIdx, nextName, cellSize, entity.x, entity.y);

            setTimeout(() => {

              nextName = 'attack_mimic';
              renewal(el, entityIdx, nextName, cellSize, entity.x, entity.y);

              const shadowEl = createShadow({ ...entity, type: 'attack_mimic' }, cellSize);

              const mimicEl = document.getElementById('attack_mimic');
              const playerEl = document.getElementById('player');
              const playerPos = LEVELS.entities.find(e => e.id === "player");

              setTimeout(() => {
                if (mimicEl && playerEl) {
                  mimicEl.style.animationDuration = `${(PLAYER.speed) * 100 / 1000}s`;
                  const diffX = playerPos.x * cellSize;
                  const diffY = playerPos.y * cellSize;
                  [mimicEl, shadowEl].forEach(item => {
                    item.style.left = `${diffX}px`;
                    item.style.top = `${diffY}px`;
                  });

                  mimicEl.classList.add('visible');
                  if (playerEl) {
                    setTimeout(() => {
                      playerEl.style.opacity = '0';
                      shadowEl.style.opacity = '0';
                    },(PLAYER.speed) * 100);
                  }
                }
              }, 100);
            }, 3000);
            isFight = true;
            clearMovementUI();
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

        case 'secret_room':
            createShadow(entity, cellSize);
            nextName = 'secret_room_open';
            renewal(el, entityIdx, nextName, cellSize, entity.x, entity.y);

            const updatedEntity = { ...entity, type: nextName, id: nextName };
            handleInteraction(updatedEntity);
            isFight = true;
            break;
        case 'secret_room_open':
            el.style.animationDuration = `${(4 + PLAYER.speed) * 100 / 1000}s`;
            el.classList.add('visible');
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
//створення тіні сутностей
function createShadow(entity, cellSize) {
  const styleConf = OBJECT_MAP.STYLES[entity.type.toLowerCase()];
  const shadowEl = document.createElement('div');
  shadowEl.className = 'entity shadow-layer';
  applySpriteStyles(shadowEl, entity.type, cellSize, entity.x, entity.y);
  const shadowX = -(styleConf.shadow - 1) * cellSize;
  shadowEl.style.backgroundPosition = `${shadowX}px 0px`;
  document.getElementById('entities').appendChild(shadowEl);
  return shadowEl;
}
