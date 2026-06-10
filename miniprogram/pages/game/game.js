// pages/game/game.js
const gameLogic = require('../../utils/gameLogic');

const GAME_SPEED = 150;
const GRID_SIZE = 20;
const CANVAS_MARGIN = 20; // px margin on each side
const BORDER_WIDTH = 2;

Page({
  data: {
    score: 0,
    isPlaying: false,
    showGameOver: false,
  },

  // Runtime state (not in data, for performance)
  canvas: null,
  ctx: null,
  canvasWidth: 0,
  canvasHeight: 0,
  cellSize: 0,
  cols: 0,
  rows: 0,
  state: null,
  timer: null,
  // Swipe tracking
  touchStartX: 0,
  touchStartY: 0,

  onReady() {
    this.initCanvas();
  },

  onUnload() {
    this.stopGame();
  },

  onHide() {
    if (this.data.isPlaying) {
      this.pauseGame();
    }
  },

  initCanvas() {
    const query = wx.createSelectorQuery();
    query.select('#gameCanvas').node().exec((res) => {
      if (!res[0] || !res[0].node) {
        console.error('Canvas init failed');
        return;
      }

      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getWindowInfo().pixelRatio;

      // Calculate canvas dimensions
      const screenWidth = wx.getWindowInfo().windowWidth;
      const canvasSize = screenWidth - CANVAS_MARGIN * 2;

      canvas.width = canvasSize * dpr;
      canvas.height = canvasSize * dpr;
      canvas.style.width = `${canvasSize}px`;
      canvas.style.height = `${canvasSize}px`;
      ctx.scale(dpr, dpr);

      this.canvas = canvas;
      this.ctx = ctx;
      this.canvasWidth = canvasSize;
      this.canvasHeight = canvasSize;

      // Calculate grid
      this.cols = GRID_SIZE;
      this.rows = GRID_SIZE;
      this.cellSize = canvasSize / GRID_SIZE;

      // Initialize game state
      this.resetGameState();
      this.draw();
    });
  },

  resetGameState() {
    this.state = gameLogic.createInitialState(this.cols, this.rows);
    gameLogic.spawnFood(this.state);
    this.setData({ score: 0, isPlaying: false, showGameOver: false });
  },

  onStartPause() {
    if (this.data.isPlaying) {
      this.pauseGame();
    } else {
      this.startGame();
    }
  },

  startGame() {
    if (!this.canvas) return;

    // Reset if game was over
    if (this.state.gameOver) {
      this.resetGameState();
    }

    this.setData({ isPlaying: true });

    this.stopGame();
    this.timer = setInterval(() => {
      gameLogic.step(this.state);
      this.setData({ score: this.state.score });
      this.draw();

      if (this.state.gameOver) {
        this.onGameOver();
      }
    }, GAME_SPEED);
  },

  pauseGame() {
    this.stopGame();
    this.setData({ isPlaying: false });
  },

  stopGame() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },

  onChangeDirection(e) {
    const { direction } = e.currentTarget.dataset;
    if (direction && this.state && !this.state.gameOver) {
      gameLogic.changeDirection(this.state, direction);
    }
  },

  onCanvasTouchStart(e) {
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  },

  onCanvasTouchMove() {
    // Prevent scroll while swiping on canvas
  },

  onCanvasTouchEnd(e) {
    if (!this.state || this.state.gameOver) return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - this.touchStartX;
    const dy = touch.clientY - this.touchStartY;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    let direction;
    if (Math.abs(dx) > Math.abs(dy)) {
      direction = dx > 0 ? 'right' : 'left';
    } else {
      direction = dy > 0 ? 'down' : 'up';
    }

    gameLogic.changeDirection(this.state, direction);
  },

  onGameOver() {
    this.stopGame();
    this.setData({ isPlaying: false, showGameOver: true });
    this.saveScore();
  },

  onRestart() {
    this.resetGameState();
    this.draw();
    this.startGame();
  },

  saveScore() {
    wx.cloud.callFunction({
      name: 'saveScore',
      data: { score: this.state.score },
    }).catch((err) => {
      console.warn('Cloud save failed:', err);
    });
  },

  // --- Drawing ---
  draw() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const cell = this.cellSize;

    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Draw grid lines (subtle)
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= this.cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cell, 0);
      ctx.lineTo(i * cell, this.canvasHeight);
      ctx.stroke();
    }
    for (let i = 0; i <= this.rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cell);
      ctx.lineTo(this.canvasWidth, i * cell);
      ctx.stroke();
    }

    // Draw snake
    this.state.snake.forEach((seg, i) => {
      const x = seg.x * cell + 1;
      const y = seg.y * cell + 1;
      const size = cell - 2;

      if (i === 0) {
        // Head - darker green
        ctx.fillStyle = '#388E3C';
      } else {
        ctx.fillStyle = '#4CAF50';
      }
      ctx.fillRect(x, y, size, size);
    });

    // Draw food
    if (this.state.food) {
      const fx = this.state.food.x * cell + cell / 2;
      const fy = this.state.food.y * cell + cell / 2;
      const radius = cell / 2 - 2;

      ctx.fillStyle = '#f44336';
      ctx.beginPath();
      ctx.arc(fx, fy, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  },
});
