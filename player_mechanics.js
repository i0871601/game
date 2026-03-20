const keysPressed = {};
let isMoving = false;
let isFight = false;

// --- Ініціалізація та спавн ---
function spawnPlayer(startX, startY) {
    const { cellSize, bestX, bestY } = RENDER_MAP.createPerfectSquareBalancedGrid();
    const playerEl = document.getElementById('player');
    const playerSprite = PLAYER.sprite;
    const playerEnt = LEVELS.entities.find(e => e.id === "player");

    playerEl.style.width = cellSize + 'px';
    playerEl.style.height = cellSize + 'px';
    playerEl.style.backgroundImage = `url('${playerSprite}')`;
    playerEl.style.imageRendering = 'pixelated';
    playerEl.style.backgroundSize = `300% 400%`;
    playerEl.style.backgroundRepeat = 'no-repeat';

    if (playerEnt) {
        playerEnt.x = startX;
        playerEnt.y = startY;
    }

    updatePlayerStylePosition(startX, startY, cellSize);

    // Визначаємо початковий напрямок
    let initialDir = 'down';
    if (startY === bestY - 1) initialDir = 'up';
    else if (startX === 0) initialDir = 'right';
    else if (startX === bestX - 1) initialDir = 'left';

    toggleAnimation(false, initialDir);

    // Початкове підсвічування після спавну
    updateVisibilityMask();
    highlightPossibleMoves();
}
function updateVisibilityMask(){
    const shadowEl = document.getElementById('Shadow');
    const playerEl = document.getElementById('player');
    
    const playerRect = playerEl.getBoundingClientRect();
    const mapRect = document.getElementById('Map');
    
    const centerX = playerEl.offsetLeft + (playerEl.offsetWidth / 2);
    const centerY = playerEl.offsetTop + (playerEl.offsetHeight / 2);

    const lightRadius = 300;
    const maskStyle = `radial-gradient(circle ${lightRadius}px at ${centerX}px ${centerY}px, transparent 10%, black 80%)`;

    shadowEl.style.maskImage = maskStyle;
}
function updatePlayerStylePosition(x, y, cellSize) {
    const playerEl = document.getElementById('player');
    playerEl.style.left = (x * cellSize) + 'px';
    playerEl.style.top = (y * cellSize) + 'px';
}

function clearMovementUI() {
    document.querySelectorAll('.cell.possible-move').forEach(el => {
        el.classList.remove('visible'); // Спочатку прибираємо видимість
        el.classList.remove('possible-move');
        el.onclick = null;
    });
}

// --- Управління анімацією ---
function toggleAnimation(moving, direction) {
    const playerEl = document.getElementById('player');
    if (!playerEl) return;

    if (direction && DIR_ROWS[direction] !== undefined) {
        const yPercent = (DIR_ROWS[direction] / (TOTAL_ROWS - 1)) * 100;
        playerEl.style.backgroundPositionY = `${yPercent}%`;
        dir = direction;
    }

    if (moving) {
        playerEl.classList.add('walk-animation');
    } else {
        playerEl.classList.remove('walk-animation');
        playerEl.style.backgroundPositionX = '0%';
    }
}

// ЄДИНИЙ ВАЛІДАТОР (виправлено дублювання)
function canMoveTo(nx, ny) {
    if (ny < 0 || ny >= LEVELS.map.length || nx < 0 || nx >= LEVELS.map[0].length) return false;

    const cellValue = LEVELS.map[ny][nx];
    const cellConfig = OBJECT_MAP.PRIORITY_STEP[cellValue];
    if (cellConfig?.solid) return false;

    const entityAtPos = [...LEVELS.entities, ...LEVELS.dynamicEntities]
        .find(ent => ent.x === nx && ent.y === ny && ent.id !== "player");

    if (entityAtPos) {
        const entConfig = OBJECT_MAP.PRIORITY_STEP[entityAtPos.type.toLowerCase()];
        if (entConfig?.solid) return false;
    }
    return true;
}

function interaction(nx, ny){
  if (ny < 0 || ny >= LEVELS.map.length || nx < 0 || nx >= LEVELS.map[0].length) return false;

  const cellValue = LEVELS.map[ny][nx];
  const cellConfig = OBJECT_MAP.PRIORITY_STEP[cellValue];
  if (cellConfig?.solid) return false;
  return true;
}

function highlightPossibleMoves() {
    clearMovementUI();
    const playerEnt = LEVELS.entities.find(e => e.id === "player");
    if (!playerEnt || isMoving || isFight) return;

    const neighbors = [
        { dx: 0, dy: -1, dir: 'up' },
        { dx: 0, dy: 1, dir: 'down' },
        { dx: -1, dy: 0, dir: 'left' },
        { dx: 1, dy: 0, dir: 'right' }
    ];

    neighbors.forEach(n => {
        const nextX = playerEnt.x + n.dx;
        const nextY = playerEnt.y + n.dy;

        if (interaction(nextX, nextY)) {
            const cellIndex = nextY * LEVELS.map[0].length + nextX;
            const cellEl = document.querySelectorAll('#Map .cell')[cellIndex];

            if (cellEl) {
                cellEl.classList.add('possible-move');

                // Використовуємо requestAnimationFrame або setTimeout для запуску анімації
                requestAnimationFrame(() => {
                    cellEl.classList.add('visible');
                });

                cellEl.onclick = (e) => {
                    e.stopPropagation();
                    movePlayer(n.dx, n.dy, n.dir);
                    const entityOnCell = [...LEVELS.entities, ...LEVELS.dynamicEntities]
                        .find(ent => ent.x === nextX && ent.y === nextY && ent.id !== "player");

                    const interactionConfig = entityOnCell ? OBJECT_MAP.INTERACTIVES[entityOnCell.type.toLowerCase()] : null;
                    const speedMultiplier = interactionConfig ? interactionConfig.speed : 1;
                    // 3. Якщо є — передаємо її в обробку ПІСЛЯ завершення анімації руху
                    if (entityOnCell) {
                        const moveDuration = PLAYER.speed * 100 * speedMultiplier; //помножити на speed
                        setTimeout(() => {
                            handleInteraction(entityOnCell);
                        }, moveDuration);
                    }
                };
            }
        }
    });
}

function movePlayer(dx, dy, direction) {
    if (isMoving || isFight) return;

    const playerEnt = LEVELS.entities.find(e => e.id === "player");
    const nextX = playerEnt.x + dx;
    const nextY = playerEnt.y + dy;

    if (canMoveTo(nextX, nextY)) {
        isMoving = true;
        clearMovementUI();

        playerEnt.x = nextX;
        playerEnt.y = nextY;

        const { cellSize } = RENDER_MAP.createPerfectSquareBalancedGrid();
        // PLAYER.speed зазвичай 3-5, тому 100 * speed = 300-500мс
        const moveDuration = 1000 / PLAYER.speed; 
        const playerEl = document.getElementById('player');
        const shadowEl = document.getElementById('Shadow');

        // 1. Встановлюємо час анімації в JS для синхронізації
        const transitionStyle = `left ${moveDuration}ms linear, top ${moveDuration}ms linear`;
        playerEl.style.transition = transitionStyle;
        shadowEl.style.transition = `-webkit-mask-image ${moveDuration}ms linear, mask-image ${moveDuration}ms linear`;

        // 2. Запускаємо анімацію ніг (спрайту)
        toggleAnimation(true, direction);

        // 3. Оновлюємо позицію (CSS transition підхопить це)
        updatePlayerStylePosition(playerEnt.x, playerEnt.y, cellSize);
        
        // 4. Оновлюємо маску (вона теж плавно перетече завдяки transition в CSS)
        updateVisibilityMask();

        setTimeout(() => {
            isMoving = false;
            toggleAnimation(false);
            
            setTimeout(() => {
                highlightPossibleMoves();
            }, 50);
        }, moveDuration);
    } else {
        toggleAnimation(false, direction);
    }
}
