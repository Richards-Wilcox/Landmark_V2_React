// /* ==========================================
//    SHADOW SETTINGS
// ========================================== */

// export function getShadowSettings(bgColor) {

//     const ctx =
//         document.createElement("canvas")
//             .getContext("2d");

//     ctx.fillStyle = bgColor;

//     const color =
//         ctx.fillStyle;

//     let r;
//     let g;
//     let b;

//     if (color.startsWith("rgb")) {

//         [r, g, b] =
//             color
//                 .match(/\d+/g)
//                 .map(Number);

//     } else {

//         const hex =
//             color.replace("#", "");

//         r =
//             parseInt(
//                 hex.slice(0, 2),
//                 16
//             );

//         g =
//             parseInt(
//                 hex.slice(2, 4),
//                 16
//             );

//         b =
//             parseInt(
//                 hex.slice(4, 6),
//                 16
//             );

//     }

//     const avg =
//         (r + g + b) / 3;

//     const luminance =
//         (
//             0.299 * r +
//             0.587 * g +
//             0.114 * b
//         );

//     return {

//         dark:

//             avg < 40

//                 ? "rgba(255,255,255,0.12)"

//                 : (

//                     avg > 220

//                         ? "rgba(0,0,0,0.12)"
//                         : "rgba(0,0,0,0.18)"


//                 ),

//         fade:

//             avg < 40

//                 ? "rgba(255,255,255,0)"

//                 : "rgba(0,0,0,0)",

//         isDark:
//             luminance < 65,

//         isLight:
//             luminance > 200,

//         color: bgColor

//     };

// }

// /* ==========================================
//    BEVELED PANEL
// ========================================== */

// export function drawBeveledPanel(
//     ctx,
//     x,
//     y,
//     width,
//     height,
//     inset,
//     colors
// ) {

//     const {
//         dark,
//         fade
//     } = colors;

//     const innerX =
//         x + inset;

//     const innerY =
//         y + inset;

//     const innerWidth =
//         width - (inset * 2);

//     const innerHeight =
//         height - (inset * 2);

//     if (
//         innerWidth <= 0 ||
//         innerHeight <= 0
//     ) {
//         return;
//     }

//     const drawGradientEdge = (
//         x0,
//         y0,
//         x1,
//         y1,
//         points
//     ) => {

//         const gradient =
//             ctx.createLinearGradient(
//                 x0,
//                 y0,
//                 x1,
//                 y1
//             );

//         gradient.addColorStop(
//             0,
//             dark
//         );

//         gradient.addColorStop(
//             1,
//             fade
//         );


//         ctx.fillStyle =
//             gradient;

//         ctx.beginPath();

//         ctx.moveTo(
//             points[0],
//             points[1]
//         );

//         for (
//             let i = 2;
//             i < points.length;
//             i += 2
//         ) {

//             ctx.lineTo(
//                 points[i],
//                 points[i + 1]
//             );

//         }

//         ctx.closePath();

//         ctx.fill();

//     };

//     // TOP

//     drawGradientEdge(

//         0,
//         y,

//         0,
//         innerY,

//         [
//             x,
//             y,

//             x + width,
//             y,

//             innerX + innerWidth,
//             innerY,

//             innerX,
//             innerY
//         ]

//     );

//     // LEFT

//     drawGradientEdge(

//         x,
//         0,

//         innerX,
//         0,

//         [
//             x,
//             y,

//             innerX,
//             innerY,

//             innerX,
//             innerY + innerHeight,

//             x,
//             y + height
//         ]

//     );

//     // BOTTOM

//     drawGradientEdge(

//         0,
//         innerY + innerHeight,

//         0,
//         y + height,

//         [
//             innerX,
//             innerY + innerHeight,

//             innerX + innerWidth,
//             innerY + innerHeight,

//             x + width,
//             y + height,

//             x,
//             y + height
//         ]

//     );

//     // RIGHT

//     drawGradientEdge(

//         innerX + innerWidth,
//         0,

//         x + width,
//         0,

//         [
//             innerX + innerWidth,
//             innerY,

//             x + width,
//             y,

//             x + width,
//             y + height,

//             innerX + innerWidth,
//             innerY + innerHeight
//         ]

//     );

// }






export function getShadowSettings(bgColor) {

    const ctx =
        document.createElement("canvas")
            .getContext("2d");

    ctx.fillStyle = bgColor;

    const color =
        ctx.fillStyle;

    let r;
    let g;
    let b;

    if (color.startsWith("rgb")) {

        [r, g, b] =
            color
                .match(/\d+/g)
                .map(Number);

    } else {

        const hex =
            color.replace("#", "");

        r =
            parseInt(
                hex.slice(0, 2),
                16
            );

        g =
            parseInt(
                hex.slice(2, 4),
                16
            );

        b =
            parseInt(
                hex.slice(4, 6),
                16
            );

    }

    const avg =
        (r + g + b) / 3;

    const luminance =
        (
            0.299 * r +
            0.587 * g +
            0.114 * b
        );

    return {

        // black / very dark doors
        dark:

            luminance < 30

                ? "rgba(255,255,255,0.04)"

                : (

                    avg > 220

                        ? "rgba(0,0,0,0.12)"

                        : "rgba(0,0,0,0.18)"

                ),

        fade:

            luminance < 30

                ? "rgba(255,255,255,0)"

                : "rgba(0,0,0,0)",

        isDark:
            luminance < 65,

        isLight:
            luminance > 200,

        color: bgColor

    };

}
// /* ==========================================
//    BEVELED PANEL
// ========================================== */

export function drawBeveledPanel(
    ctx,
    x,
    y,
    width,
    height,
    inset,
    colors
) {

    const {
        dark,
        fade
    } = colors;

    const innerX =
        x + inset;

    const innerY =
        y + inset;

    const innerWidth =
        width - (inset * 2);

    const innerHeight =
        height - (inset * 2);

    if (
        innerWidth <= 0 ||
        innerHeight <= 0
    ) {
        return;
    }

    const drawGradientEdge = (
        x0,
        y0,
        x1,
        y1,
        points
    ) => {

        const gradient =
            ctx.createLinearGradient(
                x0,
                y0,
                x1,
                y1
            );

        gradient.addColorStop(
            0,
            dark
        );

        gradient.addColorStop(
            1,
            fade
        );

        ctx.fillStyle =
            gradient;

        ctx.beginPath();

        ctx.moveTo(
            points[0],
            points[1]
        );

        for (
            let i = 2;
            i < points.length;
            i += 2
        ) {

            ctx.lineTo(
                points[i],
                points[i + 1]
            );

        }

        ctx.closePath();

        ctx.fill();

    };

    // TOP

    drawGradientEdge(

        0,
        y,

        0,
        innerY,

        [
            x,
            y,

            x + width,
            y,

            innerX + innerWidth,
            innerY,

            innerX,
            innerY
        ]

    );

    // LEFT

    drawGradientEdge(

        x,
        0,

        innerX,
        0,

        [
            x,
            y,

            innerX,
            innerY,

            innerX,
            innerY + innerHeight,

            x,
            y + height
        ]

    );

    // BOTTOM

    drawGradientEdge(

        0,
        innerY + innerHeight,

        0,
        y + height,

        [
            innerX,
            innerY + innerHeight,

            innerX + innerWidth,
            innerY + innerHeight,

            x + width,
            y + height,

            x,
            y + height
        ]

    );

    // RIGHT

    drawGradientEdge(

        innerX + innerWidth,
        0,

        x + width,
        0,

        [
            innerX + innerWidth,
            innerY,

            x + width,
            y,

            x + width,
            y + height,

            innerX + innerWidth,
            innerY + innerHeight
        ]

    );

}