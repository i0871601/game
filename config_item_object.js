function handleInteraction(entity) {
    const type = entity.type.toLowerCase();

    switch (type) {
        case 'chest':
          console.log("Ви відкрили скриню!");
          // 1. Шанс 1-5 (наприклад, з 10), що всередині книга
          const lootRoll = Math.floor(Math.random() * 10) + 1;
          if (lootRoll <= 6) {
            // 2. Перетворюємо скриню на книгу
            // Знаходимо саме цю скриню в масиві dynamicEntities
            const chestIdx = LEVELS.dynamicEntities.findIndex(e => e.id === entity.id);
            // Змінюємо тип та ID, щоб спрацювали стилі книги
            LEVELS.dynamicEntities[chestIdx].type = 'book';
            LEVELS.dynamicEntities[chestIdx].id = 'book';
            console.log("Ого! У скрині була книга.");

          }
          if (lootRoll >= 7){
            const chestIdx = LEVELS.dynamicEntities.findIndex(e => e.id === entity.id);
            if (chestIdx !== -1) {
              // Змінюємо тип та ID, щоб спрацювали стилі книги
              LEVELS.dynamicEntities[chestIdx].type = 'book_coin';
              LEVELS.dynamicEntities[chestIdx].id = 'book_coin';
              console.log("Ого! У скрині була книга та монети.");
            }
          }
          // 3. Перемальовуємо сутності, щоб побачити зміни
          renderEntities();
          break;

        case 'npc':
            console.log("NPC вітає вас.");
            // Логіка: запуск діалогу
            break;

        case 'book':
            console.log("Ви читаєте стародавню книгу.");
            // Логіка: показати текст на екрані
            readBook(entity);
            break;
        case 'coin':
            readBook(entity);
            break;
        case 'book_coin':
            readBook(entity);
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
function readBook(entity) {
    // 1. Видаляємо з логічного масиву
    LEVELS.dynamicEntities = LEVELS.dynamicEntities.filter(e => e.id !== entity.id);

    // 2. Видаляємо візуально
    const el = document.getElementById(entity.id);
    if (el) {
      renderEntities()
    }

}
