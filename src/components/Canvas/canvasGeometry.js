import panelConfigurations
    from "../../Data/panelConfigurations";



/* ==========================================
   PANEL CONFIG HELPERS
========================================== */

export function getPanelConfigurationKey(
    panelType
) {

    const windemere = [
        "colonial_grooved",
        "smooth_ranch",
        "ranch_grooved"
    ];

    if (
        windemere.includes(panelType)
    ) {
        return "windemere";
    }

    return panelType;

}

/* ==========================================
   SECTION RULES
========================================== */

export function getRule(
    panelType,
    doorWidth
) {

    const configKey =
        getPanelConfigurationKey(
            panelType
        );

    const rules =
        panelConfigurations[
            configKey
        ]?.sectionRules || [];

    return rules.find(rule =>
        doorWidth >= rule.sectionWidth.min &&
        doorWidth <= rule.sectionWidth.max
    );

}

/* ==========================================
   PANEL POSITIONS
========================================== */

export function getPanelPositions({
    panelType,
    doorWidth,

    face,
    glassShape,

    selectedPanels = 0,
    selectedWindows = 0,

    special = false
}) {

    const rule =
        getRule(
            panelType,
            doorWidth
        );

    if (!rule) {
        return [];
    }

    let panelQty =
        rule.qtyOfPanels;

    let muttSpacing =
        rule.muttSpacing;

    // Number Of Windows
    if (

        face === "F" &&
        glassShape === "colonial" &&
        rule.special &&
        selectedWindows ===
        rule.special.qtyOfPanels

    ) {

        panelQty =
            rule.special.qtyOfPanels;

        muttSpacing =
            rule.special.muttSpacing;

    }

    // Number Of Panels
    else if (

        face === "C" &&
        rule.special &&
        selectedPanels ===
        rule.special.qtyOfPanels

    ) {

        panelQty =
            rule.special.qtyOfPanels;

        muttSpacing =
            rule.special.muttSpacing;

    }

    // Legacy special mode
    else if (
        special &&
        rule.special
    ) {

        panelQty =
            rule.special.qtyOfPanels;

        muttSpacing =
            rule.special.muttSpacing;

    }

    const panelWidth =
        panelConfigurations[
            getPanelConfigurationKey(
                panelType
            )
        ].panelWidth;

    const startX =

        (

            doorWidth -

            (
                panelQty * panelWidth +
                (
                    panelQty - 1
                ) * muttSpacing
            )

        ) / 2;

    let positions = [];

    for (
        let i = 0;
        i < panelQty;
        i++
    ) {

        positions.push(

            startX +
            i *
            (
                panelWidth +
                muttSpacing
            )

        );

    }

    if (
        panelType ===
        "colonial_grooved"
    ) {

        const offset =

            panelWidth -

            panelConfigurations
                .colonial
                .panelWidth;

        positions =
            positions.flatMap(pos => [
                pos,
                pos + offset
            ]);

    }

    return positions;

}

/* ==========================================
   SECTION HEIGHTS
========================================== */

export function getSectionHeights(
    doorHeight,
    numSections
) {

    const averageHeight =
        doorHeight / numSections;

    if (
        averageHeight < 18 ||
        averageHeight > 24
    ) {

        return [];

    }

    const section1 =
        Math.floor(
            averageHeight / 3
        ) * 3;

    const section2 =
        Math.ceil(
            averageHeight / 3
        ) * 3;

    const diff =
        averageHeight -
        section1;

    const percent =
        diff / 3;

    const numSection1 =
        Math.round(
            (
                1 - percent
            ) * numSections
        );

    const numSection2 =
        numSections -
        numSection1;

    const stack = [

        ...Array(numSection1)
            .fill(section1),

        ...Array(numSection2)
            .fill(section2)

    ];

    const heights =
        Array(numSections)
            .fill(0);

    let offset = 0;
    let top = false;

    heights[offset] =
        stack.pop();

    heights[
        numSections -
        offset -
        1
    ] = stack.pop();

    offset++;

    while (
        stack.length > 0
    ) {

        if (top) {

            heights[offset] =
                stack.pop();

            offset++;

        }

        else {

            heights[
                numSections -
                offset -
                1
            ] = stack.pop();

        }

        top = !top;

    }

    return heights;

}

/* ==========================================
   MIXED PANEL LAYOUT
========================================== */

export function getMixedPanelLayout({
    doorWidth,
    pattern
}) {

    if (!pattern || !pattern.length) {
        return [];
    }

    const mixed =
        panelConfigurations.mixed;

    const rule =
        getRule(
            "mixed",
            doorWidth
        );

    if (!mixed || !rule) {
        return [];
    }

    const spacing =
        rule.muttSpacing ?? 0;

    const panels = pattern.map(style => {

        const colonial =
            style === "C";

        return {

            style,

            width:
                colonial
                    ? mixed.panelWidthCol
                    : mixed.panelWidthRnc,

            height:
                colonial
                    ? mixed.panelHeightCol
                    : mixed.panelHeightRnc

        };

    });

    const colonialPositions =
        getPanelPositions({

            panelType: "colonial",

            doorWidth,

            face: "C"

        });

    const endStile =
        Math.max(
            0,
            colonialPositions[0] ?? 0
        );

    const usableWidth =
        Math.max(
            0,
            doorWidth -
            (2 * endStile)
        );

    const rawWidth =

        panels.reduce(
            (sum, panel) =>
                sum + panel.width,
            0
        ) +

        spacing *
        (panels.length - 1);

    const fitScale =
        rawWidth > 0
            ? usableWidth / rawWidth
            : 1;

    const fittedSpacing =
        spacing * fitScale;

    panels.forEach(panel => {

        panel.width *= fitScale;

    });

    const totalWidth =

        panels.reduce(
            (sum, panel) =>
                sum + panel.width,
            0
        ) +

        fittedSpacing *
        (panels.length - 1);

    let x =

        endStile +

        (
            usableWidth -
            totalWidth
        ) / 2;

    return panels.map(panel => {

        const result = {
            ...panel,
            x
        };

        x +=
            panel.width +
            fittedSpacing;

        return result;

    });

}

export function slimWindowLocations(
    widthIn,
    windowIn,
    numWindows,
    fixedOffsetIn
) {

    const offsetFixed =
        fixedOffsetIn;

    const spacingFixed =

        (
            widthIn -
            (2 * offsetFixed) -
            windowIn
        ) /

        (numWindows - 1);

    const spacingEven =

        (
            widthIn -
            (numWindows * windowIn)
        ) /

        (numWindows + 1)

        +

        windowIn;

    const offsetEven =
        spacingEven -
        windowIn;

    const offset =

        fixedOffsetIn === 0
            ? offsetEven
            : offsetFixed;

    let spacing =

        fixedOffsetIn === 0
            ? spacingEven
            : spacingFixed;

    if (
        isNaN(spacing) ||
        !isFinite(spacing)
    ) {

        spacing = 0;

    }

    const results = [];

    for (
        let i = 0;
        i < numWindows;
        i++
    ) {

        results.push(

            offset +
            (i * spacing)

        );

    }

    return results;

}

export function slimSinglePerSection(
    widthIn,
    fixedEnd,
    singleEndcap
) {

    const evenSingle = [
        { min: 96, max: 132, qty: 2 },
        { min: 133, max: 175, qty: 3 },
        { min: 176, max: 217, qty: 4 },
        { min: 218, max: 242, qty: 5 }
    ];

    const fixedSingle = [
        { min: 96, max: 128, qty: 2 },
        { min: 129, max: 170, qty: 3 },
        { min: 171, max: 213, qty: 4 },
        { min: 214, max: 242, qty: 5 }
    ];

    const evenDouble = [
        { min: 96, max: 136, qty: 2 },
        { min: 137, max: 179, qty: 3 },
        { min: 180, max: 222, qty: 4 },
        { min: 223, max: 242, qty: 5 }
    ];

    const fixedDouble = [
        { min: 96, max: 134, qty: 2 },
        { min: 135, max: 177, qty: 3 },
        { min: 178, max: 219, qty: 4 },
        { min: 220, max: 242, qty: 5 }
    ];

    let rules = null;

    if (
        !fixedEnd &&
        singleEndcap
    ) {

        rules = evenSingle;

    } else if (
        fixedEnd &&
        singleEndcap
    ) {

        rules = fixedSingle;

    } else if (
        !fixedEnd &&
        !singleEndcap
    ) {

        rules = evenDouble;

    } else {

        rules = fixedDouble;

    }

    const match =
        rules.find(rule =>

            widthIn >= rule.min &&
            widthIn <= rule.max

        );

    return match?.qty || 0;

}

export function slimDoublePerSection(
    widthIn,
    fixedEnd,
    singleEndcap
) {

    const evenSingle = [
        { min: 96, max: 158, qty: 1 },
        { min: 159, max: 234, qty: 2 },
        { min: 235, max: 242, qty: 3 }
    ];

    const fixedSingle = [
        { min: 96, max: 154, qty: 1 },
        { min: 155, max: 230, qty: 2 },
        { min: 231, max: 242, qty: 3 }
    ];

    const evenDouble = [
        { min: 96, max: 161, qty: 1 },
        { min: 162, max: 238, qty: 2 },
        { min: 239, max: 242, qty: 3 }
    ];

    const fixedDouble = [
        { min: 96, max: 160, qty: 1 },
        { min: 161, max: 236, qty: 2 },
        { min: 237, max: 242, qty: 3 }
    ];

    let rules = null;

    if (
        !fixedEnd &&
        singleEndcap
    ) {

        rules = evenSingle;

    } else if (
        fixedEnd &&
        singleEndcap
    ) {

        rules = fixedSingle;

    } else if (
        !fixedEnd &&
        !singleEndcap
    ) {

        rules = evenDouble;

    } else {

        rules = fixedDouble;

    }

    const match =
        rules.find(rule =>

            widthIn >= rule.min &&
            widthIn <= rule.max

        );

    return match?.qty || 0;

}

export function slimGetWindowPositions(
    panelType,
    doorWidth,
    fixedEnd,
    singleEndcap
) {

    const slimSingleWidth =
        34.344;

    const slimDoubleWidth =
        68.344;

    const endcapSingle =
        4.8125;

    const endcapDouble =
        7.8125;

    const numWindows =
        panelType === "slim_single"
            ? slimSinglePerSection(
                doorWidth,
                fixedEnd,
                singleEndcap
            )
            : slimDoublePerSection(
                doorWidth,
                fixedEnd,
                singleEndcap
            );

    const windowWidth =

        panelType ===
        "slim_single"

            ? slimSingleWidth

            : slimDoubleWidth;

    const endcapOffset =

        fixedEnd

            ? (
                singleEndcap
                    ? endcapSingle
                    : endcapDouble
            )

            : 0;

    return slimWindowLocations(
        doorWidth,
        windowWidth,
        numWindows,
        endcapOffset
    );

}

export function getPanelDimensions(
    panelType
) {

    const configKey =
        getPanelConfigurationKey(
            panelType
        );

    const config =
        panelConfigurations[
            configKey
        ];

    if (!config) {
        return null;
    }

    return {

        panelWidth:
            config.panelWidth,

        panelHeight:
            config.panelHeight

    };

}