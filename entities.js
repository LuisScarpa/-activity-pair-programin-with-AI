/* ===========================
   DINO NIGHT RUN — entities.js
   Classes: Dino, Obstacle, Coin, Cloud, Particle
   =========================== */

'use strict';

/* ──────────────────────────────
   DINO
   ────────────────────────────── */
class Dino {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');

    // position
    this.x       = 80;
    this.groundY = canvas.height - 80; // ground level top
    this.y       = this.groundY;
    this.w       = 44;
    this.h       = 52;

    // physics
    this.vy      = 0;
    this.gravity = 0.6;
    this.jumpPow = -13;
    this.onGround= true;
    this.doubleJumpAvail = true;

    // animation
    this.frame   = 0;
    this.frameTick = 0;
    this.frameRate = 6;          // ticks per frame
    this.running = true;

    // blink
    this.blinkTimer = 0;
    this.eyeOpen    = true;

    // flash on hit
    this.flash      = 0;
  }

  jump() {
    if (this.onGround) {
      this.vy = this.jumpPow;
      this.onGround = false;
      this.doubleJumpAvail = true;
      return true;
    } else if (this.doubleJumpAvail) {
      this.vy = this.jumpPow * 0.85;
      this.doubleJumpAvail = false;
      return true;
    }
    return false;
  }

  update() {
    // gravity
    this.vy += this.gravity;
    this.y  += this.vy;

    if (this.y >= this.groundY - this.h) {
  this.y = this.groundY - this.h; - this.h;
      this.vy = 0;
      this.onGround = true;
      this.doubleJumpAvail = true;
    }

    // animation frame
    if (this.onGround) {
      this.frameTick++;
      if (this.frameTick >= this.frameRate) {
        this.frameTick = 0;
        this.frame = (this.frame + 1) % 2; // 2 run frames
      }
    } else {
      this.frame = 2; // jump frame
    }

    // blink
    this.blinkTimer++;
    if (this.blinkTimer > 120) {
      this.eyeOpen = false;
      if (this.blinkTimer > 125) {
        this.eyeOpen = true;
        this.blinkTimer = 0;
      }
    }

    if (this.flash > 0) this.flash--;
  }

  draw() {
    const ctx = this.ctx;
    const x = this.x, y = this.y, w = this.w, h = this.h;

    ctx.save();

    if (this.flash % 4 < 2 && this.flash > 0) {
      ctx.globalAlpha = 0.4;
    }

    // ── Body ──
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, [6, 14, 6, 6]);
    ctx.fill();

    // ── Belly ──
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.roundRect(x + 8, y + 20, w - 14, h - 28, 4);
    ctx.fill();

    // ── Head (elevated) ──
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.roundRect(x + w - 10, y - 22, 28, 24, [8, 12, 4, 4]);
    ctx.fill();

    // ── Snout ──
    ctx.fillStyle = '#6ee7b7';
    ctx.beginPath();
    ctx.roundRect(x + w + 10, y - 14, 12, 10, [0, 4, 4, 0]);
    ctx.fill();

    // ── Nostril ──
    ctx.fillStyle = '#059669';
    ctx.beginPath();
    ctx.arc(x + w + 18, y - 10, 2, 0, Math.PI * 2);
    ctx.fill();

    // ── Eye ──
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x + w + 6, y - 14, 5, 0, Math.PI * 2);
    ctx.fill();

    if (this.eyeOpen) {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(x + w + 7, y - 14, 3, 0, Math.PI * 2);
      ctx.fill();
      // pupil shine
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x + w + 8, y - 15, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // closed eye — line
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w + 2, y - 14);
      ctx.lineTo(x + w + 10, y - 14);
      ctx.stroke();
    }

    // ── Tail ──
    ctx.fillStyle = '#5eead4';
    ctx.beginPath();
    ctx.moveTo(x + 6, y + h - 10);
    ctx.quadraticCurveTo(x - 16, y + h - 2, x - 20, y + h - 20);
    ctx.quadraticCurveTo(x - 18, y + h - 30, x + 4, y + h - 18);
    ctx.closePath();
    ctx.fill();

    // ── Legs (running animation) ──
    this._drawLegs(x, y, w, h);

    // ── Back spikes ──
    ctx.fillStyle = '#34d399';
    for (let i = 0; i < 3; i++) {
      const sx = x + w - 4 - i * 8;
      const sy = y - 2 - i * 3;
      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(sx + 4, sy - 8 + i * 2);
      ctx.lineTo(sx + 8, sy);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  _drawLegs(x, y, w, h) {
    const ctx  = this.ctx;
    const legY = y + h;
    const legH = 14;
    const legW = 10;

    ctx.fillStyle = '#2dd4bf';

    if (this.frame === 2) {
      // jumping — legs together slightly bent
      ctx.beginPath();
      ctx.roundRect(x + 10, legY - 4, legW, legH, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 24, legY - 4, legW, legH, 3);
      ctx.fill();
    } else if (this.frame === 0) {
      // run frame A
      ctx.beginPath();
      ctx.roundRect(x + 8, legY, legW, legH, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 26, legY - 8, legW, legH * .6, 3);
      ctx.fill();
    } else {
      // run frame B
      ctx.beginPath();
      ctx.roundRect(x + 8, legY - 8, legW, legH * .6, 3);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(x + 26, legY, legW, legH, 3);
      ctx.fill();
    }

    // feet
    ctx.fillStyle = '#14b8a6';
    if (this.frame === 0) {
      ctx.beginPath(); ctx.roundRect(x + 6,  legY + legH - 4, 14, 6, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x + 24, legY + legH * .6 - 10, 12, 6, 2); ctx.fill();
    } else if (this.frame === 1) {
      ctx.beginPath(); ctx.roundRect(x + 6,  legY + legH * .6 - 10, 12, 6, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x + 24, legY + legH - 4, 14, 6, 2); ctx.fill();
    } else {
      ctx.beginPath(); ctx.roundRect(x + 8, legY + legH - 2, 10, 5, 2); ctx.fill();
      ctx.beginPath(); ctx.roundRect(x + 24, legY + legH - 2, 10, 5, 2); ctx.fill();
    }
  }

  /** Tight hitbox */
  getHitbox() {
    return {
      x: this.x + 10,
      y: this.y - 18,
      w: this.w + 10,
      h: this.h + 12
    };
  }
}


/* ──────────────────────────────
   OBSTACLE
   ────────────────────────────── */
class Obstacle {
  constructor(canvas, speed) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.speed  = speed;

    const types = ['cactus', 'rock', 'bat'];
    this.type   = types[Math.floor(Math.random() * types.length)];

    // size
    if (this.type === 'cactus') {
      this.w = 28 + Math.random() * 16 | 0;
      this.h = 48 + Math.random() * 24 | 0;
      this.y = canvas.height - 80 - this.h;
    } else if (this.type === 'rock') {
      this.w = 36 + Math.random() * 20 | 0;
      this.h = 28 + Math.random() * 16 | 0;
      this.y = canvas.height - 80 - this.h;
    } else {
      // bat — flies mid-air
      this.w = 38;
      this.h = 22;
      this.y = canvas.height - 80 - 80 - Math.random() * 40;
      this.wingFrame = 0;
      this.wingTick  = 0;
    }

    this.x = canvas.width + 20;

    // visual seed for variation
    this.seed = Math.random();
  }

  update() {
    this.x -= this.speed;

    if (this.type === 'bat') {
      this.wingTick++;
      if (this.wingTick > 5) {
        this.wingTick = 0;
        this.wingFrame = (this.wingFrame + 1) % 2;
      }
      // slight hover
      this.y += Math.sin(Date.now() * 0.005) * 0.4;
    }
  }

  draw() {
    if (this.type === 'cactus') this._drawCactus();
    else if (this.type === 'rock') this._drawRock();
    else this._drawBat();
  }

  _drawCactus() {
    const ctx = this.ctx;
    const x = this.x, y = this.y, w = this.w, h = this.h;

    ctx.save();

    // glow
    ctx.shadowColor = '#16a34a';
    ctx.shadowBlur  = 10;

    // trunk
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.roundRect(x + w * .35, y, w * .30, h, [4, 4, 0, 0]);
    ctx.fill();

    // left arm
    ctx.beginPath();
    ctx.roundRect(x, y + h * .3, w * .38, w * .25, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x, y + h * .1, w * .25, h * .28, [4, 4, 0, 0]);
    ctx.fill();

    // right arm
    ctx.beginPath();
    ctx.roundRect(x + w * .62, y + h * .4, w * .38, w * .25, 4);
    ctx.fill();
    ctx.beginPath();
    ctx.roundRect(x + w * .74, y + h * .18, w * .25, h * .30, [4, 4, 0, 0]);
    ctx.fill();

    // highlight
    ctx.fillStyle = '#22c55e';
    ctx.globalAlpha = .25;
    ctx.beginPath();
    ctx.roundRect(x + w * .38, y + 4, w * .10, h * .5, 2);
    ctx.fill();

    ctx.restore();
  }

  _drawRock() {
    const ctx = this.ctx;
    const x = this.x, y = this.y, w = this.w, h = this.h;
    const s = this.seed;

    ctx.save();
    ctx.shadowColor = '#6366f1';
    ctx.shadowBlur  = 8;

    ctx.fillStyle = '#3730a3';
    ctx.beginPath();
    ctx.moveTo(x + w * (.2 + s * .1), y + h);
    ctx.lineTo(x,                      y + h * .6);
    ctx.lineTo(x + w * (.1 + s * .1), y + h * .2);
    ctx.lineTo(x + w * .45,           y);
    ctx.lineTo(x + w * (.75 + s * .1),y + h * .15);
    ctx.lineTo(x + w,                  y + h * .5);
    ctx.lineTo(x + w * (.8 + s * .05),y + h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#4f46e5';
    ctx.globalAlpha = .5;
    ctx.beginPath();
    ctx.moveTo(x + w * .1,  y + h * .6);
    ctx.lineTo(x + w * .3,  y + h * .2);
    ctx.lineTo(x + w * .55, y + h * .1);
    ctx.lineTo(x + w * .45, y + h * .6);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  _drawBat() {
    const ctx = this.ctx;
    const x = this.x, y = this.y, w = this.w, h = this.h;
    const flap = this.wingFrame === 0;

    ctx.save();
    ctx.shadowColor = '#a78bfa';
    ctx.shadowBlur  = 12;

    const bodyX = x + w / 2;
    const bodyY = y + h / 2;

    // wings
    ctx.fillStyle = '#7c3aed';

    // left wing
    ctx.beginPath();
    if (flap) {
      ctx.moveTo(bodyX, bodyY);
      ctx.bezierCurveTo(bodyX - 10, bodyY - 14, bodyX - 24, bodyY - 18, bodyX - w / 2, bodyY - 8);
      ctx.bezierCurveTo(bodyX - 20, bodyY + 2,  bodyX - 10, bodyY + 4,  bodyX, bodyY);
    } else {
      ctx.moveTo(bodyX, bodyY);
      ctx.bezierCurveTo(bodyX - 10, bodyY + 4,  bodyX - 24, bodyY + 8,  bodyX - w / 2, bodyY + 6);
      ctx.bezierCurveTo(bodyX - 20, bodyY - 4,  bodyX - 10, bodyY - 6,  bodyX, bodyY);
    }
    ctx.closePath();
    ctx.fill();

    // right wing
    ctx.beginPath();
    if (flap) {
      ctx.moveTo(bodyX, bodyY);
      ctx.bezierCurveTo(bodyX + 10, bodyY - 14, bodyX + 24, bodyY - 18, bodyX + w / 2, bodyY - 8);
      ctx.bezierCurveTo(bodyX + 20, bodyY + 2,  bodyX + 10, bodyY + 4,  bodyX, bodyY);
    } else {
      ctx.moveTo(bodyX, bodyY);
      ctx.bezierCurveTo(bodyX + 10, bodyY + 4,  bodyX + 24, bodyY + 8,  bodyX + w / 2, bodyY + 6);
      ctx.bezierCurveTo(bodyX + 20, bodyY - 4,  bodyX + 10, bodyY - 6,  bodyX, bodyY);
    }
    ctx.closePath();
    ctx.fill();

    // body
    ctx.fillStyle = '#5b21b6';
    ctx.beginPath();
    ctx.ellipse(bodyX, bodyY, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath(); ctx.arc(bodyX - 4, bodyY - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bodyX + 4, bodyY - 3, 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath(); ctx.arc(bodyX - 4, bodyY - 3, 1.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(bodyX + 4, bodyY - 3, 1.5, 0, Math.PI * 2); ctx.fill();

    // ears
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.moveTo(bodyX - 7, bodyY - 10);
    ctx.lineTo(bodyX - 12, bodyY - 20);
    ctx.lineTo(bodyX - 2, bodyY - 12);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(bodyX + 7, bodyY - 10);
    ctx.lineTo(bodyX + 12, bodyY - 20);
    ctx.lineTo(bodyX + 2,  bodyY - 12);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  isOffScreen() {
    return this.x + this.w < 0;
  }

  getHitbox() {
    if (this.type === 'cactus') {
      return { x: this.x + 4,  y: this.y + 4,  w: this.w - 8,  h: this.h - 4 };
    } else if (this.type === 'rock') {
      return { x: this.x + 6,  y: this.y + 6,  w: this.w - 12, h: this.h - 8 };
    } else {
      return { x: this.x + 8,  y: this.y + 4,  w: this.w - 16, h: this.h - 6 };
    }
  }
}


/* ──────────────────────────────
   COIN (point pickup)
   ────────────────────────────── */
class Coin {
  constructor(canvas, speed) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.speed  = speed;
    this.r      = 10;
    this.x      = canvas.width + 20;
    const gY    = canvas.height - 80;
    // coins at ground or floating
    this.y      = Math.random() < .5
                  ? gY - this.r - 2
                  : gY - 60 - Math.random() * 30;
    this.angle  = 0;
    this.collected = false;
    this.alpha  = 1;
  }

  update() {
    this.x     -= this.speed;
    this.angle += 0.05;
    if (this.collected) this.alpha = Math.max(0, this.alpha - .08);
  }

  draw() {
    if (this.alpha <= 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);

    // glow
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur  = 14;

    // squeeze effect (coin spin)
    const scaleX = Math.abs(Math.cos(this.angle));
    ctx.scale(scaleX < .1 ? .1 : scaleX, 1);

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, this.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(-1, -1, this.r * .65, 0, Math.PI * 2);
    ctx.fill();

    // ★ symbol
    ctx.fillStyle = '#f59e0b';
    ctx.font      = `${this.r}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 1);

    ctx.restore();
  }

  isOffScreen() { return this.x + this.r < 0; }
  isDead()      { return this.alpha <= 0; }

  getHitbox() {
    return { x: this.x - this.r, y: this.y - this.r, w: this.r * 2, h: this.r * 2 };
  }
}


/* ──────────────────────────────
   CLOUD
   ────────────────────────────── */
class Cloud {
  constructor(canvas, speed) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.speed  = speed * 0.2;  // slow parallax
    this.x      = canvas.width + Math.random() * 60;
    this.y      = 20 + Math.random() * 80;
    this.scale  = 0.5 + Math.random() * 0.8;
    this.alpha  = 0.08 + Math.random() * 0.12;
  }

  update() { this.x -= this.speed; }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = '#e0f2fe';
    ctx.beginPath();
    ctx.arc(this.x,            this.y,      28 * this.scale, 0, Math.PI * 2);
    ctx.arc(this.x + 30 * this.scale, this.y - 10 * this.scale, 22 * this.scale, 0, Math.PI * 2);
    ctx.arc(this.x + 54 * this.scale, this.y + 4  * this.scale, 20 * this.scale, 0, Math.PI * 2);
    ctx.arc(this.x + 20 * this.scale, this.y + 12 * this.scale, 18 * this.scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isOffScreen() { return this.x + 100 < 0; }
}


/* ──────────────────────────────
   PARTICLE
   ────────────────────────────── */
class Particle {
  constructor(x, y, color) {
    this.x    = x;
    this.y    = y;
    this.vx   = (Math.random() - .5) * 5;
    this.vy   = -Math.random() * 5 - 2;
    this.r    = 3 + Math.random() * 4;
    this.color= color;
    this.alpha= 1;
    this.gravity = 0.2;
  }

  update() {
    this.x    += this.vx;
    this.y    += this.vy;
    this.vy   += this.gravity;
    this.alpha = Math.max(0, this.alpha - .03);
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur  = 6;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() { return this.alpha <= 0; }
}