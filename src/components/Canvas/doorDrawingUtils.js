import {
    getShadowSettings,
    drawBeveledPanel
} from "./canvasUtils";


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

    ctx.strokeStyle =
        "rgba(0,0,0,0.22)";

    ctx.lineWidth = 1;

    for (
        let i = 1;
        i < sectionCount;
        i++
    ) {

        const y =
            doorY +
            (sectionHeight * i);

        ctx.beginPath();

        ctx.moveTo(
            doorX,
            y
        );

        ctx.lineTo(
            doorX + doorWidth,
            y
        );

        ctx.stroke();

    }

}

export function drawSectionPanel(
    ctx,
    section,
    info
) {

    const scale =
        info.scale;

    const panelWidth =
        section.panel_width *
        scale;

    const panelHeight =
        section.panel_height *
        scale;

    // make panel sit much closer to section edges
    const yOffset =
        (
            section.height * scale -
            panelHeight
        ) / 2;

    const py =
        section.ypos * scale +
        info.ypos +
        yOffset;

    const colors =
        getShadowSettings(
            info.color
        );

    for (
        const px of section.positions
    ) {

        const x =
            px * scale +
            info.xpos;

        drawBeveledPanel(
            ctx,
            x,
            py,
            panelWidth,
            panelHeight,
           2 * scale,
            colors
        );

    }

}
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

    const lineMap = {
        24: 5,
        21: 4,
        18: 3
    };

    ctx.save();

    ctx.strokeStyle =
        "rgba(0,0,0,0.55)";

    ctx.lineWidth = 1;

    let currentY =
        doorY;

    sectionHeights.forEach(
        sectionHeightInches => {

            const sectionHeightPx =
                sectionHeightInches *
                scale;

            const grooveCount =
                lineMap[
                sectionHeightInches
                ] || 4;

            const spacing =
                sectionHeightPx /
                (
                    grooveCount + 1
                );

            // draw grooves INSIDE section

            for (
                let p = 1;
                p <= grooveCount;
                p++
            ) {

                const y =
                    currentY +
                    (
                        spacing * p
                    );

                ctx.beginPath();

                ctx.moveTo(
                    doorX,
                    y
                );

                ctx.lineTo(
                    doorX + doorWidth,
                    y
                );

                ctx.stroke();

            }

            // section separator

            ctx.beginPath();

            ctx.lineWidth = 2;

            ctx.strokeStyle =
                "rgba(0,0,0,0.22)";

            ctx.moveTo(
                doorX,
                currentY + sectionHeightPx
            );

            ctx.lineTo(
                doorX + doorWidth,
                currentY + sectionHeightPx
            );

            ctx.stroke();

            ctx.lineWidth = 1;

            ctx.strokeStyle =
                "rgba(0,0,0,0.55)";

            currentY +=
                sectionHeightPx;

        }
    );

    ctx.restore();

}

export function drawColonialGroovedSection(
    ctx,
    section,
    info
) {

    const scale =
        info.scale;

    const panelWidth =
        section.panel_width * scale;

    const panelHeight =
        section.panel_height * scale;

    const yOffset =
        (
            section.height * scale -
            panelHeight
        ) / 2;

    const py =
        section.ypos * scale +
        info.ypos +
        yOffset;

    const colors =
        getShadowSettings(
            info.color
        );

    for (
        const px of section.positions
    ) {

        const x =
            px * scale +
            info.xpos;

        drawGroovedPanel(
            ctx,
            x,
            py,
            panelWidth,
            panelHeight,
            5,
            colors
        );

    }

}

export function drawRanchGroovedSection(
    ctx,
    section,
    info
) {

    drawSmoothRanchSection(
        ctx,
        section,
        info,
        true
    );

}
export function drawSmoothRanchSection(
    ctx,
    section,
    info,
    grooved = false
) {

    const scale =
        info.scale;

    const panelWidth =
        section.panel_width * scale;

    const panelHeight =
        section.panel_height * scale;

    const yOffset =
        (
            section.height * scale -
            panelHeight
        ) / 2;

    const py =
        section.ypos * scale +
        info.ypos +
        yOffset;

    const colors =
        getShadowSettings(
            info.color
        );

    const numGrooves =
        grooved ? 13 : 0;

    for (
        const px of section.positions
    ) {

        const x =
            px * scale +
            info.xpos;

        drawGroovedPanel(
            ctx,
            x,
            py,
            panelWidth,
            panelHeight,
            numGrooves,
            colors
        );

    }

}

export function drawGroovedPanel(
    ctx,
    px,
    py,
    panelWidth,
    panelHeight,
    numGrooves,
    colors
) {

    ctx.save();

    ctx.beginPath();

    ctx.rect(
        px,
        py,
        panelWidth,
        panelHeight
    );

    ctx.clip();

    ctx.shadowBlur = 8;

    ctx.shadowColor =
        colors.isDark
            ? "rgba(255,255,255,0.4)"
            : "rgba(0,0,0,0.7)";

    ctx.lineWidth = 4;

    ctx.strokeRect(
        px - 2,
        py - 2,
        panelWidth + 4,
        panelHeight + 4
    );

    ctx.restore();

    const spacing =
        panelWidth /
        (numGrooves + 1);

    ctx.save();

    ctx.lineWidth =
        colors.isLight
            ? 1
            : 1.2;

    for (
        let i = 1;
        i <= numGrooves;
        i++
    ) {

        const lineX =
            px +
            (spacing * i);

        if (colors.isLight) {

            ctx.strokeStyle =
                "rgba(0,0,0,0.15)";

        } else {

            ctx.strokeStyle =
                colors.color;

            ctx.shadowColor =
                "rgba(0,0,0,0.45)";

            ctx.shadowBlur = 2;

            ctx.shadowOffsetX = -1;

        }

        ctx.beginPath();

        ctx.moveTo(
            lineX,
            py
        );

        ctx.lineTo(
            lineX,
            py + panelHeight
        );

        ctx.stroke();

    }

    ctx.restore();

}