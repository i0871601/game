let LEVELS = {
    levels: 1,
    sub_level: 1,
    map: [],
    entities: [
        { id: "player", type: "player", x: -1, y: -1 },
        { id: "startPoint", type: "start", x: -1, y: -1 },
        { id: "exitPoint", type: "exit", x: -1, y: -1 },
    ],
    // Тут просто тримаємо масив, який буде перезаписуватись
    dynamicEntities: []
};
//інтерактивні обєкти на карті
function generateDynamicLoot() {
    let entities = [];

    //якщо sub_level === 1 isDragon = false
    // Додаємо обов'язковий датчик рівня (cellLevels), про який ви згадували
    entities.push({ id: "cellLevels", type: "level_cell", distance: 4, x: -1, y: -1 });
    if (LEVELS.sub_level % 5 === 0) {//або під левел ділиться на 5 або якщо isDragon = true
        //створює не секрет рум, а next_level_up
      entities.push({ id: "secret_room", type: "secret_room", secret: "true", x: -1, y: -1});
    }
    //перевяряє isDragon = true то стає false
    //окремий рандом для визначення чи буде дракон перекривати шлях, ставить зміну isDragon = true
    // 1. Логіка NPC: Кожен 4-й рівень
    if (LEVELS.sub_level % 4 === 0) {
        entities.push({ id: "npc_special", type: "npc", x: -1, y: -1 });
    }
    // 2. Рандом предметів
    const countRoll = Math.floor(Math.random() * 10) + 1;
    let itemsToCreate = [];

    if (countRoll >= 4 && countRoll <= 6 ) {
      // ОДИН ОБ'ЄКТ
      const typeRoll = Math.floor(Math.random() * 10) + 1;
      if (typeRoll <= 6) itemsToCreate.push("coin");
      else itemsToCreate.push("book");

    } else if (countRoll >= 7 && countRoll <= 9) {
      // ДВА ОБ'ЄКТИ
      //якщо два обєкта то 10 % що буде створено блок дебав
      let firstItem = "";
      const firstRoll = Math.floor(Math.random() * 10) + 1;
      // Визначаємо перший
      if (firstRoll <= 7) firstItem = "coin";
      else firstItem = "book";
      itemsToCreate.push(firstItem);
      // Визначаємо другий залежно від першого
      const secondRoll = Math.floor(Math.random() * 10) + 1;
      if (firstItem === "coin") {
          if (secondRoll <= 5) itemsToCreate.push("coin");
          else {itemsToCreate.push("book");}; //добавити блок прокляття};
      } else {
          itemsToCreate.push("coin");
      }
    } else if (countRoll === 10) {
        const chestRoll = Math.floor(Math.random()*10)+1;
        nextId = chestRoll <= 5 ? 'chest' : 'mimic';
        itemsToCreate.push(nextId);
    }

    itemsToCreate.forEach((type, index) => {
        entities.push({
            id: `${type}_${index}`,
            type: type,
            x: -1,
            y: -1
        });
    });

    return entities;
}

// --- Модуль рендерингу (для розмірів та стилів) ---
const RENDER_MAP = {
    createPerfectSquareBalancedGrid() {
        // Беремо розміри вікна або контейнера
        const container = document.getElementById('Map');
        const width = container.offsetWidth || window.innerWidth;
        const height = container.offsetHeight || window.innerHeight;
        const ratio = width / height;

        // Збільшив діапазон для кращого вигляду
        const minCells = 9;
        const maxCells = 9;

        let bestX = 1, bestY = 1;
        let minDifference = Infinity;

        // Знаходимо найкращу пропорцію
        for (let y = minCells; y <= maxCells; y++) {
            for (let x = minCells; x <= maxCells; x++) {
                let currentRatio = x / y;
                let difference = Math.abs(currentRatio - ratio);

                if (difference < minDifference) {
                    minDifference = difference;
                    bestX = x;
                    bestY = y;
                }
            }
        }

        // Гарантуємо непарність для алгоритму
        if (bestX % 2 === 0) bestX++;
        if (bestY % 2 === 0) bestY++;

        // Розраховуємо ідеальний розмір клітинки
        const cellWidth = width / bestX;
        const cellHeight = height / bestY;
        let cellSize = Math.floor(Math.min(cellWidth, cellHeight));

        // Якщо cellSize непарне, робимо його парним
        if (cellSize % 2 !== 0) {
            cellSize--;
        }

        return {
            cellSize: cellSize,
            bestX: bestX,
            bestY: bestY
        };
    }
};
