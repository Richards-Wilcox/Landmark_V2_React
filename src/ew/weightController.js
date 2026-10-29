/* ==========================================================
   WEIGHT CONTROLLER (Landmark only)
   React port of the EW weight controller.

   Same formulas as the original:
   - getDoorWeight()      -> calcDoorWeight()
   - getOnDoorCode()      -> getOnDoorCode()
   - getOnDoorWeight()    -> calcOnDoorWeight()
   - getTrussWeight()     -> calcTrussWeight()
   - getSpringingWeight() -> calcSpringingWeight()

   Differences (so weight never throws):
   - Values come from React state, not getState()
   - COLOR is the colour code ("W", "X" ...), not COLOR.value
   - No jQuery – the breakdown text is returned and written
     to EW through useEwSync (getWeightEwValues)
   - Every input is converted with Number() || 0
========================================================== */

const BTM_RET_FACTOR = 0.2484;
const BTM_SEAL_FACTOR = 0.15;

// Woodgrain colours (Honey Cedar / Cocoa Hickory)
const WOODGRAIN_COLORS = ["X", "Y"];
const WOODGRAIN_EXTRA_WEIGHT = 0.0458;

/* Door model factors (H2 / H6 / H7 / H8 in the spreadsheet).
   panelSqftGrooved = Recessed grooved Colonial (FACE "B"). */
const MODEL_FACTORS = {
    A: {
        panelSqft: 1.775,
        panelSqftGrooved: 1.4928,
        reinforcingFactor: 0.4937,
        endCapFactor: 1.018775,
        doubleEndFactor: 2.049692
    },
    D: {
        panelSqft: 1.74,
        panelSqftGrooved: 1.61856,
        reinforcingFactor: 0.8515,
        endCapFactor: 1.13664,
        doubleEndFactor: 2.166111
    }
    // G (Grandview): no factors in the original code -> 0
};

const ON_DOOR_WEIGHTS = {
    PDS410: 11.697,
    PAS411: 11.745,
    PQS411: 11.697,

    CAS410: 11.697,
    CAS411: 11.745,
    CAS412: 11.793,
    CAS414: 11.889,

    CAD310: 13.939,
    CAD311: 13.987,
    CAD312: 14.035,
    CAD313: 14.083,

    CAD320: 14.723,
    CAD321: 14.771,
    CAD322: 14.819,
    CAD323: 14.867,

    CAD330: 15.507,
    CAD331: 15.555,
    CAD332: 15.603,
    CAD333: 15.651,

    CAD340: 16.291,
    CAD341: 16.339,
    CAD342: 16.387,
    CAD343: 16.435
};

const num = (value) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
};

const fixed = (value) => num(value).toFixed(2);

/* ---------- AI: door weight ---------- */

export function calcDoorWeight({
    doorWidthFeet,
    doorHeightFeet,
    numOfSections,
    width,          // total door width in inches (old WIDTH)
    doorModel,
    endCaps,
    panelStyle,
    selectedColor
}) {

    const widthFt = num(doorWidthFeet);
    const heightFt = num(doorHeightFeet);
    const sections = num(numOfSections);
    const globalWidth = num(width);

    const factors = MODEL_FACTORS[doorModel] || {
        panelSqft: 0,
        panelSqftGrooved: 0,
        reinforcingFactor: 0,
        endCapFactor: 0,
        doubleEndFactor: 0
    };

    const panelSqft = panelStyle === "B"
        ? factors.panelSqftGrooved
        : factors.panelSqft;

    // AD
    const panelWeight = widthFt * heightFt * panelSqft;

    // AE
    const reinforcingWeight = widthFt * sections * factors.reinforcingFactor;

    // AF
    const endCapWeight = factors.endCapFactor * heightFt;

    // AG
    const doubleEndWeight = endCaps === "Y"
        ? sections * factors.doubleEndFactor
        : 0;

    // AH: bottom retainer + bottom seal
    const bottomWeight =
        (BTM_RET_FACTOR * globalWidth) / 12 +
        (BTM_SEAL_FACTOR * (globalWidth + 6)) / 12;

    // Y
    const extraWeight = WOODGRAIN_COLORS.includes(selectedColor)
        ? WOODGRAIN_EXTRA_WEIGHT
        : 0;

    const total =
        panelWeight +
        reinforcingWeight +
        endCapWeight +
        doubleEndWeight +
        bottomWeight +
        extraWeight;

    return {
        total,
        panelWeight,
        reinforcingWeight,
        endCapWeight,
        doubleEndWeight,
        bottomWeight,
        extraWeight
    };
}

/* ---------- On-door hardware ---------- */

export function getOnDoorCode({
    doorModel,
    endCaps,
    numOfSections,
    centerHingeQty,
    trussQty
}) {

    const endCode = endCaps === "Y" ? "D" : "S";

    const sections = num(numOfSections);

    // Original: Number(CENTER_HINGE_QTY) || 1
    const hingeQty = num(centerHingeQty) || 1;

    const trussFlag = num(trussQty) === 0 ? "0" : "1";

    return `P${doorModel || ""}${endCode}${sections}${hingeQty}${trussFlag}`;
}

// AO
export function calcOnDoorWeight(input) {
    return ON_DOOR_WEIGHTS[getOnDoorCode(input)] || 0;
}

/* ---------- AM: truss ---------- */

export function calcTrussWeight({
    doorWidthFeet,
    trussQty
}) {

    // Original uses feet only (inches ignored)
    const widthInches = num(doorWidthFeet) * 12;
    const qty = num(trussQty);

    const factor = widthInches > 194.95 ? 1.15 : 0.82;

    return ((widthInches - 1) / 12) * qty * factor;
}

/* ---------- Springing weight (= WEIGHT) ---------- */

export function calcSpringingWeight(input = {}) {

    try {

        const door = calcDoorWeight(input);
        const onDoorWeight = calcOnDoorWeight(input);
        const trussWeight = calcTrussWeight(input);

        const total = door.total + onDoorWeight + trussWeight;

        return {
            total: Number.isFinite(total) ? total : 0,

            door,
            onDoorWeight,
            trussWeight,
            onDoorCode: getOnDoorCode(input),

            doorBreakdown:
                `Total: ${fixed(door.total)} ` +
                `Panel: ${fixed(door.panelWeight)} ` +
                `Reinforcing: ${fixed(door.reinforcingWeight)} ` +
                `EndCap: ${fixed(door.endCapWeight)} ` +
                `DoubleEnd: ${fixed(door.doubleEndWeight)} ` +
                `Bottom: ${fixed(door.bottomWeight)} ` +
                `Extra: ${fixed(door.extraWeight)}`,

            springingBreakdown:
                `Total: ${fixed(total)} ` +
                `Door: ${fixed(door.total)} ` +
                `OnDoor: ${fixed(onDoorWeight)} ` +
                `Truss: ${fixed(trussWeight)}`
        };

    } catch (err) {
        console.error("Door Weight Error:", err);

        return {
            total: 0,
            door: null,
            onDoorWeight: 0,
            trussWeight: 0,
            onDoorCode: "",
            doorBreakdown: "",
            springingBreakdown: ""
        };
    }
}

/* Original getCurrentDoorWeight() = springing weight */
export function getCurrentDoorWeight(input) {
    return calcSpringingWeight(input).total;
}

/* EW inputs written on every change (useEwSync) */
export function getWeightEwValues(weightResult) {
    return {
        WEIGHT: fixed(weightResult?.total),
        WEIGHT_BREAKDOWN: weightResult?.doorBreakdown || ""
    };
}
