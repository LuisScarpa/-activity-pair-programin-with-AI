/* ===========================
   DINO NIGHT RUN — game.js
   Main game engine
   =========================== */

'use strict';

/* ──────────────────────────────
   CONSTANTS
   ────────────────────────────── */
const CFG = {
  BASE_SPEED:       5,
  MAX_SPEED:        14,
  SPEED_INCREMENT:  0.0008,   // per frame
  OBSTACLE_INTERVAL_MIN: 60,
  OBSTACLE_INTERVAL_MAX: 130,
  COIN_INTERVAL_MIN:     80,
  COIN_INTERVAL_MAX:     180,
  CLOUD_INTERVAL_MIN:    90,
  CLOUD_INTERVAL_MAX:    200,
  COIN_VALUE:            5,
  SCORE_PER_TICK:        0.1,
  HI_KEY:               'dinoNightHiScore',
};

/* ──────────────────────────────
   GAME STATE
   ────────────────────────────── */
const STATE = { IDLE: 0, PLAYING: 1, DEAD: 2 };

/* ──────────────────────────────
   HELPERS
   ────────────────────────────── */
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function fmtScore(n) {
  return String(Math.floor(n)).padStart(5, '0');
}

/* ──────────────────────────────
   GAME CLASS
   ────────────────────────────── */
class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx    = this.canvas.getContext('2d');

    this._resize();
    window.addEventListener('resize', () => this._resize());

    // DOM refs
    this.scoreEl   = document.getElementById('score');
    this.hiEl      = document.getElementById('hi-score');
    this.spdEl     = document.getElementById('speed-display');
    this.startScr  = document.getElementById('start-screen');
    this.overScr   = document.getElementById('game-over-screen');
    this.finalEl   = document.getElementById('final-score');
    this.recordEl  = document.getElementById('new-record');

    // game vars
    this.state     = STATE.IDLE;
    this.score     = 0;
    this.hiScore   = parseInt(localStorage.getItem(CFG.HI_KEY) || '0', 10);
    this.speed     = CFG.BASE_SPEED;
    this.frame     = 0;

    // entity lists
    this.dino      = null;
    this.obstacles = [];
    this.coins     = [];
    this.clouds    = [];
    this.particles = [];

    // timers
    this.nextObstacle = this._randObstacleInterval();
    this.nextCoin     = this._randCoinInterval();
    this.nextCloud    = 0;

    // flash effect on score milestones
    this.flashScore = 0;

    this._bindInput();
    this._updateHiDisplay();

    // kick off loop
    requestAnimationFrame(() => this._loop());
  }

  /* ── Setup ─────────────────── */
  _resize() {
    const wrapper = document.getElementById('game-wrapper');
    this.canvas.width  = wrapper.clientWidth;
    this.canvas.height = wrapper.clientHeight;
  }

  _randObstacleInterval() {
    return CFG.OBSTACLE_INTERVAL_MIN +
      Math.random() * (CFG.OBSTACLE_INTERVAL_MAX - CFG.OBSTACLE_INTERVAL_MIN) | 0;
  }

  _randCoinInterval() {
    return CFG.COIN_INTERVAL_MIN +
      Math.random() * (CFG.COIN_INTERVAL_MAX - CFG.COIN_INTERVAL_MIN) | 0;
  }

  /* ── Input ─────────────────── */
  _bindInput() {
    const handler = (e) => {
      if (e.type === 'keydown') {
        if (e.code !== 'Space' && e.code !== 'ArrowUp') return;
        e.preventDefault();
      }
      this._handleAction();
    };

    document.addEventListener('keydown', handler);
    this.canvas.addEventListener('pointerdown', handler);
    document.getElementById('start-screen').addEventListener('pointerdown', handler);
    document.getElementById('game-over-screen').addEventListener('pointerdown', handler);
  }

  _handleAction() {
    if (this.state === STATE.IDLE) {
      this._startGame();
    } else if (this.state === STATE.PLAYING) {
      this.dino.jump();
    } else if (this.state === STATE.DEAD) {
      this._startGame();
    }
  }

  /* ── Game lifecycle ─────────── */
  _startGame() {
    this.score      = 0;
    this.speed      = CFG.BASE_SPEED;
    this.frame      = 0;
    this.obstacles  = [];
    this.coins      = [];
    this.particles  = [];
    this.nextObstacle = this._randObstacleInterval();
    this.nextCoin     = this._randCoinInterval();
    this.nextCloud    = 0;

    this.dino = new Dino(this.canvas);

    this.startScr.classList.add('hidden');
    this.overScr.classList.add('hidden');

    this.state = STATE.PLAYING;
  }

  _endGame() {
    this.state = STATE.DEAD;
    this.dino.flash = 999;

    // explosion particles
    const hb = this.dino.getHitbox();
    const cx = hb.x + hb.w / 2;
    const cy = hb.y + hb.h / 2;
    const colors = ['#ff4d6d', '#fbbf24', '#f9a8d4', '#c4b5fd'];
    for (let i = 0; i < 22; i++) {
      this.particles.push(new Particle(cx, cy, colors[i % colors.length]));
    }

    // hi score
    const isNew = this.score > this.hiScore;
    if (isNew) {
      this.hiScore = Math.floor(this.score);
      localStorage.setItem(CFG.HI_KEY, this.hiScore);
      this._updateHiDisplay();
    }

    this.finalEl.textContent = fmtScore(this.score);
    this.recordEl.classList.toggle('hidden', !isNew);

    setTimeout(() => {
      this.overScr.classList.remove('hidden');
    }, 600);
  }

  _updateHiDisplay() {
    this.hiEl.textContent = fmtScore(this.hiScore);
  }

  /* ── Spawning ───────────────── */
  _spawnEntities() {
    // clouds (always spawn regardless of state)
    if (this.nextCloud <= 0) {
      this.clouds.push(new Cloud(this.canvas, this.speed));
      this.nextCloud = CFG.CLOUD_INTERVAL_MIN +
        Math.random() * (CFG.CLOUD_INTERVAL_MAX - CFG.CLOUD_INTERVAL_MIN) | 0;
    }
    this.nextCloud--;

    if (this.state !== STATE.PLAYING) return;

    // obstacles
    this.nextObstacle--;
    if (this.nextObstacle <= 0) {
      this.obstacles.push(new Obstacle(this.canvas, this.speed));
      this.nextObstacle = this._randObstacleInterval();
    }

    // coins
    this.nextCoin--;
    if (this.nextCoin <= 0) {
      this.coins.push(new Coin(this.canvas, this.speed));
      this.nextCoin = this._randCoinInterval();
    }
  }

  /* ── Update ─────────────────── */
  _update() {
    this.frame++;

    this._spawnEntities();

    // update clouds always
    this.clouds = this.clouds.filter(c => !c.isOffScreen());
    this.clouds.forEach(c => c.update());

    if (this.state !== STATE.PLAYING) {
      // still update particles on death
      this.particles = this.particles.filter(p => !p.isDead());
      this.particles.forEach(p => p.update());
      return;
    }

    // speed ramp
    this.speed = Math.min(
      CFG.MAX_SPEED,
      CFG.BASE_SPEED + this.frame * CFG.SPEED_INCREMENT
    );

    // score
    this.score += CFG.SCORE_PER_TICK * (this.speed / CFG.BASE_SPEED);

    if (Math.floor(this.score) % 100 === 0 && Math.floor(this.score) > 0) {
      this.flashScore = 12;
    }

    // dino
    this.dino.update();

    // obstacles
    this.obstacles = this.obstacles.filter(o => !o.isOffScreen());
    for (const obs of this.obstacles) {
      obs.speed = this.speed;
      obs.update();

      if (rectsOverlap(this.dino.getHitbox(), obs.getHitbox())) {
        this._endGame();
        return;
      }
    }

    // coins
    this.coins = this.coins.filter(c => !c.isDead() && !c.isOffScreen());
    for (const coin of this.coins) {
      coin.speed = this.speed;
      coin.update();

      if (!coin.collected && rectsOverlap(this.dino.getHitbox(), coin.getHitbox())) {
        coin.collected = true;
        this.score += CFG.COIN_VALUE;
        this._burstCoins(coin.x, coin.y);
      }
    }

    // particles
    this.particles = this.particles.filter(p => !p.isDead());
    this.particles.forEach(p => p.update());
  }

  _burstCoins(x, y) {
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(x, y, '#fbbf24'));
    }
  }

  /* ── Draw ───────────────────── */
  _draw() {
    const ctx = this.ctx;
    const W   = this.canvas.width;
    const H   = this.canvas.height;

    // sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#050c1f');
    sky.addColorStop(1, '#0a1530');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // clouds
    this.clouds.forEach(c => c.draw());

    // distant hills / horizon glow
    ctx.save();
    const glow = ctx.createRadialGradient(W * .5, H - 80, 0, W * .5, H - 80, W * .6);
    glow.addColorStop(0,   'rgba(30,60,120,.18)');
    glow.addColorStop(1,   'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // ground
    this._drawGround(W, H);

    // entities
    if (this.dino) this.dino.draw();
    this.obstacles.forEach(o => o.draw());
    this.coins.forEach(c => c.draw());
    this.particles.forEach(p => p.draw(ctx));

    // HUD updates
    this._updateHUD();

    // score flash
    if (this.flashScore > 0) {
      ctx.save();
      ctx.globalAlpha = this.flashScore / 12 * .3;
      ctx.fillStyle   = '#fbbf24';
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      this.flashScore--;
    }
  }

  _drawGround(W, H) {
    const ctx = this.ctx;
    const groundTop = H - 80;

    // main ground fill
    const gr = ctx.createLinearGradient(0, groundTop, 0, H);
    gr.addColorStop(0, '#1a2442');
    gr.addColorStop(1, '#0d1530');
    ctx.fillStyle = gr;
    ctx.fillRect(0, groundTop, W, H - groundTop);

    // top edge line
    ctx.save();
    ctx.strokeStyle = '#2e4070';
    ctx.lineWidth   = 2;
    ctx.shadowColor = '#3b60b0';
    ctx.shadowBlur  = 8;
    ctx.beginPath();
    ctx.moveTo(0, groundTop);
    ctx.lineTo(W, groundTop);
    ctx.stroke();
    ctx.restore();

    // dashed line
    ctx.save();
    ctx.strokeStyle = '#1e3060';
    ctx.lineWidth   = 1;
    ctx.setLineDash([20, 16]);
    ctx.beginPath();
    ctx.moveTo(0, groundTop + 16);
    ctx.lineTo(W, groundTop + 16);
    ctx.stroke();
    ctx.restore();

    // scrolling ground texture dots
    const offset = (this.frame * this.speed * .3) % 60;
    ctx.save();
    ctx.fillStyle = '#1e2d50';
    for (let i = -60; i < W + 60; i += 60) {
      ctx.fillRect(i - offset, groundTop + 8, 24, 3);
    }
    ctx.restore();
  }

  _updateHUD() {
    this.scoreEl.textContent  = fmtScore(this.score);
    this.spdEl.textContent    = (this.speed / CFG.BASE_SPEED).toFixed(1) + 'x';
  }

  /* ── Main loop ──────────────── */
  _loop() {
    this._update();
    this._draw();
    requestAnimationFrame(() => this._loop());
  }
}

/* ──────────────────────────────
   BOOT
   ────────────────────────────── */
window.addEventListener('DOMContentLoaded', () => {
  new Game();
});
