const canvas = document.getElementById('canvas');

const ROWS = 30;
const COLS = 50;
const PIXEL = 16;
let gameInterval = null;
let pixels = new Map();

let directionQueue;
let currentSnake;
let currentSnakeKeys;
let currentVacantKeys;
let currentFoodKey;
let currentDirection;

const moveUp = ([t, l]) => [t - 1, l];
const moveRight = ([t, l]) => [t, l + 1];
const moveDown = ([t, l]) => [t + 1, l];
const moveLeft = ([t, l]) => [t, l - 1];

function initializeCanvas() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      let pixel = document.createElement('div');
      pixel.style.position = 'absolute';
      pixel.style.border = '1px solid #aaa';
      pixel.style.left = j * PIXEL + 'px';
      pixel.style.top = i * PIXEL + 'px';
      pixel.style.width = PIXEL + 'px';
      pixel.style.height = PIXEL + 'px';
      let key = toKey([i, j]);
      canvas.appendChild(pixel);
      pixels.set(key, pixel);
    }
  }
}

initializeCanvas();

function drawCanvas() {
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      const key = toKey([i, j]);
      const pixel = pixels.get(key);
      let background = 'white';

      if (key === currentFoodKey) {
        background = 'purple';
      }

      if (currentSnakeKeys.has(key)) {
        background = 'black';
      }

      pixel.style.background = background;
    }
  }
}

function step() {
  let head = currentSnake[currentSnake.length - 1];
  let nextDirection = currentDirection;

  while (directionQueue.length > 0) {
    let candidateDirection = directionQueue.shift();
    if (!areOpposite(candidateDirection, currentDirection)) {
      nextDirection = candidateDirection;
      break;
    }
  }

  currentDirection = nextDirection;

  let nextHead = currentDirection(head);
  if (!checkValidHead(currentSnakeKeys, nextHead)) {
    stopGame(false);
    return;
  }
  pushHead(nextHead);

  if (toKey(nextHead) === currentFoodKey) {
    let nextFoodKey = spawnFood();

    if (nextFoodKey === null) {
      stopGame(true);
    }

    currentFoodKey = nextFoodKey;
  } else {
    popTail();
  }

  drawCanvas();
}

function pushHead(nextHead) {
  currentSnake.push(nextHead);
  let key = toKey(nextHead);
  currentVacantKeys.delete(key);
  currentSnakeKeys.add(key);
}

function popTail() {
  let tail = currentSnake.shift();
  let key = toKey(tail);
  currentVacantKeys.add(key);
  currentSnakeKeys.delete(key);
}

function spawnFood() {
  if (currentVacantKeys.size === 0) {
    return null;
  }

  const choice = Math.floor(Math.random() * currentVacantKeys.size);
  let i = 0;

  for (let key of currentVacantKeys) {
    if (choice === i) {
      return key;
    }

    i++;
  }

  throw Error('Something went wrong on spawn food');
}

function stopGame(status) {
  canvas.style.borderColor = status ? 'green' : 'red';
  clearInterval(gameInterval);
}

function restartGame() {
  startGame();
}

function startGame() {
  canvas.style.border = '5px solid #000';
  directionQueue = [];
  currentDirection = moveRight;
  currentSnake = makeInitialSnake();

  const [snakeKeys, vacantKeys] = partitionCells(currentSnake);
  currentSnakeKeys = snakeKeys;
  currentVacantKeys = vacantKeys;

  currentFoodKey = spawnFood();

  gameInterval = setInterval(step, 40);
  drawCanvas();
}

// ----- events -----

window.addEventListener('keydown', (e) => {
  if (e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }

  e.preventDefault();

  switch (e.key) {
    case 'ArrowUp':
    case 'W':
    case 'w':
      directionQueue.push(moveUp);
      break;
    case 'ArrowRight':
    case 'D':
    case 'd':
      directionQueue.push(moveRight);
      break;
    case 'ArrowDown':
    case 'S':
    case 's':
      directionQueue.push(moveDown);
      break;
    case 'ArrowLeft':
    case 'A':
    case 'a':
      directionQueue.push(moveLeft);
      break;
    case 'R':
    case 'r':
      stopGame(false);
      restartGame();
      break;
    case ' ':
      step();
      break;
  }
});

startGame();

// ----- utilities -----

function toKey([top, left]) {
  return top + '_' + left;
}

function areOpposite(dir1, dir2) {
  if (
    (dir1 === moveLeft && dir2 === moveRight) ||
    (dir1 === moveRight && dir2 === moveLeft) ||
    (dir1 === moveUp && dir2 === moveDown) ||
    (dir1 === moveDown && dir2 === moveUp)
  ) {
    return true;
  }

  return false;
}

function partitionCells(snake) {
  const snakeKeys = new Set();
  const vacantKeys = new Set();

  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++) {
      vacantKeys.add(toKey([i, j]));
    }
  }

  for (let cell of snake) {
    let key = toKey(cell);
    vacantKeys.delete(key);
    snakeKeys.add(key);
  }

  return [snakeKeys, vacantKeys];
}

function checkValidHead(keys, cell) {
  const [top, left] = cell;

  if (top < 0 || left < 0) return false;
  if (top >= ROWS || left >= COLS) return false;
  if (keys.has(toKey(cell))) return false;

  return true;
}

function makeInitialSnake() {
  return [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
    [0, 4],
  ];
}
