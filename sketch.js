let player;
let platforms = [];
let camX = 0;
let coins = [];
let enemies = [];
let score = 0;
let gameState = "playing";
let messageTimer = 0;
let illusionRoom;
let illusionKeyTaken = false;
let endDoors;

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
        { x: 1960, y: height - 260, w: 520, h: 26, depth: 1 }
    ];

    illusionRoom = {
        x: 1120,
        w: 520,
        floorY: height - 140,

        realDoor: { x: 1510, y: height - 380, w: 70, h: 120 },
        fakeDoor: { x: 1360, y: height - 410, w: 110, h: 150 },
        occluder: { x: 1250, y: height - 360, w: 140, h: 260 },
        key: { x: 1295, y: height - 320, r: 12 }
    };

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

    endDoors = {
        realDoor: { x: 2150, y: height - 380, w: 70, h: 120 },
        fakeDoor: { x: 2300, y: height - 410, w: 110, h: 150 }
    };

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

    drawIllusionRoom();
    drawIllusionKey();

    drawCoins();
    updateEnemies();
    drawEnemies();
    drawEndDoors();

    updatePlayer();
    checkEndDoorWin();
    checkFakeDoorTrap();

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

function drawIllusionRoom() {
    if (!illusionRoom) return;

    const roomLeft = illusionRoom.x;
    const roomRight = illusionRoom.x + illusionRoom.w;

    if (player.x < roomLeft - 600 || player.x > roomRight + 600) return;

    noStroke();
    fill(30, 30, 45, 80);
    rect(roomLeft, 0, illusionRoom.w, height);

    for (let i = 0; i < 14; i++) {
        const t = i / 13;
        const y = lerp(illusionRoom.floorY - 10, illusionRoom.floorY - 220, t);
        const inset = 20 + t * 140;
        stroke(255, 255, 255, 18);
        line(roomLeft + inset, y, roomRight - inset, y);
    }
    noStroke();

    const parallaxShift = (camX * 0.10);
    const o = illusionRoom.occluder;

    fill(10, 10, 14, 220);
    rect(o.x + parallaxShift, o.y, o.w, o.h, 10);

    fill(255, 255, 255, 35);
    rect(o.x + parallaxShift + o.w - 6, o.y + 10, 4, o.h - 20, 6);

    fill(255, 255, 255, 160);
    textSize(16);
    textAlign(LEFT, BASELINE);
    text("Find the key (it reveals as you move)", roomLeft + 20, height - 320);

}

function drawKeyVisual(x, y, s = 1) {
    push();
    translate(x, y);
    scale(s);

    noStroke();
    fill(0, 0, 0, 55);
    ellipse(4, 10, 34, 10);

    const gold = color(255, 215, 120, 240);
    const goldDark = color(210, 160, 70, 240);
    const shine = color(255, 255, 255, 140);

    fill(gold);
    ellipse(0, 0, 18, 18);
    fill(25, 25, 30, 140);
    ellipse(0, 0, 8, 8);

    fill(gold);
    rect(6, -3, 22, 6, 3);

    fill(goldDark);
    rect(22, 2, 6, 6, 2);
    rect(28, 2, 5, 4, 2);

    fill(shine);
    ellipse(-3, -3, 6, 6);
    rect(8, -2, 10, 2, 2);

    pop();
}

function drawIllusionKey() {
    if (!illusionRoom || illusionKeyTaken) return;

    const k = illusionRoom.key;
    const o = illusionRoom.occluder;

    const keyX = k.x;

    const parallaxShift = camX * 0.18;
    const occluderLeft = o.x + parallaxShift;
    const occluderRight = occluderLeft + o.w;

    const keyHidden = (keyX >= occluderLeft && keyX <= occluderRight);

    if (!keyHidden) {
        drawKeyVisual(keyX, k.y, 1.0);
    }

    if (rectCircleHit(player.x, player.y, player.w, player.h, keyX, k.y, 16)) {
        illusionKeyTaken = true;
    }
}



function drawDoorVisual(x, y, w, h, isFake) {
    fill(0, 0, 0, 70);
    rect(x + 8, y + 10, w, h, 10);

    fill(isFake ? 140 : 110, isFake ? 190 : 160, 255, 230);
    rect(x, y, w, h, 10);

    fill(40, 40, 60, 120);
    rect(x + 8, y + 10, w - 16, h - 20, 8);

    fill(255, 230, 140, 220);
    ellipse(x + w * 0.75, y + h * 0.55, 10, 10);

    fill(255, 255, 255, 150);
    textSize(12);
    textAlign(CENTER, CENTER);
    text(isFake ? "FAKE" : "REAL", x + w / 2, y + h + 14);
}

function drawEndDoors() {
    if (!endDoors) return;

    drawDoorVisual(endDoors.fakeDoor.x, endDoors.fakeDoor.y, endDoors.fakeDoor.w, endDoors.fakeDoor.h, true);
    drawDoorVisual(endDoors.realDoor.x, endDoors.realDoor.y, endDoors.realDoor.w, endDoors.realDoor.h, false);

    fill(255, 255, 255, 140);
    textSize(14);
    textAlign(LEFT, BASELINE);
    text("Exit: choose wisely", endDoors.realDoor.x - 40, endDoors.realDoor.y - 14);
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
    }

    if (player.y > height + 400 && gameState === "playing") {
        gameState = "dead";
        messageTimer = 120;
    }
    jumpQueued = false;
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

    illusionKeyTaken = false;
}

function resetPlayer() {
    resetLevel();
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

function checkEndDoorWin() {
    if (gameState !== "playing") return;
    if (!illusionKeyTaken) return;

    if (!endDoors) return;

    const d = endDoors.realDoor;
    if (rectRectHit(player.x, player.y, player.w, player.h, d.x, d.y, d.w, d.h)) {
        gameState = "won";
        messageTimer = 120;
    }
}

function checkFakeDoorTrap() {
    if (gameState !== "playing") return;
    if (!endDoors) return;

    const f = endDoors.fakeDoor;
    if (rectRectHit(player.x, player.y, player.w, player.h, f.x, f.y, f.w, f.h)) {
        gameState = "dead";
        messageTimer = 120;
    }
}

function keyPressed() {
    if (keyCode === 32) jumpQueued = true;
}

function drawHUD() {
    fill(255, 255, 255, 175);
    textSize(14);
    text("Arrows: move | Space: jump", 16, 44);
    text(`Score: ${score}`, 16, 66);
    text(`Key: ${illusionKeyTaken ? "✓" : "—"}`, 16, 88);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    platforms[0].y = height - 140;
    platforms[1].y = height - 220;
    platforms[2].y = height - 300;
    platforms[3].y = height - 190;
    platforms[4].y = height - 260;
    platforms[4].w = 520;

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

    illusionRoom = {
        x: 1120,
        w: 520,
        floorY: height - 140,
        realDoor: { x: 1510, y: height - 380, w: 70, h: 120 },
        fakeDoor: { x: 1360, y: height - 410, w: 110, h: 150 },
        occluder: { x: 1250, y: height - 360, w: 140, h: 260 },
        key: { x: 1295, y: height - 320, r: 12 }
    };


    endDoors = {
        realDoor: { x: 2150, y: height - 380, w: 70, h: 120 },
        fakeDoor: { x: 2300, y: height - 410, w: 110, h: 150 }
    };

}
