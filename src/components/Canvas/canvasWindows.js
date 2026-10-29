/* ==========================================================
   CANVAS WINDOWS
   Paints the windows on the door (original drawWindows).
   Order per window: glass -> insert -> frame -> dotted hint.
========================================================== */

import { getShadowSettings } from "./canvasDoor";

/* ==========================================
   COLOR HELPER (same luminance rule as getShadowSettings)
========================================== */

export function isDarkColor(color) {
    return getShadowSettings(color).isDark;
}

/* ==========================================
   WINDOW GLASS (original drawWindows gradient)
========================================== */

export function drawWindowGlass(ctx, x, y, width, height) {

    const gradX = x + width / 2 - height / 2;
    const gradY = y + height / 2 - width / 2;

    const gradient = ctx.createLinearGradient(
        gradX,
        gradY,
        gradX + height,
        gradY + width
    );

    gradient.addColorStop(0, "#a8d0ff");
    gradient.addColorStop(0.5, "#ffffff");
    gradient.addColorStop(1, "#a8d0ff");

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

/* ==========================================
   WINDOW FRAME (original drawWindowFrame)
========================================== */

export function drawWindowFrame(
    ctx,
    x,
    y,
    width,
    height,
    scale,
    frameColor = "#FFFFFF",
    frameInsets
) {

    ctx.save();

    if (frameInsets) {
        ctx.fillStyle = frameColor;
        ctx.fillRect(x, y, width, frameInsets.y);
        ctx.fillRect(x, y + height - frameInsets.y, width, frameInsets.y);
        ctx.fillRect(x, y + frameInsets.y, frameInsets.x, height - 2 * frameInsets.y);
        ctx.fillRect(x + width - frameInsets.x, y + frameInsets.y, frameInsets.x, height - 2 * frameInsets.y);
    }

    /* Outer outline */
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";
    ctx.strokeRect(x, y, width, height);

    const thickness = 1.33 * scale;

    /* Main frame body */
    ctx.lineWidth = thickness;
    ctx.strokeStyle = frameColor;
    ctx.strokeRect(
        x + thickness / 2,
        y + thickness / 2,
        width - thickness,
        height - thickness
    );

    /* Inner shadow (where glass meets frame) */
    ctx.strokeStyle = "rgba(0,0,0,0.2)";

    const innerThickness = thickness - 0.505 * scale;
    const shadowInsetX = frameInsets ? frameInsets.x : innerThickness;
    const shadowInsetY = frameInsets ? frameInsets.y : innerThickness;

    ctx.lineWidth = innerThickness / 2;
    ctx.strokeRect(
        x + shadowInsetX,
        y + shadowInsetY,
        width - 2 * shadowInsetX,
        height - 2 * shadowInsetY
    );

    if (frameInsets) {

        const innerLeft = x + frameInsets.x;
        const innerRight = x + width - frameInsets.x;
        const innerTop = y + frameInsets.y;
        const innerBottom = y + height - frameInsets.y;

        ctx.beginPath();
        ctx.strokeStyle = "rgba(0, 0, 0, 0.11)";
        ctx.lineWidth = 1;
        ctx.moveTo(x, y);
        ctx.lineTo(innerLeft, innerTop);
        ctx.moveTo(x + width, y);
        ctx.lineTo(innerRight, innerTop);
        ctx.moveTo(x, y + height);
        ctx.lineTo(innerLeft, innerBottom);
        ctx.moveTo(x + width, y + height);
        ctx.lineTo(innerRight, innerBottom);
        ctx.stroke();
    }

    /* Bevel */
    ctx.lineWidth = 2;

    /* Top / left highlight */
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.3)";
    ctx.moveTo(x, y + height);
    ctx.lineTo(x, y);
    ctx.lineTo(x + width, y);
    ctx.stroke();

    /* Bottom / right shadow */
    ctx.beginPath();
    ctx.strokeStyle = "rgba(0,0,0,0.4)";
    ctx.moveTo(x + width, y);
    ctx.lineTo(x + width, y + height);
    ctx.lineTo(x, y + height);
    ctx.stroke();

    ctx.restore();
}

/* ==========================================
   DOTTED HINT (original hints block)
========================================== */

export function drawWindowHint(ctx, x, y, width, height, isDark) {

    ctx.save();
    ctx.strokeStyle = isDark ? "#aaaaaa" : "#666666";
    ctx.lineWidth = 2;
    ctx.setLineDash([16, 8]);
    ctx.strokeRect(x, y, width, height);
    ctx.restore();
}

/* ==========================================
   SLIM ONE-LITE MARKER (original red triangle)
========================================== */

export function drawSlimMarker(ctx, centerX, topY) {

    const size = 10;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(centerX - size / 2, topY - size);
    ctx.lineTo(centerX + size / 2, topY - size);
    ctx.lineTo(centerX, topY);
    ctx.closePath();
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.restore();
}

/* ==========================================
   ARCH HELPER (shared by Stockton / Stockbridge)
========================================== */

function drawArchTop(ctx, x, y, width, height, framePad, muntinWidth, color, flip) {

    ctx.beginPath();
    ctx.fillStyle = color;

    const w = width - 2 * framePad;
    const h = (5 / 8) * (height - 2 * framePad - muntinWidth) / 2;
    const radius = (w * w + h * h) / (2 * h);
    const angle = Math.asin(w / radius);
    const offset = Math.PI * 3 / 2;

    ctx.arc(
        flip ? (x + framePad) : (x + width - framePad),
        y + framePad + muntinWidth / 2 + radius,
        radius,
        offset - (flip ? 0 : angle),
        offset + (flip ? angle : 0)
    );

    ctx.lineTo(x + width - framePad, y + framePad + muntinWidth / 2);
    ctx.lineTo(x + framePad, y + framePad + muntinWidth / 2);
    ctx.lineTo(x + framePad, y + framePad + muntinWidth / 2 + (flip ? 0 : h));
    ctx.closePath();
    ctx.fill();
}

/* Shadow pass + colour pass + outer border (shared by all inserts) */
function strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color) {

    ctx.closePath();

    ctx.lineWidth = muntinWidth + 1;
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();

    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.stroke();

    ctx.strokeRect(
        x + framePad,
        y + framePad,
        width - 2 * framePad,
        height - 2 * framePad
    );
}

/* ==========================================
   STOCKTON (original drawInsertStockton)
========================================== */

export function drawInsertStockton(
    ctx, x, y, width, height, scale, color,
    numVLines = 1, arched = false, flip = false
) {

    const muntinWidth = 1 * scale;
    const framePad = 0.5 * scale;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.lineCap = "square";
    ctx.beginPath();

    /* Vertical dividers */
    const spacing = (width - 2 * framePad - 2 * muntinWidth) / (numVLines + 1);

    for (let i = 0; i < numVLines; i++) {
        const vX = x + framePad + muntinWidth + spacing * (i + 1);
        ctx.moveTo(vX, y + framePad);
        ctx.lineTo(vX, y + height - framePad);
    }

    /* Horizontal divider */
    const vY = y + height / 2;
    ctx.moveTo(x + framePad, vY);
    ctx.lineTo(x + width - framePad, vY);

    strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color);

    if (arched) {
        drawArchTop(ctx, x, y, width, height, framePad, muntinWidth, color, flip);
    }

    ctx.restore();
}

/* ==========================================
   STOCKBRIDGE (original drawInsertStockbridge)
   Same as Stockton without the horizontal bar
========================================== */

export function drawInsertStockbridge(
    ctx, x, y, width, height, scale, color,
    numVLines = 1, arched = false, flip = false
) {

    const muntinWidth = 1 * scale;
    const framePad = 0.5 * scale;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.lineCap = "square";
    ctx.beginPath();

    /* Vertical dividers */
    const spacing = (width - 2 * framePad - 2 * muntinWidth) / (numVLines + 1);

    for (let i = 0; i < numVLines; i++) {
        const vX = x + framePad + muntinWidth + spacing * (i + 1);
        ctx.moveTo(vX, y + framePad);
        ctx.lineTo(vX, y + height - framePad);
    }

    strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color);

    if (arched) {
        drawArchTop(ctx, x, y, width, height, framePad, muntinWidth, color, flip);
    }

    ctx.restore();
}

/* ==========================================
   WATERTON (original drawInsertWaterton)
========================================== */

export function drawInsertWaterton(ctx, x, y, width, height, scale, color, numDiamonds = 1) {

    const muntinWidth = 1 * scale;
    const framePad = 0.5 * scale;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.lineCap = "square";

    const midY = y + height / 2;
    const diamondWidth = height - framePad * 2 - muntinWidth;

    ctx.beginPath();

    const spacing =
        (width - 2 * framePad - (2 + numDiamonds - 1) * muntinWidth) / numDiamonds;

    for (let i = 0; i < numDiamonds; i++) {

        const offsetX = x + framePad + (i + 1) * muntinWidth + i * spacing;
        const diamondCenterX = offsetX + spacing / 2;

        /* Diamond */
        ctx.moveTo(diamondCenterX - diamondWidth / 2, midY); // Left
        ctx.lineTo(diamondCenterX, midY - diamondWidth / 2); // Top
        ctx.lineTo(diamondCenterX + diamondWidth / 2, midY); // Right
        ctx.lineTo(diamondCenterX, midY + diamondWidth / 2); // Bottom
        ctx.lineTo(diamondCenterX - diamondWidth / 2, midY); // Left

        /* Divider -> diamond */
        ctx.moveTo(offsetX, midY);
        ctx.lineTo(diamondCenterX - diamondWidth / 2, midY);

        /* Diamond -> outer frame */
        ctx.moveTo(diamondCenterX + diamondWidth / 2, midY);
        ctx.lineTo(offsetX + spacing + muntinWidth / 2, midY);
    }

    /* Vertical dividers between diamonds */
    for (let i = 1; i < numDiamonds; i++) {
        const offsetX = x + framePad + (i + 1) * muntinWidth + i * spacing - muntinWidth / 2;
        ctx.moveTo(offsetX, y + framePad);
        ctx.lineTo(offsetX, y + height - framePad);
    }

    strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color);

    ctx.restore();
}

/* ==========================================
   PRAIRIE (original drawInsertPrairie)
========================================== */

export function drawInsertPrairie(ctx, x, y, width, height, scale, color) {

    const muntinWidth = 1 * scale;
    const framePad = 0.5 * scale;

    ctx.save();

    /* Distance from glass edge to the bar */
    const gridOffset = 2 * scale + framePad;

    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.beginPath();

    /* Vertical bars */
    ctx.moveTo(x + gridOffset, y + framePad);
    ctx.lineTo(x + gridOffset, y + height - framePad);
    ctx.moveTo(x + width - gridOffset, y + framePad);
    ctx.lineTo(x + width - gridOffset, y + height - framePad);

    /* Horizontal bars */
    ctx.moveTo(x + framePad, y + gridOffset);
    ctx.lineTo(x + width - framePad, y + gridOffset);
    ctx.moveTo(x + framePad, y + height - gridOffset);
    ctx.lineTo(x + width - framePad, y + height - gridOffset);

    strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color);

    ctx.restore();
}

/* ==========================================
   CASCADE (original drawInsertCascade)
========================================== */

export function drawInsertCascade(ctx, x, y, width, height, scale, color, numVLines = 1) {

    const muntinWidth = 1 * scale;
    const framePad = 0.5 * scale;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = muntinWidth;
    ctx.lineCap = "square";
    ctx.beginPath();

    /* Vertical dividers */
    const spacing = (width - 2 * framePad - 2 * muntinWidth) / (numVLines + 1);

    for (let i = 0; i < numVLines; i++) {
        const vX = x + framePad + muntinWidth + spacing * (i + 1);
        ctx.moveTo(vX, y + framePad);
        ctx.lineTo(vX, y + height - framePad);
    }

    /* Horizontal divider (full width) */
    const vY = y + height / 2;
    ctx.moveTo(x, vY);
    ctx.lineTo(x + width, vY);

    strokeInsert(ctx, x, y, width, height, framePad, muntinWidth, color);

    /* Centered arch */
    ctx.beginPath();
    ctx.fillStyle = color;

    const w = (width - 2 * framePad) / 2;
    const h = (height - 2 * framePad - 3 * muntinWidth) / 4;
    const radius = (w * w + h * h) / (2 * h);
    const angle = Math.asin(w / radius);
    const offset = Math.PI * 3 / 2;

    ctx.arc(
        x + width / 2,
        y + framePad + muntinWidth / 2 + radius,
        radius,
        offset - angle,
        offset + angle
    );

    ctx.lineTo(x + width - framePad, y + framePad + muntinWidth / 2);
    ctx.lineTo(x + framePad, y + framePad + muntinWidth / 2);
    ctx.lineTo(x + framePad, y + framePad + muntinWidth / 2 + h);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

/* ==========================================
   INSERT MAP (original drawInsertFn)
   Signature: (ctx, x, y, w, h, scale, color, index)
========================================== */

export const INSERT_DRAWERS = {

    stockton_colonial: (ctx, x, y, w, h, scale, color) =>
        drawInsertStockton(ctx, x, y, w, h, scale, color, 1, false, false),

    stockton_ranch: (ctx, x, y, w, h, scale, color) =>
        drawInsertStockton(ctx, x, y, w, h, scale, color, 4, false, false),

    waterton_colonial: (ctx, x, y, w, h, scale, color) =>
        drawInsertWaterton(ctx, x, y, w, h, scale, color, 1),

    waterton_ranch: (ctx, x, y, w, h, scale, color) =>
        drawInsertWaterton(ctx, x, y, w, h, scale, color, 2),

    cascade_colonial: (ctx, x, y, w, h, scale, color) =>
        drawInsertCascade(ctx, x, y, w, h, scale, color, 1),

    cascade_ranch: (ctx, x, y, w, h, scale, color) =>
        drawInsertCascade(ctx, x, y, w, h, scale, color, 4),

    prairie: (ctx, x, y, w, h, scale, color) =>
        drawInsertPrairie(ctx, x, y, w, h, scale, color),

    arched_stockton: (ctx, x, y, w, h, scale, color, idx) =>
        drawInsertStockton(ctx, x, y, w, h, scale, color, 4, true, idx % 2 === 1),

    arched_stockbridge: (ctx, x, y, w, h, scale, color, idx) =>
        drawInsertStockbridge(ctx, x, y, w, h, scale, color, 3, true, idx % 2 === 1),

    stockbridge: (ctx, x, y, w, h, scale, color) =>
        drawInsertStockbridge(ctx, x, y, w, h, scale, color, 3, false, false),

    arched_stockton_3: (ctx, x, y, w, h, scale, color, idx) => {
        if (idx === 0) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, true, false);
        } else if (idx === 1) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, false, false);
        } else if (idx === 2) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, true, true);
        }
    },

    arched_stockbridge_3: (ctx, x, y, w, h, scale, color, idx) => {
        if (idx === 0) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, true, false);
        } else if (idx === 1) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, false, false);
        } else if (idx === 2) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, true, true);
        }
    },

    arched_stockton_4: (ctx, x, y, w, h, scale, color, idx) => {
        if (idx === 0) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, true, false);
        } else if (idx === 1 || idx === 2) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, false, false);
        } else if (idx === 3) {
            drawInsertStockton(ctx, x, y, w, h, scale, color, 4, true, true);
        }
    },

    arched_stockbridge_4: (ctx, x, y, w, h, scale, color, idx) => {
        if (idx === 0) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, true, false);
        } else if (idx === 1 || idx === 2) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, false, false);
        } else if (idx === 3) {
            drawInsertStockbridge(ctx, x, y, w, h, scale, color, 4, true, true);
        }
    }
};

/* ==========================================
   DRAW ALL WINDOWS (original drawWindows)
========================================== */

// Glass size inside the frame (inches) – other shapes fill the frame
const GLASS_DIMENSIONS = {
    colonial: { width: 16.770, height: 11.590 },
    ranch: { width: 39.67, height: 11.63 }
};

export function drawWindows(ctx, sections, info) {

    const {
        scale,
        xpos,
        ypos,
        glassShape,
        glassInsert,
        windowPosition,
        frameColor,
        insertColor,
        doorColor,
        showHints
    } = info;

    const isSlim = glassShape.includes("slim");
    const customMode = windowPosition === "custom";
    const isDark = isDarkColor(doorColor);

    /* Slim glass never has an insert (original GLASS_INSERT node) */
    const insertKey = isSlim ? "" : (glassInsert || "");
    const drawInsert = INSERT_DRAWERS[insertKey];

    for (const section of sections) {

        const winW = section.panel_width * scale;
        const winH = section.panel_height * scale;
        const yOffset = (section.height * scale - winH) / 2;
        const winY = section.ypos * scale + ypos + yOffset;

        section.positions.forEach((pos, index) => {

            const winX = pos * scale + xpos;

            const dimensions = GLASS_DIMENSIONS[section.shape];

            const glassW = dimensions ? dimensions.width * scale : winW - 0.5 * scale;
            const glassH = dimensions ? dimensions.height * scale : winH - 0.5 * scale;

            const frameInsets = dimensions
                ? { x: (winW - glassW) / 2, y: (winH - glassH) / 2 }
                : undefined;

            const glassX = winX + (winW - glassW) / 2;
            const glassY = winY + (winH - glassH) / 2;

            const isVisible = section.enabled[index] === true;

            if (isVisible) {

                /* 1. Glass */
                drawWindowGlass(ctx, glassX, glassY, glassW, glassH);

                /* 2. Insert */
                if (typeof drawInsert === "function") {
                    drawInsert(ctx, glassX, glassY, glassW, glassH, scale, insertColor, index);
                }

                /* 3. Frame */
                drawWindowFrame(ctx, winX, winY, winW, winH, scale, frameColor, frameInsets);
            }

            /* Slim (not custom) only shows hints on visible windows */
            if (isSlim && !customMode && !isVisible) {
                return;
            }

            if (!showHints) {
                return;
            }

            /* Slim "One Lite": red marker only on the section being edited */
            if (section.slim_one) {
                if (section.selected) {
                    drawSlimMarker(ctx, winX + winW / 2, winY);
                }
                return;
            }

            drawWindowHint(ctx, winX, winY, winW, winH, isDark);
        });
    }
}
