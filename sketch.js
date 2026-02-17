let player;
let platforms = [];
let camX = 0;
let coins = [];
let enemies = [];
let goal;
let score = 0;
let gameState = "playing";
let messageTimer = 0;

const GRAVITY = 0.9;
const JUMP_V = -15;
const MOVE_A = 0.9;
const MAX_VX = 7;
const FRICTION = 0.82;

function setup() {
    createCanvas(windowWidth, windowHeight);

    player = {
        x: 120,
        y: 100,
        vx: 0,
        vy: 0,
        w: 34,
        h: 46,
        onGround: false
    };

    platforms = [
        { x: -200, y: height - 140, w: 900, h: 30, depth: 2 },
        { x: 820, y: height - 220, w: 220, h: 26, depth: 2 },
        { x: 1180, y: height - 300, w: 260, h: 26, depth: 1 },
        { x: 1560, y: height - 190, w: 260, h: 26, depth: 2 },
        { x: 1960, y: height - 260, w: 260, h: 26, depth: 1 }
    ];

    coins = [
        { x: 320, y: height - 200, r: 10, taken: false },
        { x: 560, y: height - 200, r: 10, taken: false },
        { x: 880, y: height - 280, r: 10, taken: false },
        { x: 1260, y: height - 360, r: 10, taken: false },
        { x: 1620, y: height - 250, r: 10, taken: false }
    ];

    enemies = [
        makeEnemy(650, height - 186, 34, 26, 1.6, 520, 760),
        makeEnemy(1700, height - 156, 34, 26, 1.9, 1560, 1860)
    ];

    goal = { x: 2150, y: height - 290, w: 30, h: 150 };

}

function makeEnemy(x, y, w, h, vx, minX, maxX) {
    return { x, y, w, h, vx, minX, maxX, alive: true };
}

function draw() {
    updateCamera();

    drawSky();

    drawParallaxLayer(0.15, 22);
    drawParallaxLayer(0.30, 34);

    push();
    translate(-camX, 0);

    const sortedPlatforms = [...platforms].sort((a, b) => a.depth - b.depth);
    for (const p of sortedPlatforms) drawBlockPlatform(p);

    drawCoins();
    updateEnemies();
    drawEnemies();
    drawGoal();

    updatePlayer();
    drawPlayer();

    pop();

    drawHUD();

    if (gameState === "dead" || gameState === "won") {
        drawOverlayMessage();
    }

}

function drawOverlayMessage() {
  fill(0, 0, 0, 180);
  rect(0, 0, width, height);

  textAlign(CENTER, CENTER);
  textSize(48);

  if (gameState === "dead") {
    fill(255, 80, 80);
    text("YOU DIED", width / 2, height / 2);
  } else if (gameState === "won") {
    fill(100, 255, 140);
    text("LEVEL COMPLETE!", width / 2, height / 2);
  }

  messageTimer--;

  if (messageTimer <= 0) {
    resetLevel();
  }
}

function updateCamera() {
    const target = player.x - width * 0.35;
    camX = lerp(camX, target, 0.08);
    if (camX < 0) camX = 0;
}

function drawSky() {
    for (let y = 0; y < height; y += 6) {
        const t = y / height;
        const a = 50 + 120 * t;
        fill(12 + 10 * t, 12 + 12 * t, 18 + 16 * t, a);
        rect(0, y, width, 6);
    }
}

function drawParallaxLayer(strength, blobSize) {
    push();
    const offsetX = -camX * strength;
    translate(offsetX, 0);

    noStroke();
    const span = 700;
    for (let i = -2; i < 8; i++) {
        const x = i * span + 120;
        const y = height * 0.35 + sin((i + frameCount * 0.002) * 2) * 20;
        fill(255, 255, 255, 18);
        ellipse(x, y, blobSize * 6, blobSize * 2.6);
        fill(255, 255, 255, 10);
        ellipse(x + 130, y + 30, blobSize * 8, blobSize * 3.2);
    }
    pop();
}

function drawCoins() {
    for (const c of coins) {
        if (c.taken) continue;

        noStroke();
        fill(0, 0, 0, 60);
        ellipse(c.x + 3, c.y + 6, c.r * 2.2, c.r * 0.9);

        fill(255, 215, 90, 240);
        ellipse(c.x, c.y, c.r * 2.0, c.r * 2.0);

        fill(255, 245, 200, 180);
        ellipse(c.x - 3, c.y - 3, c.r * 0.9, c.r * 0.9);

        if (rectCircleHit(player.x, player.y, player.w, player.h, c.x, c.y, c.r)) {
            c.taken = true;
            score += 1;
        }
    }
}

function updateEnemies() {
    if (gameState !== "playing") return;
    for (const e of enemies) {
        if (!e.alive) continue;

        e.x += e.vx;
        if (e.x < e.minX || e.x + e.w > e.maxX) e.vx *= -1;

        if (rectRectHit(player.x, player.y, player.w, player.h, e.x, e.y, e.w, e.h)) {
            const playerBottom = player.y + player.h;
            const enemyTop = e.y;
            const falling = player.vy > 0;

            if (falling && playerBottom - player.vy <= enemyTop + 6) {
                e.alive = false;
                player.vy = -11;
                score += 2;
            } else {
                if (gameState === "playing") {
                    gameState = "dead";
                    messageTimer = 120;
                }

            }
        }
    }
}

function drawEnemies() {
    for (const e of enemies) {
        if (!e.alive) continue;

        noStroke();
        fill(0, 0, 0, 65);
        ellipse(e.x + e.w * 0.55, e.y + e.h + 10, e.w * 1.1, e.w * 0.35);

        fill(255, 120, 120, 235);
        rect(e.x, e.y, e.w, e.h, 6);

        fill(210, 90, 90, 235);
        quad(e.x + e.w, e.y + 4, e.x + e.w + 10, e.y + 10, e.x + e.w + 10, e.y + e.h - 2, e.x + e.w, e.y + e.h);

        fill(20, 20, 25, 220);
        ellipse(e.x + e.w * 0.35, e.y + e.h * 0.45, 4, 6);
        ellipse(e.x + e.w * 0.65, e.y + e.h * 0.45, 4, 6);
    }
}

function drawGoal() {
    noStroke();
    fill(230, 230, 240, 200);
    rect(goal.x, goal.y, 6, goal.h);

    fill(140, 200, 255, 220);
    rect(goal.x + 6, goal.y + 10, goal.w, 18, 4);

    if (rectRectHit(player.x, player.y, player.w, player.h, goal.x, goal.y, goal.w + 6, goal.h)) {
        if (gameState === "playing") {
            gameState = "won";
            messageTimer = 120;
        }

    }

}

function rectRectHit(ax, ay, aw, ah, bx, by, bw, bh) {
    return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function rectCircleHit(rx, ry, rw, rh, cx, cy, cr) {
    const closestX = constrain(cx, rx, rx + rw);
    const closestY = constrain(cy, ry, ry + rh);
    const dx = cx - closestX;
    const dy = cy - closestY;
    return (dx * dx + dy * dy) <= cr * cr;
}


function updatePlayer() {
    if (gameState !== "playing") return;
    const left = keyIsDown(LEFT_ARROW);
    const right = keyIsDown(RIGHT_ARROW);

    if (left) player.vx -= MOVE_A;
    if (right) player.vx += MOVE_A;

    player.vx = constrain(player.vx, -MAX_VX, MAX_VX);

    if (player.onGround && jumpQueued) {
        jumpQueued = false;
        player.vy = JUMP_V;
        player.onGround = false;
    }


    player.vy += GRAVITY;
    player.x += player.vx;
    player.y += player.vy;

    if (player.onGround) player.vx *= FRICTION;

    player.onGround = false;
    for (const p of platforms) {
        const px = p.x;
        const py = p.y;
        const pw = p.w;
        const ph = p.h;

        const playerBottom = player.y + player.h;
        const prevBottom = (player.y - player.vy) + player.h;

        const withinX = player.x + player.w > px && player.x < px + pw;

        if (withinX && prevBottom <= py && playerBottom >= py) {
            player.y = py - player.h;
            player.vy = 0;
            player.onGround = true;
        }
        jumpQueued = false;
    }

    if (player.y > height + 400 && gameState === "playing") {
        gameState = "dead";
        messageTimer = 120;
    }

}

function resetLevel() {
    score = 0;

    player.x = 120;
    player.y = 100;
    player.vx = 0;
    player.vy = 0;
    player.onGround = false;
    camX = 0;

    for (const c of coins) c.taken = false;

    enemies = [
        makeEnemy(650, height - 186, 34, 26, 1.6, 520, 760),
        makeEnemy(1700, height - 156, 34, 26, 1.9, 1560, 1860)
    ];

    jumpQueued = false;

    gameState = "playing";
}

function resetPlayer() {
    function resetPlayer() {
        resetLevel();
    }

}

function drawPlayer() {
    const shadowY = player.y + player.h + 8;
    noStroke();
    fill(0, 0, 0, 70);
    ellipse(player.x + player.w * 0.5, shadowY, player.w * 1.1, player.w * 0.35);

    const x = player.x;
    const y = player.y;
    const w = player.w;
    const h = player.h;

    fill(180, 120, 255, 240);
    rect(x, y, w, h, 8);

    fill(150, 95, 225, 240);
    quad(x + w, y + 6, x + w + 10, y + 12, x + w + 10, y + h - 6, x + w, y + h);

    fill(210, 170, 255, 200);
    rect(x + 4, y + 4, w - 8, 10, 6);
}

function drawBlockPlatform(p) {
    const depth = p.depth;
    const fog = depth === 1 ? 0.75 : depth === 0 ? 0.55 : 1.0;
    const thickness = depth === 2 ? 22 : depth === 1 ? 16 : 12;

    const frontA = 230 * fog;
    const sideA = 210 * fog;
    const topA = 245 * fog;

    const x = p.x;
    const y = p.y;
    const w = p.w;
    const h = p.h;

    noStroke();
    fill(0, 0, 0, 55 * fog);
    rect(x + 10, y + thickness + 8, w - 12, 10, 8);

    fill(200, 200, 220, topA);
    rect(x, y, w, h, 8);

    fill(170, 170, 195, frontA);
    rect(x, y + h, w, thickness, 6);

    fill(150, 150, 175, sideA);
    quad(x + w, y, x + w + 16, y + 8, x + w + 16, y + h + thickness + 6, x + w, y + h + thickness);
}

function keyPressed() {
    if (keyCode === 32) jumpQueued = true;
}

function drawHUD() {
    fill(255, 255, 255, 175);
    textSize(14);
    text("Arrows: move | Space: jump", 16, 44);
    text(`Score: ${score}`, 16, 66);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    platforms[0].y = height - 140;
    platforms[1].y = height - 220;
    platforms[2].y = height - 300;
    platforms[3].y = height - 190;
    platforms[4].y = height - 260;
    coins = [
        { x: 320, y: height - 200, r: 10, taken: false },
        { x: 560, y: height - 200, r: 10, taken: false },
        { x: 880, y: height - 280, r: 10, taken: false },
        { x: 1260, y: height - 360, r: 10, taken: false },
        { x: 1620, y: height - 250, r: 10, taken: false }
    ];

    enemies = [
        makeEnemy(650, height - 186, 34, 26, 1.6, 520, 760),
        makeEnemy(1700, height - 156, 34, 26, 1.9, 1560, 1860)
    ];

    goal = { x: 2150, y: height - 290, w: 30, h: 150 };

}
