// --- Генерація мапи ---
function generateSingleWallMaze(forcedStart = null) {
    const { cellSize, bestX, bestY } = RENDER_MAP.createPerfectSquareBalancedGrid();

    // Скидаємо мапу
    LEVELS.map = Array.from({ length: bestY }, () => Array(bestX).fill(1));
    [...LEVELS.entities, ...LEVELS.dynamicEntities].forEach(e => { e.x = -1; e.y = -1; });

    let s = { x: 0, y: 0 }, e = { x: 0, y: 0 };

    if (forcedStart) {
        // Вхід там, де був вихід минулого разу
        s.x = forcedStart.x;
        s.y = forcedStart.y;
    } else {
        // Випадковий вхід для першого рівня
        const isVert = Math.random() < 0.5;
        if (isVert) {
            s.x = Math.floor(Math.random() * ((bestX - 2) / 2)) * 2 + 1;
            s.y = Math.random() < 0.5 ? 0 : bestY - 1;
        } else {
            s.y = Math.floor(Math.random() * ((bestY - 2) / 2)) * 2 + 1;
            s.x = Math.random() < 0.5 ? 0 : bestX - 1;
        }
    }

    // Випадковий вихід (завжди новий)
    const exitVert = Math.random() < 0.5;
    if (exitVert) {
        e.x = Math.floor(Math.random() * ((bestX - 2) / 2)) * 2 + 1;
        e.y = s.y === 0 ? bestY - 1 : 0; // На протилежну сторону
    } else {
        e.y = Math.floor(Math.random() * ((bestY - 2) / 2)) * 2 + 1;
        e.x = s.x === 0 ? bestX - 1 : 0;
    }

    // Алгоритм вирізання
    const carve = (cx, cy) => {
        LEVELS.map[cy][cx] = 0;
        [[0, -2], [0, 2], [-2, 0], [2, 0]].sort(() => Math.random() - 0.5).forEach(([dx, dy]) => {
            const nx = cx + dx, ny = cy + dy;
            if (nx > 0 && nx < bestX - 1 && ny > 0 && ny < bestY - 1 && LEVELS.map[ny][nx] === 1) {
                LEVELS.map[cy + dy / 2][cx + dx / 2] = 0;
                carve(nx, ny);
            }
        });
    };

    // Починаємо carve з клітинки, що прилягає до входу
    const startCX = s.x === 0 ? 1 : (s.x === bestX - 1 ? bestX - 2 : s.x);
    const startCY = s.y === 0 ? 1 : (s.y === bestY - 1 ? bestY - 2 : s.y);
    carve(startCX, startCY);

    // З'єднуємо вхід/вихід
    const connect = (p) => {
        LEVELS.map[p.y][p.x] = 0;
        if (p.y === 0) LEVELS.map[1][p.x] = 0;
        else if (p.y === bestY - 1) LEVELS.map[bestY - 2][p.x] = 0;
        else if (p.x === 0) LEVELS.map[p.y][1] = 0;
        else if (p.x === bestX - 1) LEVELS.map[p.y][bestX - 2] = 0;
    };
    connect(s); connect(e);

    // Записуємо точки в сутності
    const startEnt = LEVELS.entities.find(ent => ent.id === "startPoint");
    const exitEnt = LEVELS.entities.find(ent => ent.id === "exitPoint");
    if (startEnt) { startEnt.x = s.x; startEnt.y = s.y; }
    if (exitEnt) { exitEnt.x = e.x; exitEnt.y = e.y; }
}
// ---  Допоміжний BFS ---
function getBFSPath(maze, start, target) {
    if (!start || !target) return [];
    if (start.x === target.x && start.y === target.y) return [start];
    const height = maze.length;
    const width = maze[0].length;
    let queue = [start];
    let visited = new Map();
    visited.set(`${start.x},${start.y}`, null);

    while (queue.length > 0) {
        let cur = queue.shift();
        if (cur.x === target.x && cur.y === target.y) {
            return reconstructPath(visited, cur);
        }
        for (let [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
            let nx = cur.x + dx;
            let ny = cur.y + dy;
            let key = `${nx},${ny}`;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height &&
                maze[ny][nx] === 0 && !visited.has(key)) {
                visited.set(key, cur);
                queue.push({ x: nx, y: ny });
            }
        }
    }
    return [];
}
function reconstructPath(visited, targetNode) {
    let path = [];
    let current = targetNode;
    while (current) {
        path.unshift(current);
        current = visited.get(`${current.x},${current.y}`);
    }
    return path;
}
// --- Пошук позиції для сутностей ---
function findPositionForEntity(entity, path, maze) {
    const height = maze.length;
    const width = maze[0].length;
    const startEnt = LEVELS.entities.find(ent => ent.id === "startPoint");
    const exitEnt = LEVELS.entities.find(ent => ent.id === "exitPoint");

    // 1. Фіксована дистанція на шляху (для специфічних об'єктів)
    if (entity.distance !== undefined) {
        return path[Math.min(entity.distance, path.length - 1)] || { x: 1, y: 1 };
    }

    const pathSet = new Set(path.map(p => `${p.x},${p.y}`));
    const occupied = new Set();
    [...LEVELS.entities, ...LEVELS.dynamicEntities].forEach(e => {
        if (e.x !== -1 && e.y !== -1) occupied.add(`${e.x},${e.y}`);
    });

    let deadEnds = [];
    let freeOffPath = [];
    let freeOnPath = [];

    // 2. Аналіз мапи
    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            if (maze[y][x] === 0 && !occupied.has(`${x},${y}`)) {

                // Радіус безпеки (від гравця та виходу)
                const distToPlayer = startEnt ? Math.abs(x - startEnt.x) + Math.abs(y - startEnt.y) : 99;
                const distToExit = exitEnt ? Math.abs(x - exitEnt.x) + Math.abs(y - exitEnt.y) : 99;
                if (distToPlayer <= 2 || distToExit <= 1) continue;

                // Рахуємо стіни навколо для визначення тупиків
                const walls = (maze[y-1][x] + maze[y+1][x] + maze[y][x-1] + maze[y][x+1]);

                if (walls === 3) deadEnds.push({ x, y });
                else if (!pathSet.has(`${x},${y}`)) freeOffPath.push({ x, y });
                else freeOnPath.push({ x, y });
            }
        }
    }
    // 3. Спеціальна логіка для BOSS або Секретів
    if (entity.secret || entity.id === "bossRoom") {
        if (deadEnds.length > 0) {
            let pos = deadEnds[Math.floor(Math.random() * deadEnds.length)];
            const width = maze[0].length, height = maze.length;

            if (entity.id === "bossRoom") {
                if (pos.x === 1) { maze[pos.y][0] = 0; pos.x = 0; }
                else if (pos.x === width - 2) { maze[pos.y][width - 1] = 0; pos.x = width - 1; }
                else if (pos.y === 1) { maze[0][pos.x] = 0; pos.y = 0; }
                else if (pos.y === height - 2) { maze[height - 1][pos.x] = 0; pos.y = height - 1; }

                maze[pos.y][pos.x] = 0;
                return pos; // Повертаємо координати пробитої стіни
            }
        }
        return null;
    }

    // 4. Логіка для звичайних сутностей (вороги, лут)
    // Пріоритет: тупики -> вільні зони поза шляхом -> головний шлях
    let candidates = deadEnds.length > 0 ? deadEnds : (freeOffPath.length > 0 ? freeOffPath : freeOnPath);

    return candidates.length > 0
        ? candidates[Math.floor(Math.random() * candidates.length)]
        : { x: 1, y: 1 };
}
function applySpriteStyles(element, typeKey, cellSize, x = null, y = null) {
    const styleConf = OBJECT_MAP.STYLES[typeKey.toLowerCase()];
    if (!styleConf) return;

    const tilesetImg = OBJECT_MAP.SET_LEVEL[LEVELS.levels] || OBJECT_MAP.SET_LEVEL[1];
    const totalWidth = OBJECT_MAP.LENGTH_STYLES * cellSize;
    const startX = -(styleConf.col - 1) * cellSize;

    // Базові стилі спрайту
    Object.assign(element.style, {
        backgroundImage: `url('${tilesetImg}')`,
        imageRendering: 'pixelated',
        backgroundRepeat: 'no-repeat',
        backgroundSize: `${totalWidth}px ${cellSize}px`,
        backgroundPosition: `${startX}px 0px`,
        width: `${cellSize}px`,
        height: `${cellSize}px`
    });

    // Якщо передані координати — додаємо абсолютне позиціонування
    if (x !== null && y !== null) {
        Object.assign(element.style, {
            position: 'absolute',
            left: `${x * cellSize}px`,
            top: `${y * cellSize}px`
        });
    }

    // Анімація (залишається як була)
    if (styleConf.step) {
        element.style.setProperty('--start-x', `${startX}px`);
        element.style.setProperty('--end-x', `${startX - (styleConf.step * cellSize)}px`);
        element.style.setProperty('--steps-count', styleConf.step);
    }
}
function calculateEntitiesPositions() {
    const start = LEVELS.entities.find(e => e.id === "startPoint");
    const exit = LEVELS.entities.find(e => e.id === "exitPoint");
    const path = getBFSPath(LEVELS.map, start, exit);

    [...LEVELS.entities, ...LEVELS.dynamicEntities].forEach(ent => {
        if (ent.id === "player" || ent.id === "startPoint" || ent.id === "exitPoint") return;

        const pos = findPositionForEntity(ent, path, LEVELS.map);
        if (pos) {
            ent.x = pos.x;
            ent.y = pos.y;
        }
    });
}
// --- Рендер мапи (HTML + Спрайти) ---
function renderMaze() {
    const mapElement = document.getElementById('Map');
    const { cellSize, bestX, bestY } = RENDER_MAP.createPerfectSquareBalancedGrid();

    // Налаштування контейнера
    mapElement.style.display = 'grid';
    mapElement.style.gridTemplateColumns = `repeat(${bestX}, ${cellSize}px)`;
    mapElement.innerHTML = '';

    const fragment = document.createDocumentFragment();

    LEVELS.map.forEach(row => {
        row.forEach(cellValue => {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.style.width = cell.style.height = cellSize + 'px';

            const typeKey = cellValue === 1 ? 'wall' : 'path';
            applySpriteStyles(cell, typeKey, cellSize);

            fragment.appendChild(cell);
        });
    });
    mapElement.appendChild(fragment);
}
// ---  Перегенерація ---
function generateMazeWithRetries(forcedStart = null, maxRetries = 11) {
    const { bestX, bestY } = RENDER_MAP.createPerfectSquareBalancedGrid();
    for (let i = 0; i < maxRetries; i++) {
        // ВАЖЛИВО: Передаємо forcedStart сюди!
        generateSingleWallMaze(forcedStart);

        const startEnt = LEVELS.entities.find(ent => ent.id === "startPoint");
        const exitEnt = LEVELS.entities.find(ent => ent.id === "exitPoint");
        const path = getBFSPath(LEVELS.map, startEnt, exitEnt);

        if (path.length > 0 && path.length > bestX) return true;
    }
    return false;
}
// --- Рендер сутностей ---
function renderEntities() {
    const entElement = document.getElementById('entities');
    const { cellSize } = RENDER_MAP.createPerfectSquareBalancedGrid();
    const start = LEVELS.entities.find(e => e.id === "startPoint");
    const exit = LEVELS.entities.find(e => e.id === "exitPoint");
    const path = getBFSPath(LEVELS.map, start, exit);

    entElement.innerHTML = '';

    [...LEVELS.entities, ...LEVELS.dynamicEntities].forEach(ent => {
        if (ent.id === "player") return;

        // Пошук позиції, якщо вона ще не задана
        if (ent.x === -1) {
            const pos = findPositionForEntity(ent, path, LEVELS.map);
            if (!pos) return;
            ent.x = pos.x; ent.y = pos.y;
        }

        const el = document.createElement('div');
        el.id = ent.id;
        el.className = `entity ${ent.type.toLowerCase()}`;

        // Викликаємо оновлену функцію з координатами
        applySpriteStyles(el, ent.type, cellSize, ent.x, ent.y);

        entElement.appendChild(el);
    });
}
// --- Ініціалізація рівня ---
function initLevel(nextStartCoords = null) {
    // 1. Створюємо мапу та "дірки" для входу/виходу
    if (!generateMazeWithRetries(nextStartCoords)) return;
    // 2. Створюємо предмети (скидаємо їх старі позиції до -1)
    LEVELS.dynamicEntities = generateDynamicLoot();
    // 3. РОЗРАХУНОК: Бос пробиває стіну тут, вороги шукають тупики
    calculateEntitiesPositions();
    // 4. МАЛЮВАННЯ: Тепер, коли мапа змінена Босом, малюємо її
    renderMaze();
    renderEntities();
    // 5. ГРАВЕЦЬ
    const startPoint = LEVELS.entities.find(ent => ent.id === "startPoint");
    spawnPlayer(startPoint.x, startPoint.y);
}
