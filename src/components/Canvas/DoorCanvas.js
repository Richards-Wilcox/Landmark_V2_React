import { useEffect, useMemo, useRef } from "react";

import {
    availableColors,
    optionalColors,
    silverColor
} from "../../Data/colors";

import {
    getPanelDimensions,
    getPanelPositions,
    getSectionHeights
} from "./canvasGeometry";

import {
    drawSectionLines,
    drawSectionPanel,
    drawPlankPanels,
    drawColonialGroovedSection,
    drawRanchGroovedSection,
    drawSmoothRanchSection
} from "./doorDrawingUtils";

import {
    getTextureImage
} from "./canvasTextureUtils";

import {
    drawWindows
} from "./canvasWindows";

import {
    buildWindowSections,
    getFacePanelType,
    isSpecialFace,
    getHintsVisible,
    getCanSelectWindows
} from "./canvasWindowLayout";

import SlimSectionEditor from "./SlimSectionEditor";

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 700;

function DoorCanvas({
    doorModel,
    panelStyle,

    width,
    height,

    numOfSections,

    selectedColor,
    finish,

    frameColor,
    insertColor,

    glassShape,
    glassInsert,

    windowPosition,
    activeTab,

    customWindows,
    onWindowsChange,

    slimSections,
    selectedSlimSection,
    onSelectSlimSection,
    onSlimSectionChange
}) {

    const canvasRef = useRef(null);

    const shape = glassShape || "";

    /* ==========================================
       SHARED LAYOUT (used by drawing AND clicking)
    ========================================== */

    const layout = useMemo(() => {

        const maxWidth = 700;
        const maxHeight = 500;

        const scale = Math.min(
            maxWidth / width,
            maxHeight / height
        );

        const doorWidth = width * scale;
        const doorHeight = height * scale;

        const doorX = (CANVAS_WIDTH - doorWidth) / 2;
        const doorY = (CANVAS_HEIGHT - doorHeight) / 2;

        const sectionCount = Number(numOfSections) || 4;

        const sectionHeights = getSectionHeights(
            height,
            sectionCount
        );

        const windowSections = buildWindowSections({
            panelStyle,
            glassShape: shape,
            width,
            height,
            sectionCount,
            sectionHeights,
            windowPosition,
            customWindows,
            slimSections,
            selectedSlimSection
        });

        return {
            scale,
            doorWidth,
            doorHeight,
            doorX,
            doorY,
            sectionCount,
            sectionHeights,
            windowSections
        };

    }, [
        width,
        height,
        numOfSections,
        panelStyle,
        shape,
        windowPosition,
        customWindows,
        slimSections,
        selectedSlimSection
    ]);

    const hintsVisible = getHintsVisible({
        activeTab,
        panelStyle,
        glassShape: shape,
        windowPosition
    });

    const canSelectWindows = getCanSelectWindows({
        activeTab,
        panelStyle,
        glassShape: shape,
        windowPosition
    });

    const showSlimEditor =
        activeTab === "glazing" &&
        shape.includes("slim") &&
        windowPosition === "custom";

    /* ==========================================
       DRAW
    ========================================== */

    useEffect(() => {

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext("2d");

        if (!ctx) {
            return;
        }

        const {
            scale,
            doorWidth,
            doorHeight,
            doorX,
            doorY,
            sectionCount,
            sectionHeights,
            windowSections
        } = layout;

        const sectionHeight = doorHeight / sectionCount;

        /* Colors */

        const allColors = [
            ...availableColors,
            ...optionalColors,
            silverColor
        ];

        const doorColor =
            allColors.find(
                color => color.value === selectedColor
            )?.hex || "#d9d9d9";

        const frameHex =
            allColors.find(
                color => color.value === frameColor
            )?.hex || doorColor;

        const insertHex =
            allColors.find(
                color => color.value === insertColor
            )?.hex || doorColor;

        const texturePath = getTextureImage(
            finish,
            selectedColor
        );

        const isSpecial = isSpecialFace(
            panelStyle,
            shape
        );

        const drawDoor = (pattern) => {

            ctx.clearRect(
                0,
                0,
                canvas.width,
                canvas.height
            );

            /* Door Background */

            ctx.fillStyle = doorColor;

            ctx.fillRect(
                doorX,
                doorY,
                doorWidth,
                doorHeight
            );

            /* Texture (drawn BEFORE panels and windows) */

            if (pattern) {

                ctx.save();

                ctx.globalAlpha =
                    (
                        selectedColor === "K" ||
                        selectedColor === "V" ||
                        selectedColor === "F"
                    )
                        ? 0.55
                        : 0.30;

                ctx.globalCompositeOperation = "multiply";

                ctx.fillStyle = pattern;

                ctx.fillRect(
                    doorX,
                    doorY,
                    doorWidth,
                    doorHeight
                );

                ctx.restore();
            }

            /* Selected section highlight (original: hints && section.selected) */

            if (hintsVisible) {

                windowSections.forEach(section => {

                    if (!section.selected) {
                        return;
                    }

                    ctx.save();

                    ctx.fillStyle = "rgba(255, 0, 0, 0.25)";

                    ctx.fillRect(
                        doorX,
                        doorY + section.ypos * scale,
                        doorWidth,
                        section.height * scale
                    );

                    ctx.restore();
                });
            }


            /* Door Border */

            ctx.strokeStyle = "rgba(0,0,0,0.35)";
            ctx.lineWidth = 1;

            ctx.strokeRect(
                doorX,
                doorY,
                doorWidth,
                doorHeight
            );

            /* Section Lines */

            drawSectionLines(
                ctx,
                panelStyle,
                doorX,
                doorY,
                doorWidth,
                sectionHeight,
                sectionCount
            );

            /* Plank */

            drawPlankPanels(
                ctx,
                panelStyle,
                doorX,
                doorY,
                doorWidth,
                scale,
                sectionHeights
            );

            /* Colonial / Ranch / Grooved */

            if (
                ["C", "R", "T", "B", "S"].includes(panelStyle)
            ) {

                const panelType =
                    getFacePanelType(panelStyle);

                const dimensions =
                    getPanelDimensions(panelType);

                const defaultPositions =
                    getPanelPositions({
                        panelType,
                        doorWidth: width,
                        face: panelStyle,
                        glassShape: ""
                    });

                for (
                    let row = 0;
                    row < sectionCount;
                    row++
                ) {

                    /* Special face: panel layout follows window layout */

                    const override = isSpecial
                        ? windowSections[row]
                        : null;

                    const section = {

                        positions:
                            override?.positions ||
                            defaultPositions,

                        panel_width:
                            override?.panel_width ||
                            dimensions.panelWidth,

                        panel_height:
                            override?.panel_height ||
                            dimensions.panelHeight,

                        height:
                            sectionHeights[row] ||
                            (height / sectionCount),

                        ypos:
                            sectionHeights
                                .slice(0, row)
                                .reduce(
                                    (total, value) =>
                                        total + value,
                                    0
                                )
                    };

                    const info = {
                        scale,
                        xpos: doorX,
                        ypos: doorY,
                        color: doorColor
                    };

                    if (panelStyle === "B") {

                        drawColonialGroovedSection(
                            ctx,
                            section,
                            info
                        );

                    }
                    else if (panelStyle === "S") {

                        drawRanchGroovedSection(
                            ctx,
                            section,
                            info
                        );

                    }
                    else if (panelStyle === "T") {

                        drawSmoothRanchSection(
                            ctx,
                            section,
                            info,
                            false
                        );

                    }
                    else {

                        drawSectionPanel(
                            ctx,
                            section,
                            info
                        );

                    }
                }
            }

            /* Windows + Inserts + Dotted Hints (drawn LAST) */

            if (shape) {

                drawWindows(
                    ctx,
                    windowSections,
                    {
                        scale,
                        xpos: doorX,
                        ypos: doorY,
                        glassShape: shape,
                        glassInsert,
                        windowPosition,
                        frameColor: frameHex,
                        insertColor: insertHex,
                        doorColor,
                        showHints: hintsVisible
                    }
                );
            }
        };

        /* Texture loading */

        if (!texturePath) {

            drawDoor(null);

            return;
        }

        const texture = new Image();

        texture.crossOrigin = "anonymous";

        texture.onload = () => {

            const pattern = ctx.createPattern(
                texture,
                "repeat"
            );

            if (!pattern) {

                drawDoor(null);

                return;
            }

            const matrix = new DOMMatrix();

            let textureScale = 0.04;

            // Woodgrain

            if (
                selectedColor === "X" ||
                selectedColor === "Y"
            ) {
                textureScale = 0.05;
            }

            // Stucco

            if (finish === "S") {
                textureScale = 0.005;
            }

            matrix.scaleSelf(
                textureScale * scale,
                textureScale * scale
            );

            pattern.setTransform(matrix);

            drawDoor(pattern);
        };

        texture.onerror = () => {

            drawDoor(null);

        };

        texture.src = texturePath;

    }, [
        layout,
        width,
        height,
        panelStyle,

        selectedColor,
        finish,

        frameColor,
        insertColor,

        shape,
        glassInsert,

        windowPosition,
        hintsVisible
    ]);

    /* ==========================================
       CLICK TO SELECT WINDOW (original click.canvasFix)
    ========================================== */

    const handleCanvasClick = (event) => {

        if (!canSelectWindows || !onWindowsChange) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        /* Convert screen position -> canvas position */

        const rect = canvas.getBoundingClientRect();

        const mouseX =
            (event.clientX - rect.left) *
            (canvas.width / rect.width);

        const mouseY =
            (event.clientY - rect.top) *
            (canvas.height / rect.height);

        const {
            scale,
            doorX,
            doorY,
            windowSections
        } = layout;

        for (
            let sIndex = 0;
            sIndex < windowSections.length;
            sIndex++
        ) {

            const section = windowSections[sIndex];

            const winW = section.panel_width * scale;
            const winH = section.panel_height * scale;

            const yOffset =
                (section.height * scale - winH) / 2;

            const winY =
                section.ypos * scale + doorY + yOffset;

            for (
                let i = 0;
                i < section.positions.length;
                i++
            ) {

                const winX =
                    section.positions[i] * scale + doorX;

                const hit =
                    mouseX >= winX &&
                    mouseX <= winX + winW &&
                    mouseY >= winY &&
                    mouseY <= winY + winH;

                if (!hit) {
                    continue;
                }

                /* Copy current state of every section */

                const nextEnabled = windowSections.map(
                    s => [...s.enabled]
                );

                if (section.slim_one) {

                    /* Slim "One Lite": only ONE window allowed */

                    nextEnabled[sIndex].fill(false);
                    nextEnabled[sIndex][i] = true;

                } else {

                    /* Normal: toggle */

                    nextEnabled[sIndex][i] =
                        !nextEnabled[sIndex][i];
                }

                onWindowsChange(nextEnabled);

                return;
            }
        }
    };

    /* Cursor (original CANVAS_CURSOR node) */

    const isLocked =
        shape &&
        (
            shape.includes("grand") ||
            isSpecialFace(panelStyle, shape)
        );

    const cursor =
        activeTab === "glazing" && isLocked
            ? "not-allowed"
            : canSelectWindows
                ? "pointer"
                : "default";

    return (
        <div className="door-canvas-wrapper">

            <canvas
                ref={canvasRef}
                id="CONFIG_CANVAS"
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                style={{ cursor }}
                onClick={handleCanvasClick}
            />

            {showSlimEditor && (
                <SlimSectionEditor
                    sections={layout.windowSections}

                    scale={layout.scale}
                    doorX={layout.doorX}
                    doorY={layout.doorY}
                    doorWidth={layout.doorWidth}
                    doorHeight={layout.doorHeight}

                    canvasWidth={CANVAS_WIDTH}
                    canvasHeight={CANVAS_HEIGHT}

                    selectedSection={selectedSlimSection}
                    onSelectSection={onSelectSlimSection}
                    onSectionChange={onSlimSectionChange}
                />
            )}

        </div>
    );
}

export default DoorCanvas;
