/* ==========================================================
   OPERATOR DATA (port of LOAD_HTML.js – Operator section)

   - operatorData from populateCarousel()
   - accessory <select> options (ADDITIONAL_TRANSMITTER,
     ADDITIONAL_CONTROL_PANEL, ADDITIONAL_KEYLESS_ENTRY)
   - OPERATOR_BRACKET radios
   - EW values written on every change (old syncOperatorState /
     the old select inputs that EW read directly)
========================================================== */

// Same folder as the old src_path + "images/"
export const OPERATOR_IMAGE_PATH = "/HTML/products/162059085/images/";

export const OPERATOR_OPTIONS = [
    {
        id: "operator_none",
        name: "None",
        value: "PS",
        image: "Operators_none.png",
        maxDoorHeight: 1000,
        isHiLiftCompatible: true
    },
    {
        id: "operator_jackshaft",
        name: "98022 - Jackshaft",
        value: "951-185",
        image: "EW-LM-8500W.jpg",
        maxDoorHeight: 168,
        isHiLiftCompatible: true
    },
    {
        id: "6580L_Belt",
        name: "6580L - Belt",
        value: "OP_6580L_VALUE",
        image: "6580L-(951-193)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "6590L_Belt",
        name: "6690L - Belt",
        value: "OP_6590L_VALUE",
        image: "6690L-(951-194)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "2220L_Chain",
        name: "2220L - Chain",
        value: "OP_2220L_CHAIN_VALUE",
        image: "2220L-(951-190)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    },
    {
        id: "2420L_Chain",
        name: "2420L - Chain",
        value: "OP_2420L_CHAIN_VALUE",
        image: "2420L-(951-191)_E-Cat.png",
        maxDoorHeight: 120,
        isHiLiftCompatible: false
    }
];

export const OPERATOR_BRACKETS = [
    { value: "ADJUSTABLE_BRACKET", label: "Adjustable Bracket" },
    { value: "CLAW_BRACKET", label: "Claw Bracket" }
];

// Same options / img attributes as the old <select> elements
export const OPERATOR_ACCESSORIES = [
    {
        id: "ADDITIONAL_TRANSMITTER",
        label: "Additional Transmitter",
        noneLabel: "NONE",
        quantities: ["1", "2", "3", "4"],
        options: [
            { value: "952-232", label: "L993M", img: "L991S-(952-230)_E-Cat.png" },
            { value: "952-233", label: "L993S", img: "L993S-(952-233)_E-Cat.png" },
            { value: "952-231", label: "L992U", img: "L992U-(952-231)_E-Cat.png" },
            { value: "952-229", label: "L932M", img: "L932M-(952-229)_E-Cat.png" },
            { value: "952-230", label: "L991S", img: "L991S-(952-230)_E-Cat.png" }
        ]
    },
    {
        id: "ADDITIONAL_CONTROL_PANEL",
        label: "Additional Control Panel",
        noneLabel: "None",
        quantities: ["1", "2"],
        options: [
            { value: "952-227", label: "L957W", img: "L957W (952-227)_E-Cat.png" },
            { value: "952-228", label: "L958W", img: "L958W-(952-228)_E-Cat.png" },
            { value: "952-225", label: "L955W", img: "L955W-(952-225)_E-Cat.png" },
            { value: "952-226", label: "L956W", img: "L956W-(952-226)_E-Cat.png" }
        ]
    },
    {
        id: "ADDITIONAL_KEYLESS_ENTRY",
        label: "Additional Keyless Entry",
        noneLabel: "None",
        quantities: ["1", "2", "3"],
        options: [
            { value: "952-234", label: "L979M", img: "L979M-(952-234)_E-Cat.png" },
            { value: "952-235", label: "L979S", img: "L979S-(952-235)_E-Cat.png" },
            { value: "952-236", label: "L979U", img: "L979U-(952-236)_E-Cat.png" }
        ]
    }
];

// Old default: currentOperatorIndex = 1 -> first real slide = None (PS)
export const DEFAULT_OPERATOR = {
    operator: "PS",
    bracket: "",
    ADDITIONAL_TRANSMITTER: "NONE",
    ADDITIONAL_TRANSMITTER_QTY: "0",
    ADDITIONAL_CONTROL_PANEL: "NONE",
    ADDITIONAL_CONTROL_PANEL_QTY: "0",
    ADDITIONAL_KEYLESS_ENTRY: "NONE",
    ADDITIONAL_KEYLESS_ENTRY_QTY: "0"
};

export const getOperatorOption = (value) =>
    OPERATOR_OPTIONS.find(option => option.value === value) ||
    OPERATOR_OPTIONS[0];

export const getOperatorImageUrl = (file) =>
    file ? OPERATOR_IMAGE_PATH + encodeURIComponent(file) : "";

/* Accessory change: NONE -> qty 0 (disabled), otherwise qty 1 */
export function applyAccessoryChange(operator, id, value) {
    return {
        ...operator,
        [id]: value,
        [`${id}_QTY`]: value === "NONE" ? "0" : "1"
    };
}

/* EW inputs (same ids as the old HTML) */
export function getOperatorEwValues(operator = DEFAULT_OPERATOR) {

    const o = { ...DEFAULT_OPERATOR, ...operator };

    const values = {
        OPERATOR: o.operator,
        OPERATOR_BRACKET: o.bracket || ""
    };

    OPERATOR_ACCESSORIES.forEach(item => {
        values[item.id] = o[item.id] || "NONE";
        values[`${item.id}_QTY`] =
            values[item.id] === "NONE" ? "0" : (o[`${item.id}_QTY`] || "1");
    });

    return values;
}

/* Old syncOperatorState(): data-* attributes on the EW #OPERATOR input */
export function syncOperatorAttributes(operatorValue) {

    const element = document.getElementById("OPERATOR");

    if (!element) {
        return;
    }

    const option = getOperatorOption(operatorValue);

    element.setAttribute("data-max-door-height", option.maxDoorHeight);
    element.setAttribute("data-is-hi-lift-compatible", option.isHiLiftCompatible);
}
