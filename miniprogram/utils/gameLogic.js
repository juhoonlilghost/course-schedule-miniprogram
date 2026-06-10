// utils/gameLogic.js - Core game logic (pure functions, no UI)

const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

/**
 * Create initial game state
 * @param {number} cols - grid columns
 * @param {number} rows - grid rows
 * @returns {object} game state
 */
function createInitialState(cols, rows) {
  const startX = Math.floor(cols / 2);
  const startY = Math.floor(rows / 2);
  return {
    snake: [
      { x: startX, y: startY },
      { x: startX - 1, y: startY },
      { x: startX - 2, y: startY },
    ],
    direction: 'right',
    nextDirection: 'right',
    food: null,
    score: 0,
    cols,
    rows,
    gameOver: false,
  };
}

/**
 * Spawn food at random position not occupied by snake
 */
function spawnFood(state) {
  const occupied = new Set(state.snake.map((s) => `${s.x},${s.y}`));
  const free = [];
  for (let x = 0; x < state.cols; x++) {
    for (let y = 0; y < state.rows; y++) {
      if (!occupied.has(`${x},${y}`)) free.push({ x, y });
    }
  }
  if (free.length === 0) return state; // board full
  const idx = Math.floor(Math.random() * free.length);
  state.food = free[idx];
  return state;
}

/**
 * Change direction (prevents 180-degree turns)
 */
function changeDirection(state, direction) {
  if (state.gameOver) return state;
  if (OPPOSITE[state.direction] === direction) return state;
  if (state.direction === direction) return state;
  state.nextDirection = direction;
  return state;
}

/**
 * Advance the game by one step
 * @returns {object} updated state, with flag whether food was eaten
 */
function step(state) {
  if (state.gameOver) return state;

  state.direction = state.nextDirection;
  const head = state.snake[0];
  const dir = DIRECTIONS[state.direction];
  const newHead = { x: head.x + dir.x, y: head.y + dir.y };

  // Wall collision
  if (newHead.x < 0 || newHead.x >= state.cols || newHead.y < 0 || newHead.y >= state.rows) {
    state.gameOver = true;
    return state;
  }

  // Self collision (check against all body except tail, since tail will move)
  const bodyToCheck = state.snake.slice(0, -1);
  if (bodyToCheck.some((s) => s.x === newHead.x && s.y === newHead.y)) {
    state.gameOver = true;
    return state;
  }

  const ate = state.food && newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];
  if (!ate) {
    newSnake.pop();
  } else {
    state.score += 10;
  }

  state.snake = newSnake;
  if (ate) {
    spawnFood(state);
  }
  return state;
}

module.exports = {
  createInitialState,
  changeDirection,
  step,
  spawnFood,
  DIRECTIONS,
};
