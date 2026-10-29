/* ==========================================================
   HARDWARE_CARTON_CONTROLLER.js
   Residential Hardware Carton – ONE file for every product.

   1) Other products (react-wilcox):
        addHardwareDrivers()  – same addLogic() nodes as before.
        Nothing changes for them.

   2) Landmark React (GL_PRODUCT_ID 162059085):
        no addLogic – React calls on Configure:
          window.runHardwareCarton({ productId: "162059085", ... })
        and the values are written into the same EW inputs.

   Both paths use the SAME calculation functions below
   (section "SHARED CALCULATIONS"), so a rule is changed in
   one place only.

   Names are prefixed with "Carton" so they cannot clash with
   TRACK_BUNDLE_CONTROLLER.js in the shared EW scope.

   DEBUG
   - CARTON_DEBUG = true -> console table after every run:
       id | calculated | node value | input value | status
   - Second check 1 s later shows if something overwrote a value
   - Console: window.verifyHardwareCarton() -> check again any time
========================================================== */

const CARTON_LANDMARK_PRODUCT_ID = "162059085";

// Set to false to switch off the verification logs
const CARTON_DEBUG = true;

// Landmark: CENTER_HINGE_CODE (letter) -> CENTER_HINGE_QTY (number)
const CENTER_HINGE_CODE_MAP = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9
};

// Every EW input this file writes (Landmark path)
const CARTON_OUTPUT_IDS = [
    "END_HINGE_OUTPUT",
    "END_HINGE_QTY",
    "CENTER_HINGE_OUTPUT",
    "CENTER_HINGE_QTY",
    "HARDWARE_SET_CODE",
    "DRUMS_CABLES_KIT",
    "QTY_215306",
    "DOUBLE_END_HINGES_OUTPUT",
    "CONVERSION_KIT",
    "CABLE",
    "SLICE_KIT",
    "HARDWARE_DESC",
    "HINGE_PACK_1",
    "HINGE_PACK_1_QTY",
    "HINGE_PACK_2",
    "HINGE_PACK_2_QTY",
    "QTY_950188",
    "QTY_950189",
    "QTY_950192",
    "QTY_40021",
    "QTY_950190",
    "QTY_950191",
    "QTY_950195",
    "QTY_950176",
    "QTY_950177"
];


/* ==========================================================
   SHARED CALCULATIONS (pure – no getState, no DOM)
   Same comparisons as the original addLogic bodies.
========================================================== */

function calcEndHingeQty(endCaps) {
    return endCaps === "double" ? 12 : 6;
}

/* Accepts "D", "d", " D ", { value: "D" } or an EW input value.
   Always returns the LETTER (A–I) or "". */
function normalizeCenterHingeCode(code) {

    if (code && typeof code === "object") {
        code = code.value;
    }

    return String(code ?? "").trim().toUpperCase();
}

/* Landmark: letter -> number (A=1 … I=9). Always a NUMBER (0 = no code).
   Other products: 6 (≤ 9 ft) / 12. */
function calcCenterHingeQty(productId, centerHingeCode, doorWidthFeet) {

    if (String(productId) == CARTON_LANDMARK_PRODUCT_ID) {

        const code = normalizeCenterHingeCode(centerHingeCode);

        // Already a number (e.g. "4") -> keep it
        if (/^\d+$/.test(code)) {
            return Number(code);
        }

        return CENTER_HINGE_CODE_MAP[code] || 0;
    }

    const width = Number(doorWidthFeet) || 0;

    return width <= 9 ? 6 : 12;
}

function calcHardwareSetCode(
    doorHeightFeet,
    numSections,
    totalCenterHingeQty
) {

    const normalizedDoorHeightFeet = Number(doorHeightFeet) || 0;
    const normalizedNumSections = Number(numSections) || 0;
    const normalizedCenterHingeQty = Number(totalCenterHingeQty) || 0;

    /* ---------- Height code ---------- */

    let heightCode = "";

    if (normalizedDoorHeightFeet <= 7) {
        heightCode = "070";
    } else if (normalizedDoorHeightFeet <= 8) {
        heightCode = "080";
    } else if (normalizedDoorHeightFeet <= 9) {
        heightCode = "090";
    } else if (normalizedDoorHeightFeet < 11) {
        heightCode = "100";
    } else {
        heightCode = "120";
    }

    /* ---------- Section code ---------- */

    let sectionCode = normalizedNumSections;

    if (normalizedNumSections <= 4) {
        sectionCode = "4";
    }

    /* ---------- Center hinge carton character ----------
       0 -> 0, 1 -> B, 2 -> C, 3 -> D, 4 or greater -> D */

    const centerHingeLookup = "0BCDDDDDDDDDDDDDDDDDDDD";

    const numCenterHinges =
        centerHingeLookup.charAt(normalizedCenterHingeQty) || "D";

    /* ---------- Fixed values ---------- */

    const hardwareType = "N";
    const springType = "H";
    const partNum = "LHC";

    /* ---------- Final code ---------- */

    const hardwareSetCode =
        `${partNum}-B` +
        `${springType}` +
        `${heightCode}` +
        `${sectionCode}-` +
        `${numCenterHinges}` +
        `11` +
        `${hardwareType}` +
        `SBN`;

    if (CARTON_DEBUG) {
        console.groupCollapsed(`[HardwareCarton] HARDWARE_SET_CODE = ${hardwareSetCode}`);
        console.table({
            doorHeightFeet: { input: doorHeightFeet, normalized: normalizedDoorHeightFeet, code: heightCode },
            numSections: { input: numSections, normalized: normalizedNumSections, code: sectionCode },
            centerHingeQty: { input: totalCenterHingeQty, normalized: normalizedCenterHingeQty, code: numCenterHinges }
        });
        console.groupEnd();
    }

    return hardwareSetCode;
}

function calcDrumsCablesKit(liftType, heightInches) {

    if (liftType !== "High_Lift") {
        return "NONE";
    }

    const height = heightInches / 12;

    if (height <= 7) return "327-431";
    if (height <= 8) return "327-432";
    if (height <= 9) return "327-433";
    if (height <= 10) return "327-434";

    return "NONE";
}

function calcQty215306(trussQty) {
    return trussQty !== 0 ? 1 : 0;
}

function calcDoubleEndHinges(productId, endCaps, numSections) {

    let isDBLEnabled = false;

    if (String(productId) === CARTON_LANDMARK_PRODUCT_ID) {
        isDBLEnabled = endCaps === "Y";
    } else {
        isDBLEnabled = endCaps === "double";
    }

    if (!isDBLEnabled) {
        return "NONE";
    }

    if (numSections === 4) return "327-395";
    if (numSections === 5) return "327-396";
    if (numSections === 6) return "327-398";

    return "NONE";
}

function calcConversionKit(liftType) {

    if (liftType === "LHR_Fr_Mnt" || liftType === "LHF") {
        return "327-391";
    }

    if (liftType === "LHR_Rr_Mnt" || liftType === "LHROUT") {
        return "327-392";
    }

    return "NONE";
}

function calcCable(productId, liftType, doorHeight, glassShape) {

    let value = "NONE";

    switch (liftType) {
        case ("Std_Lift_12R"):
        case ("STD12"):
        case ("Std_Lift_15R"):
        case ("STD15"):
        case ("LHR_Fr_Mnt"):
        case ("LHF"):
            if (doorHeight >= (10 * 12 + 3) && doorHeight <= (10 * 12 + 9))
                value = "133-099";
            break;
        case ("Std_Lift_32R"):
        case ("32R"):
            if (doorHeight <= 7 * 12)
                value = "133-086";
            if (doorHeight <= 8 * 12)
                value = "133-087";
            break;
        case ("LHR_Rr_Mnt"):
        case ("LHROUT"):
            if (doorHeight <= 6 * 12)
                value = "133-072";
            else if (doorHeight <= 7 * 12)
                value = "133-077";
            else if (doorHeight <= 8 * 12)
                value = "133-078";
            else if (doorHeight <= 9 * 12)
                value = "133-079";
            else if (doorHeight <= 10 * 12)
                value = "133-080";
            else if (doorHeight <= 11 * 12)
                value = "13-021-2990-1";
            else if (doorHeight <= 12 * 12)
                value = "13-021-323201";
    }

    // LM v2: no cable when a glass shape is selected (heavy top removed)
    if (String(productId) === CARTON_LANDMARK_PRODUCT_ID) {
        if (glassShape && glassShape !== "NONE") {
            value = "NONE";
        }
    }

    return value;
}

function calcSliceKit(liftType, hiLift) {

    if (!["High_Lift", "HL"].includes(liftType)) {
        return "NONE";
    }

    return hiLift > 36 ? "327-414" : "327-404";
}

function calcHardwareDesc({
    productId,
    doorWidthFeet,
    doorWidthInches,
    doorHeightFeet,
    doorHeightInches,
    liftHwdesc,
    endCaps,
    doorModelDesc
}) {

    const widthInches = String(doorWidthInches) === "0" ? "" : "-" + doorWidthInches;
    const hwType = "+";
    const endStiles = ["double", "Y"].includes(endCaps) ? "DE" : "";

    const doorModel = String(productId) == CARTON_LANDMARK_PRODUCT_ID
        ? (doorModelDesc || "")
        : "Stilo";

    return [
        "HC",
        `${doorWidthFeet}${widthInches}x${doorHeightFeet}-${doorHeightInches}`,
        doorModel,
        liftHwdesc ? `${liftHwdesc}${hwType}` : "",
        endStiles
    ]
        .filter(v => v != null && v !== "")
        .join(" ");
}

function calcHingePacks(numSections, hingeCount) {

    const result = {
        hingePack1: "NONE",
        hingePack1Qty: 0,
        hingePack2: "NONE",
        hingePack2Qty: 0
    };

    switch (`${numSections}${hingeCount}`) {
        case "44":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 1;
            break;
        case "45":
        case "64":
        case "74":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 2;
            break;
        case "46":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 3;
            break;
        case "54":
            result.hingePack2 = "327-394"; result.hingePack2Qty = 1;
            break;
        case "55":
            result.hingePack2 = "327-394"; result.hingePack2Qty = 2;
            break;
        case "56":
        case "75":
            result.hingePack2 = "327-394"; result.hingePack2Qty = 3;
            break;
        case "65":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 2;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 1;
            break;
        case "66":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 1;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 3;
            break;
        case "76":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 2;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 3;
            break;
        case "84":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 1;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 1;
            break;
        case "85":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 2;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 2;
            break;
        case "86":
            result.hingePack1 = "327-393"; result.hingePack1Qty = 3;
            result.hingePack2 = "327-394"; result.hingePack2Qty = 3;
            break;
    }

    return result;
}

function calcWeightQuantities(endCaps, weight, height) {

    return {
        QTY_950188: endCaps == "single" && weight > 600 ? 1 : 0,
        QTY_950189: endCaps == "single" && weight > 600 ? 1 : 0,
        QTY_950192: endCaps == "single" && weight > 600 ? 2 : 0,
        QTY_40021: weight > 600 ? 2 : 0,
        QTY_950190: endCaps == "double" && weight > 600 ? 1 : 0,
        QTY_950191: (endCaps == "double" || endCaps == "Y") && weight > 600 ? 1 : 0,
        QTY_950195: endCaps == "double" && weight > 600 ? 2 : 0,
        QTY_950176: height > 8 * 12 && weight < 600 ? 1 : 0,
        QTY_950177: height > 8 * 12 && weight < 600 ? 1 : 0
    };
}

function resiCartonCodeMap(doorWidth) {
    if (doorWidth < 48)
        return "0";
    if (doorWidth < 111)
        return "B";
    if (doorWidth < 147)
        return "C";
    if (doorWidth < 195)
        return "D";
    return "E";
}


/* ==========================================================
   EW ACCESS (shared by both paths)
========================================================== */

function getEwCartonElement(id) {
    return document.getElementById(id) ||
        (document.ui && document.ui[id]) ||
        null;
}

/* EW node store – bare "nodeset" (let/const) or window.nodeset */
function getCartonNodeset() {
    if (typeof nodeset !== "undefined" && nodeset) {
        return nodeset;
    }
    return window.nodeset || null;
}

/* Landmark React page: values come from runHardwareCarton() only.
   #react-root covers the case where GL_PRODUCT_ID is not loaded
   yet when addHardwareDrivers() runs. */
function isCartonLandmarkReactPage() {

    let productId = "";

    try {
        if (typeof getState === "function") {
            productId = getState("GL_PRODUCT_ID") || "";
        }
    } catch (err) {
        productId = "";
    }

    if (!productId) {
        productId = getEwCartonElement("GL_PRODUCT_ID")?.value || "";
    }

    return (
        String(productId) === CARTON_LANDMARK_PRODUCT_ID ||
        !!document.getElementById("react-root")
    );
}


/* ==========================================================
   1) OTHER PRODUCTS – react-wilcox (unchanged behaviour)
========================================================== */

//TODO: Rename to Residential Hardware Carton
function addHardwareDrivers() {

    // No react-wilcox, or Landmark React -> runHardwareCarton() handles it.
    // Registering here would overwrite the values written by React.
    if (typeof addLogic !== "function") {
        if (CARTON_DEBUG) console.log("[HardwareCarton] addHardwareDrivers skipped: addLogic not available");
        return;
    }

    if (isCartonLandmarkReactPage()) {
        if (CARTON_DEBUG) console.log("[HardwareCarton] addHardwareDrivers skipped: Landmark React page (runHardwareCarton is used)");
        return;
    }

    if (CARTON_DEBUG) console.log("[HardwareCarton] addHardwareDrivers: registering addLogic rules");

    addLogic("END_HINGE_OUTPUT", function () {
        this.value = "327-040";
    }, ["DOOR_WIDTH_FEET"]);

    addLogic("END_HINGE_QTY", function () {
        this.value = calcEndHingeQty(getState("END_CAPS"));
    }, ["END_CAPS"]);

    addLogic("CENTER_HINGE_QTY", function () {
        this.value = calcCenterHingeQty(
            getState("GL_PRODUCT_ID"),
            getState("CENTER_HINGE_CODE"),
            getState("DOOR_WIDTH_FEET")
        );
    }, ["DOOR_WIDTH_FEET", "CENTER_HINGE_CODE", "GL_PRODUCT_ID"]);

    //*** CENTER HINGES ***//
    addLogic("CENTER_HINGE_OUTPUT", function () {
        this.value = "327-041";
    }, ["DOOR_WIDTH_FEET"]);

    addLogic("HARDWARE_SET_CODE", function () {
        this.value = calcHardwareSetCode(
            getState("DOOR_HEIGHT_FEET"),
            getNumberOfSections(),
            getTotalCenterHingeQTY()
        );
    }, ["DOOR_HEIGHT_FEET", "LIFT_TYPE", "WIDTH", "CENTER_HINGE_QTY"]);

    addLogic("DRUMS_CABLES_KIT", function () {
        this.value = calcDrumsCablesKit(getState("LIFT_TYPE"), getState("HEIGHT"));
    }, ["LIFT_TYPE", "HEIGHT"]);

    addLogic("QTY_215306", function () {
        this.value = calcQty215306(getState("TRUSS_QTY"));
    }, ["TRUSS_QTY"]);

    addLogic("DOUBLE_END_HINGES_OUTPUT", function () {
        this.value = calcDoubleEndHinges(
            getState("GL_PRODUCT_ID"),
            getState("END_CAPS"),
            getNumberOfSections()
        );
    }, ["END_CAPS", "NUM_SECTIONS", "GL_PRODUCT_ID", "NUM_OF_SEC"]);

    addLogic("CONVERSION_KIT", function () {
        this.value = calcConversionKit(getState("LIFT_TYPE"));
    }, ["LIFT_TYPE"]);

    addLogic("CABLE", function () {
        this.value = calcCable(
            getState("GL_PRODUCT_ID"),
            getState("LIFT_TYPE"),
            getState("HEIGHT"),
            getState("GLASS_SHAPE")
        );
    }, ["HEIGHT", "LIFT_TYPE", "GLASS_SHAPE"]);

    addLogic("SLICE_KIT", function () {
        this.value = calcSliceKit(getState("LIFT_TYPE"), getHiLift());
    }, ["LIFT_TYPE", "HIGHLIFT", "HEIGHT"]);

    addLogic("HARDWARE_DESC", function () {

        const productId = getState("GL_PRODUCT_ID");

        this.value = calcHardwareDesc({
            productId,
            doorWidthFeet: getState("DOOR_WIDTH_FEET"),
            doorWidthInches: getState("DOOR_WIDTH_INCHES"),
            doorHeightFeet: getState("DOOR_HEIGHT_FEET"),
            doorHeightInches: getState("DOOR_HEIGHT_INCHES"),
            liftHwdesc: getSelected("LIFT_TYPE")?.getAttribute("hwdesc") || "",
            endCaps: getState("END_CAPS"),
            doorModelDesc: productId == CARTON_LANDMARK_PRODUCT_ID
                ? (getNode("DOOR_MODEL")?.getAttribute("desc") || "")
                : ""
        });

    }, ["WIDTH", "HEIGHT", "END_CAPS", "LIFT_TYPE", "GL_PRODUCT_ID"]);

    addLogic("HINGE_PACK_1", function () {
        this.value = getHingePackValues().hingePack1;
    }, ["CENTER_HINGE_QTY", "HEIGHT"]);

    addLogic("HINGE_PACK_1_QTY", function () {
        this.value = getHingePackValues().hingePack1Qty;
    }, ["CENTER_HINGE_QTY", "HEIGHT"]);

    addLogic("HINGE_PACK_2", function () {
        this.value = getHingePackValues().hingePack2;
    }, ["CENTER_HINGE_QTY", "HEIGHT"]);

    addLogic("HINGE_PACK_2_QTY", function () {
        this.value = getHingePackValues().hingePack2Qty;
    }, ["CENTER_HINGE_QTY", "HEIGHT"]);

    // Weight-based quantities
    [
        { id: "QTY_950188", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_950189", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_950192", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_40021", deps: ["WEIGHT"] },
        { id: "QTY_950190", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_950191", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_950195", deps: ["END_CAPS", "WEIGHT"] },
        { id: "QTY_950176", deps: ["HEIGHT", "WEIGHT"] },
        { id: "QTY_950177", deps: ["HEIGHT", "WEIGHT"] }
    ].forEach(item => {
        addLogic(item.id, function () {
            this.value = calcWeightQuantities(
                getState("END_CAPS"),
                getState("WEIGHT"),
                getState("HEIGHT")
            )[item.id];
        }, item.deps);
    });

    //Needed for some completely asinine shaft behaviour (other products only)
    if (typeof $ === "function") {
        $("#DOOR_WIDTH_INCHES").change(() => $("#GLOBAL_DOOR_WIDTH_INPUT").val(getGlobalDoorWidth()));
        $("#DOOR_WIDTH_FEET").change(() => $("#GLOBAL_DOOR_WIDTH_INPUT").val(getGlobalDoorWidth()));
    }
}

/* Original signature kept – other files call it without arguments.
   React passes (numSections, hingeCount). */
function getHingePackValues(numSections, hingeCount) {

    if (numSections === undefined) {
        numSections = getNumberOfSections();
    }

    if (hingeCount === undefined) {
        hingeCount = getState("CENTER_HINGE_QTY");
    }

    return calcHingePacks(numSections, hingeCount);
}

/* Kept for anything that still calls it (old jQuery version) */
function updateHingePacks() {

    const packs = calcHingePacks(getNumberOfSections(), getTotalCenterHingeQTY());

    $("#HINGE_PACK_1").val(packs.hingePack1);
    $("#HINGE_PACK_1_QTY").val(packs.hingePack1Qty);
    $("#HINGE_PACK_2").val(packs.hingePack2);
    $("#HINGE_PACK_2_QTY").val(packs.hingePack2Qty);
}


/* ==========================================================
   2) LANDMARK REACT – called on Configure
      window.runHardwareCarton(input)

   input:
   {
       productId:        "162059085",
       doorWidthFeet,    doorWidthInches,
       doorHeightFeet,   doorHeightInches,
       width,            height,          // total inches
       numSections,                       // number
       endCaps:          "N" | "Y",
       liftType:         "STD15" | "HL" | "LHF" | "LHROUT" ...
       liftHwdesc:       '15" Tor',
       highlift,
       trussQty,
       weight,                            // empty -> EW #WEIGHT
       glassShape,
       centerHingeCode,                   // LETTER A–I (CENTER_HINGE_CODE)
       doorModelDesc                      // "Cls" / "Prem" / "Grd"
   }
========================================================== */

/* Write the value to the node AND the input, no change event
   (events let legacy rules overwrite the calculated output). */
function setEwCartonValue(id, value) {

    const element = getEwCartonElement(id);
    const store = getCartonNodeset();
    const finalValue = value === null || value === undefined ? "" : value;

    let found = false;

    if (store && store[id]) {
        store[id].value = finalValue;
        found = true;
    }

    if (element && "value" in element) {
        element.value = String(finalValue);
        found = true;
    }

    return found;
}

function getHardwareCartonValues(input = {}) {

    const n = v => Number(v) || 0;

    const productId = String(input.productId ?? CARTON_LANDMARK_PRODUCT_ID);

    const doorWidthFeet = input.doorWidthFeet ?? 0;
    const doorWidthInches = input.doorWidthInches ?? 0;
    const doorHeightFeet = n(input.doorHeightFeet);
    const doorHeightInches = input.doorHeightInches ?? 0;

    // Total inches – from React (input) or the global functions
    const height = n(input.height ?? (typeof getGlobalDoorHeight === "function" ? getGlobalDoorHeight() : 0));

    const numSections = n(input.numSections) || 4;
    const endCaps = input.endCaps || "";
    const liftType = input.liftType || "";

    const weight =
        input.weight === undefined || input.weight === null || input.weight === ""
            ? n(getEwCartonElement("WEIGHT")?.value)
            : n(input.weight);

    // Letter (A–I) -> number (1–9); other products 6 / 12
    const centerHingeCode = normalizeCenterHingeCode(input.centerHingeCode);

    const centerHingeQty = calcCenterHingeQty(
        productId,
        centerHingeCode,
        doorWidthFeet
    );

    if (!centerHingeQty) {
        console.warn(`[HardwareCarton] no CENTER_HINGE_QTY for center hinge code "${centerHingeCode}".`);
    }

    const hingePacks = calcHingePacks(numSections, centerHingeQty);

    return {
        END_HINGE_OUTPUT: "327-040",
        END_HINGE_QTY: calcEndHingeQty(endCaps),

        CENTER_HINGE_OUTPUT: "327-041",
        CENTER_HINGE_QTY: centerHingeQty,          // NUMBER: D -> 4

        HARDWARE_SET_CODE: calcHardwareSetCode(doorHeightFeet, numSections, centerHingeQty),

        DRUMS_CABLES_KIT: calcDrumsCablesKit(liftType, height),
        QTY_215306: calcQty215306(n(input.trussQty)),
        DOUBLE_END_HINGES_OUTPUT: calcDoubleEndHinges(productId, endCaps, numSections),
        CONVERSION_KIT: calcConversionKit(liftType),
        CABLE: calcCable(productId, liftType, height, input.glassShape || ""),
        SLICE_KIT: calcSliceKit(liftType, n(input.highlift)),

        HARDWARE_DESC: calcHardwareDesc({
            productId,
            doorWidthFeet,
            doorWidthInches,
            doorHeightFeet,
            doorHeightInches,
            liftHwdesc: input.liftHwdesc || "",
            endCaps,
            doorModelDesc: input.doorModelDesc || ""
        }),

        HINGE_PACK_1: hingePacks.hingePack1,
        HINGE_PACK_1_QTY: hingePacks.hingePack1Qty,
        HINGE_PACK_2: hingePacks.hingePack2,
        HINGE_PACK_2_QTY: hingePacks.hingePack2Qty,

        ...calcWeightQuantities(endCaps, weight, height)
    };
}


/* ==========================================================
   DEBUG – verification table
========================================================== */

// Last calculated values (used by window.verifyHardwareCarton)
let cartonLastValues = null;

/* One row per output id:
   calculated | node (nodeset) | input (DOM) | status */
function verifyCartonValues(expected, label) {

    if (!CARTON_DEBUG || !expected) {
        return [];
    }

    const store = getCartonNodeset();
    const rows = {};
    const problems = [];

    CARTON_OUTPUT_IDS.forEach(id => {

        const calculated = expected[id] ?? "";
        const node = store && store[id] ? store[id].value : undefined;
        const element = getEwCartonElement(id);
        const input = element && "value" in element ? element.value : undefined;

        let status = "OK";

        if (node === undefined && input === undefined) {
            status = "MISSING (no node, no input)";
        } else if (input !== undefined && String(input) !== String(calculated)) {
            status = "INPUT CHANGED";
        } else if (node !== undefined && String(node) !== String(calculated)) {
            status = "NODE CHANGED";
        }

        if (status !== "OK") {
            problems.push(id);
        }

        rows[id] = {
            calculated: String(calculated),
            node: node === undefined ? "(no node)" : String(node),
            input: input === undefined ? "(no input)" : String(input),
            status
        };
    });

    console.groupCollapsed(
        `[HardwareCarton] ${label} – ${problems.length ? problems.length + " problem(s)" : "all OK"}`
    );
    console.table(rows);
    if (problems.length) {
        console.warn("[HardwareCarton] Problem ids:", problems);
    }
    console.groupEnd();

    return problems;
}

/* Console: window.verifyHardwareCarton() – check again any time */
function verifyHardwareCarton() {

    if (!cartonLastValues) {
        console.warn("[HardwareCarton] runHardwareCarton() has not run yet.");
        return [];
    }

    return verifyCartonValues(cartonLastValues, "manual check");
}


/* ==========================================================
   LANDMARK – run
========================================================== */

function runHardwareCarton(input = {}) {

    if (CARTON_DEBUG) {
        console.groupCollapsed("[HardwareCarton] runHardwareCarton input");
        console.table(input);
        console.groupEnd();
    }

    const values = getHardwareCartonValues(input);

    const missing = [];

    Object.entries(values).forEach(([id, value]) => {
        if (!setEwCartonValue(id, value)) {
            missing.push(id);
        }
    });

    if (missing.length) {
        console.warn("[HardwareCarton] EW inputs not found:", missing);
    }

    cartonLastValues = { ...values };

    if (CARTON_DEBUG) {
        console.log("[HardwareCarton] center hinge:", {
            CENTER_HINGE_CODE_input: input.centerHingeCode,
            CENTER_HINGE_CODE_ew: getEwCartonElement("CENTER_HINGE_CODE")?.value,
            CENTER_HINGE_QTY: values.CENTER_HINGE_QTY
        });
    }

    // Right after writing
    verifyCartonValues(values, "after write");

    // 1 s later – shows if another rule overwrote a value
    if (CARTON_DEBUG) {
        setTimeout(() => {
            verifyCartonValues(values, "1 s later (overwritten?)");
        }, 1000);
    }

    return { values, missing };
}

/* Assembled / Raw panel or no hardware set */
function clearHardwareCarton() {

    const values = {
        END_HINGE_QTY: 0,
        CENTER_HINGE_QTY: 0,
        HARDWARE_SET_CODE: "",
        DRUMS_CABLES_KIT: "NONE",
        QTY_215306: 0,
        DOUBLE_END_HINGES_OUTPUT: "NONE",
        CONVERSION_KIT: "NONE",
        CABLE: "NONE",
        SLICE_KIT: "NONE",
        HARDWARE_DESC: "",
        HINGE_PACK_1: "NONE",
        HINGE_PACK_1_QTY: 0,
        HINGE_PACK_2: "NONE",
        HINGE_PACK_2_QTY: 0,
        QTY_950188: 0,
        QTY_950189: 0,
        QTY_950192: 0,
        QTY_40021: 0,
        QTY_950190: 0,
        QTY_950191: 0,
        QTY_950195: 0,
        QTY_950176: 0,
        QTY_950177: 0
    };

    const missing = [];

    Object.keys(values).forEach(id => {
        if (!setEwCartonValue(id, values[id])) {
            missing.push(id);
        }
    });

    // END / CENTER hinge outputs are fixed part numbers – keep them
    cartonLastValues = {
        ...values,
        END_HINGE_OUTPUT: getEwCartonElement("END_HINGE_OUTPUT")?.value ?? "",
        CENTER_HINGE_OUTPUT: getEwCartonElement("CENTER_HINGE_OUTPUT")?.value ?? ""
    };

    verifyCartonValues(cartonLastValues, "cleared");

    return { values, missing };
}

/* React calls these through window */
window.runHardwareCarton = runHardwareCarton;
window.clearHardwareCarton = clearHardwareCarton;
window.getHardwareCartonValues = getHardwareCartonValues;
window.verifyHardwareCarton = verifyHardwareCarton;

if (CARTON_DEBUG) {
    console.log("[HardwareCarton] HARDWARE_CARTON_CONTROLLER.js loaded");
}
