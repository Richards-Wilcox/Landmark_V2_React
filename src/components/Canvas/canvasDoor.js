/* ==========================================================
   CANVAS DOOR
   Paints the door face – everything except the windows.

   1) Colours + texture (woodgrain / stucco)
   2) Panel shading     (original getShadowSettings, drawBeveledPanel)
   3) Door face         (section lines, raised panels, plank,
                         grooved colonial, grooved / smooth ranch)
========================================================== */

import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";


/* ==========================================================
   1) COLOURS + TEXTURE
========================================================== */

const ALL_COLORS = [
    ...availableColors,
    ...optionalColors,
    silverColor
];

/* Colour object for a colour code ("W", "K" ...) or null */
export function findColor(value) {
    return ALL_COLORS.find(color => color.value === value) || null;
}

const TEXTURE_PATH = "/HTML/products/162059085/images/";

export function getTextureImage(finish, selectedColor) {

    if (selectedColor === "X" || selectedColor === "Y") {
        return `${TEXTURE_PATH}woodgrain_dark.png`;
    }

    if (finish === "S") {
        return `${TEXTURE_PATH}stucco4.png`;
    }

    return `${TEXTURE_PATH}woodtexture_dark.png`;
}

/* Texture pattern scale (multiplied by the door scale on the canvas) */
export function getPatternScale(finish, selectedColor) {

    // Stucco
    if (finish === "S") {
        return 0.005;
    }

    // Woodgrain: Honey Cedar / Cocoa Hickory
    if (selectedColor === "X" || selectedColor === "Y") {
        return 0.05;
    }

    return 0.04;
}


/* ==========================================================
   2) PANEL SHADING
========================================================== */

/* Shadow colours for a door colour (original getShadowSettings) */
export function getShadowSettings(bgColor) {

    const ctx = document.createElement("canvas").getContext("2d");

    ctx.fillStyle = bgColor;

    const color = ctx.fillStyle;

    let r;
    let g;
    let b;

    if (color.startsWith("rgb")) {
        [r, g, b] = color.match(/\d+/g).map(Number);
    } else {
        const hex = color.replace("#", "");
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
    }

    const avg = (r + g + b) / 3;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    return {
        // black / very dark doors
        dark:
            luminance < 30
                ? "rgba(255,255,255,0.04)"
                : (avg > 220 ? "rgba(0,0,0,0.12)" : "rgba(0,0,0,0.18)"),

        fade:
            luminance < 30
                ? "rgba(255,255,255,0)"
                : "rgba(0,0,0,0)",

        isDark: luminance < 65,
        isLight: luminance > 200,
        color: bgColor
    };
}

/* Raised panel with 4 gradient edges (original drawBeveledPanel) */
export function drawBeveledPanel(ctx, x, y, width, height, inset, colors) {

    const { dark, fade } = colors;

    const innerX = x + inset;
    const innerY = y + inset;
    const innerWidth = width - inset * 2;
    const innerHeight = height - inset * 2;

    if (innerWidth <= 0 || innerHeight <= 0) {
        return;
    }

    const drawGradientEdge = (x0, y0, x1, y1, points) => {

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        gradient.addColorStop(0, dark);
        gradient.addColorStop(1, fade);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);

        for (let i = 2; i < points.length; i += 2) {
            ctx.lineTo(points[i], points[i + 1]);
        }

        ctx.closePath();
        ctx.fill();
    };

    // TOP
    drawGradientEdge(0, y, 0, innerY, [
        x, y,
        x + width, y,
        innerX + innerWidth, innerY,
        innerX, innerY
    ]);

    // LEFT
    drawGradientEdge(x, 0, innerX, 0, [
        x, y,
        innerX, innerY,
        innerX, innerY + innerHeight,
        x, y + height
    ]);

    // BOTTOM
    drawGradientEdge(0, innerY + innerHeight, 0, y + height, [
        innerX, innerY + innerHeight,
        innerX + innerWidth, innerY + innerHeight,
        x + width, y + height,
        x, y + height
    ]);

    // RIGHT
    drawGradientEdge(innerX + innerWidth, 0, x + width, 0, [
        innerX + innerWidth, innerY,
        x + width, y,
        x + width, y + height,
        innerX + innerWidth, innerY + innerHeight
    ]);
}

/* Recessed panel with optional vertical grooves */
export function drawGroovedPanel(ctx, px, py, panelWidth, panelHeight, numGrooves, colors) {

    // Inner shadow around the recess
    ctx.save();
    ctx.beginPath();
    ctx.rect(px, py, panelWidth, panelHeight);
    ctx.clip();

    ctx.shadowBlur = 8;
    ctx.shadowColor = colors.isDark
        ? "rgba(255,255,255,0.4)"
        : "rgba(0,0,0,0.7)";

    ctx.lineWidth = 4;
    ctx.strokeRect(px - 2, py - 2, panelWidth + 4, panelHeight + 4);
    ctx.restore();

    // Grooves
    const spacing = panelWidth / (numGrooves + 1);

    ctx.save();
    ctx.lineWidth = colors.isLight ? 1 : 1.2;

    for (let i = 1; i <= numGrooves; i++) {

        const lineX = px + spacing * i;

        if (colors.isLight) {
            ctx.strokeStyle = "rgba(0,0,0,0.15)";
        } else {
            ctx.strokeStyle = colors.color;
            ctx.shadowColor = "rgba(0,0,0,0.45)";
            ctx.shadowBlur = 2;
            ctx.shadowOffsetX = -1;
        }

        ctx.beginPath();
        ctx.moveTo(lineX, py);
        ctx.lineTo(lineX, py + panelHeight);
        ctx.stroke();
    }

    ctx.restore();
}


/* ==========================================================
   3) DOOR FACE
   section = { positions, panel_width, panel_height, height, ypos }
   info    = { scale, xpos, ypos, color }
========================================================== */

/* Y of the panels in a section (panel centred in the section) */
function getPanelY(section, info, panelHeight) {

    const yOffset = (section.height * info.scale - panelHeight) / 2;

    return section.ypos * info.scale + info.ypos + yOffset;
}

/* Horizontal lines between sections (not for Plank) */
export function drawSectionLines(
    ctx,
    panelStyle,
    doorX,
    doorY,
    doorWidth,
    sectionHeight,
    sectionCount
) {

    if (panelStyle === "V") {
        return;
    }

    ctx.strokeStyle = "rgba(0,0,0,0.22)";
    ctx.lineWidth = 1;

    for (let i = 1; i < sectionCount; i++) {

        const y = doorY + sectionHeight * i;

        ctx.beginPath();
        ctx.moveTo(doorX, y);
        ctx.lineTo(doorX + doorWidth, y);
        ctx.stroke();
    }
}

/* Raised Colonial / Raised Ranch */
export function drawSectionPanel(ctx, section, info) {

    const panelWidth = section.panel_width * info.scale;
    const panelHeight = section.panel_height * info.scale;
    const py = getPanelY(section, info, panelHeight);
    const colors = getShadowSettings(info.color);

    for (const px of section.positions) {
        drawBeveledPanel(
            ctx,
            px * info.scale + info.xpos,
            py,
            panelWidth,
            panelHeight,
            2 * info.scale,
            colors
        );
    }
}

/* Plank: grooves inside each section + section separators */
export function drawPlankPanels(
    ctx,
    panelStyle,
    doorX,
    doorY,
    doorWidth,
    scale,
    sectionHeights
) {

    if (panelStyle !== "V") {
        return;
    }

    // Grooves per section height (inches)
    const lineMap = {
        24: 5,
        21: 4,
        18: 3
    };

    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.55)";
    ctx.lineWidth = 1;

    let currentY = doorY;

    sectionHeights.forEach(sectionHeightInches => {

        const sectionHeightPx = sectionHeightInches * scale;
        const grooveCount = lineMap[sectionHeightInches] || 4;
        const spacing = sectionHeightPx / (grooveCount + 1);

        // Grooves INSIDE the section
        for (let p = 1; p <= grooveCount; p++) {

            const y = currentY + spacing * p;

            ctx.beginPath();
            ctx.moveTo(doorX, y);
            ctx.lineTo(doorX + doorWidth, y);
            ctx.stroke();
        }

        // Section separator
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(0,0,0,0.22)";
        ctx.moveTo(doorX, currentY + sectionHeightPx);
        ctx.lineTo(doorX + doorWidth, currentY + sectionHeightPx);
        ctx.stroke();

        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(0,0,0,0.55)";

        currentY += sectionHeightPx;
    });

    ctx.restore();
}

/* Recessed grooved Colonial */
export function drawColonialGroovedSection(ctx, section, info) {

    const panelWidth = section.panel_width * info.scale;
    const panelHeight = section.panel_height * info.scale;
    const py = getPanelY(section, info, panelHeight);
    const colors = getShadowSettings(info.color);

    for (const px of section.positions) {
        drawGroovedPanel(
            ctx,
            px * info.scale + info.xpos,
            py,
            panelWidth,
            panelHeight,
            5,
            colors
        );
    }
}

/* Recessed Ranch (grooved = false) / Recessed grooved Ranch (grooved = true) */
export function drawSmoothRanchSection(ctx, section, info, grooved = false) {

    const panelWidth = section.panel_width * info.scale;
    const panelHeight = section.panel_height * info.scale;
    const py = getPanelY(section, info, panelHeight);
    const colors = getShadowSettings(info.color);
    const numGrooves = grooved ? 13 : 0;

    for (const px of section.positions) {
        drawGroovedPanel(
            ctx,
            px * info.scale + info.xpos,
            py,
            panelWidth,
            panelHeight,
            numGrooves,
            colors
        );
    }
}

/* Recessed grooved Ranch */
export function drawRanchGroovedSection(ctx, section, info) {
    drawSmoothRanchSection(ctx, section, info, true);
}
