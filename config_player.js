const PLAYER = {
  id: "PLAYER",
  label: "Дослідник",
  sprite: "Sprite-0.1.png",
  baseSize: 16,
  speed: 3,
  hp: 100
};

const DIR_ROWS = {
    'left': 0,
    'down': 1,
    'right': 2,
    'up': 3
};
const TOTAL_ROWS = 4;

let Status_player = "rest";
let dir = 'down';
