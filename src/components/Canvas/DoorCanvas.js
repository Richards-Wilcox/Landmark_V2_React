import { useEffect, useMemo, useRef, useState } from "react";
import {
    MdZoomIn,
    MdZoomOut,
    MdRefresh
} from "react-icons/md";

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

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;



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
    /* ==========================================
       ZOOM + PAN
    ========================================== */

    const viewportRef = useRef(null);
    const dragRef = useRef(null);
    const movedRef = useRef(false);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    // Latest values for the native wheel listener
    const zoomRef = useRef(zoom);
    const panRef = useRef(pan);

    zoomRef.current = zoom;
    panRef.current = pan;


    // Back at 100%: re-center
    useEffect(() => {
        if (zoom === 1) {
            setPan({ x: 0, y: 0 });
        }
    }, [zoom]);

    const clampPan = (x, y, z = zoom) => {

        const viewport = viewportRef.current;

        if (!viewport) {
            return { x, y };
        }

        const maxX = (viewport.clientWidth * (z - 1)) / 2;
        const maxY = (viewport.clientHeight * (z - 1)) / 2;

        return {
            x: Math.max(-maxX, Math.min(maxX, x)),
            y: Math.max(-maxY, Math.min(maxY, y))
        };
    };

    const handleZoomIn = () => {
        setZoom(z => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)));
    };

    const handleZoomOut = () => {
        setZoom(z => {
            const next = Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2));
            setPan(p => clampPan(p.x, p.y, next));
            return next;
        });
    };

    const handleZoomReset = () => {
        setZoom(1);
        setPan({ x: 0, y: 0 });
    };

    const handlePointerDown = (event) => {

        if (zoom <= 1) {
            return;
        }

        // Don't start a drag from the pencil / menu / zoom buttons
        if (
            event.target.closest(
                ".slim-pencil-button, .slim-options-container, .canvas-zoom-controls"
            )
        ) {
            return;
        }

        movedRef.current = false;

        dragRef.current = {
            startX: event.clientX,
            startY: event.clientY,
            panX: pan.x,
            panY: pan.y
        };

        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handlePointerMove = (event) => {

        const drag = dragRef.current;

        if (!drag) {
            return;
        }

        const dx = event.clientX - drag.startX;
        const dy = event.clientY - drag.startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            movedRef.current = true;
        }

        setPan(clampPan(drag.panX + dx, drag.panY + dy));
    };

    const handlePointerUp = (event) => {

        dragRef.current = null;

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    /* ==========================================
   MOUSE WHEEL ZOOM (zooms toward the cursor)
========================================== */

    useEffect(() => {

        const viewport = viewportRef.current;

        if (!viewport) {
            return;
        }

        const handleWheel = (event) => {

            // Let the slim menu and zoom controls behave normally
            if (
                event.target.closest(
                    ".slim-options-container, .canvas-zoom-controls"
                )
            ) {
                return;
            }

            event.preventDefault();

            const current = zoomRef.current;

            // Smooth zoom: works for both mouse wheels and trackpads
            const next = Math.min(
                MAX_ZOOM,
                Math.max(
                    MIN_ZOOM,
                    +(current * Math.exp(-event.deltaY * 0.0015)).toFixed(2)
                )
            );

            if (next === current) {
                return;
            }

            /* Keep the point under the cursor in place */

            const rect = viewport.getBoundingClientRect();

            const cursorX = event.clientX - rect.left - rect.width / 2;
            const cursorY = event.clientY - rect.top - rect.height / 2;

            const ratio = next / current;

            const p = panRef.current;

            let x = cursorX - (cursorX - p.x) * ratio;
            let y = cursorY - (cursorY - p.y) * ratio;

            /* Keep the door inside the viewport */

            const maxX = (viewport.clientWidth * (next - 1)) / 2;
            const maxY = (viewport.clientHeight * (next - 1)) / 2;

            x = Math.max(-maxX, Math.min(maxX, x));
            y = Math.max(-maxY, Math.min(maxY, y));

            setZoom(next);
            setPan({ x, y });
        };

        viewport.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            viewport.removeEventListener("wheel", handleWheel);
        };

    }, []);

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


    // Ignore the click that ends a drag
    if (movedRef.current) {
        movedRef.current = false;
        return;
    }

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
        <div
            ref={viewportRef}
            className={
                zoom > 1
                    ? "door-canvas-viewport zoomed"
                    : "door-canvas-viewport"
            }
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >

            <div
                className="door-canvas-wrapper"
                style={{
                    transform:
                        `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
                }}
            >

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

            {/* Zoom controls (not scaled) */}

            <div className="canvas-zoom-controls">

                <button
                    type="button"
                    aria-label="Zoom in"
                    disabled={zoom >= MAX_ZOOM}
                    onClick={handleZoomIn}
                >
                    <MdZoomIn />
                </button>

                <span className="canvas-zoom-value">
                    {Math.round(zoom * 100)}%
                </span>

                <button
                    type="button"
                    aria-label="Zoom out"
                    disabled={zoom <= MIN_ZOOM}
                    onClick={handleZoomOut}
                >
                    <MdZoomOut />
                </button>

                <button
                    type="button"
                    aria-label="Reset zoom"
                    disabled={zoom === 1}
                    onClick={handleZoomReset}
                >
                    <MdRefresh />
                </button>

            </div>

        </div>
    );
}

export default DoorCanvas;
