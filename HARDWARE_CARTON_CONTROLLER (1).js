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
========================================================== */

const LANDMARK_PRODUCT_ID = "162059085";

// Landmark: CENTER_HINGE_CODE (letter) -> CENTER_HINGE_QTY (number)
const CENTER_HINGE_CODE_MAP = {
    A: 1, B: 2, C: 3, D: 4, E: 5, F: 6, G: 7, H: 8, I: 9
};


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

    if (String(productId) == LANDMARK_PRODUCT_ID) {

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

    const normalizedDoorHeightFeet =
        Number(doorHeightFeet) || 0;

    const normalizedNumSections =
        Number(numSections) || 0;

    const normalizedCenterHingeQty =
        Number(totalCenterHingeQty) || 0;

    console.group("calcHardwareSetCode");

    console.log("1. Inputs", {
        doorHeightFeet,
        numSections,
        totalCenterHingeQty
    });

    console.log("2. Normalized inputs", {
        normalizedDoorHeightFeet,
        normalizedNumSections,
        normalizedCenterHingeQty
    });

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

    console.log("3. Height code", {
        normalizedDoorHeightFeet,
        heightCode
    });

    /* ---------- Section code ---------- */

    let sectionCode = normalizedNumSections;

    if (normalizedNumSections <= 4) {
        sectionCode = "4";
    }

    console.log("4. Section code", {
        normalizedNumSections,
        sectionCode
    });

    /* ---------- Center hinge carton character ---------- */

    /*
     * Intended rule:
     * 0 -> 0
     * 1 -> B
     * 2 -> C
     * 3 -> D
     * 4 or greater -> D
     */
    const centerHingeLookup =
        "0BCDDDDDDDDDDDDDDDDDDDD";

    const numCenterHinges =
        centerHingeLookup.charAt(
            normalizedCenterHingeQty
        ) || "D";

    console.log("5. Center hinge conversion", {
        CENTER_HINGE_QTY:
            normalizedCenterHingeQty,

        lookupIndex:
            normalizedCenterHingeQty,

        lookupCharacter:
            numCenterHinges,

        lookupString:
            centerHingeLookup
    });

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

    console.log("6. Final parts", {
        partNum,
        springType,
        heightCode,
        sectionCode,
        numCenterHinges,
        hardwareType
    });

    console.log(
        "7. HARDWARE_SET_CODE",
        hardwareSetCode
    );

    console.groupEnd();

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

    if (String(productId) === LANDMARK_PRODUCT_ID) {
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

    //assign value to none for LM v2 when glass shape is selected. (we are removing heavy Top)
    if (String(productId) === LANDMARK_PRODUCT_ID) {
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

    const doorModel = String(productId) == LANDMARK_PRODUCT_ID
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
   1) OTHER PRODUCTS – react-wilcox (unchanged behaviour)
========================================================== */

//TODO: Rename to Residential Hardware Carton
function addHardwareDrivers() {

    // Landmark React has no react-wilcox – it uses runHardwareCarton()
    if (typeof addLogic !== "function") {
        return;
    }

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
            liftHwdesc: getSelected("LIFT_TYPE").getAttribute("hwdesc"),
            endCaps: getState("END_CAPS"),
            doorModelDesc: productId == LANDMARK_PRODUCT_ID
                ? getNode("DOOR_MODEL").getAttribute("desc")
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

function getEwCartonElement(id) {
    return document.getElementById(id) ||
        (document.ui && document.ui[id]) ||
        null;
}

function setEwCartonValue(id, value) {

    const element = getEwCartonElement(id);

    let found = false;

    const finalValue =
        value === null || value === undefined
            ? ""
            : value;

    /*
     * Set nodeset first.
     *
     * Do not trigger logic while nodeset still contains
     * the previous value.
     */
    if (
        window.nodeset &&
        window.nodeset[id]
    ) {
        window.nodeset[id].value = finalValue;
        found = true;
    }

    /*
     * Set the actual EW input.
     *
     * Do not dispatch input/change here. These values are
     * final calculated carton outputs. Dispatching change
     * allows another legacy rule to overwrite the value.
     */
    if (
        element &&
        "value" in element
    ) {
        element.value = String(finalValue);
        found = true;
    }

    return found;
}


function getHardwareCartonValues(input = {}) {

    const n = v => Number(v) || 0;

    const productId = String(input.productId ?? LANDMARK_PRODUCT_ID);

    const doorWidthFeet = input.doorWidthFeet ?? 0;
    const doorWidthInches = input.doorWidthInches ?? 0;
    const doorHeightFeet = n(input.doorHeightFeet);
    const doorHeightInches = input.doorHeightInches ?? 0;

    // Total inches – from React (input) or the global functions
    const width = n(input.width ?? (typeof getGlobalDoorWidth === "function" ? getGlobalDoorWidth() : 0));
    const height = n(input.height ?? (typeof getGlobalDoorHeight === "function" ? getGlobalDoorHeight() : 0));

    const numSections = n(input.numSections) || 4;
    const endCaps = input.endCaps || "";
    const liftType = input.liftType || "";

    const weight =
        input.weight === undefined || input.weight === null || input.weight === ""
            ? n(getEwCartonElement("WEIGHT")?.value)
            : n(input.weight);

    // Letter (A–I) -> number (1–9)
    const centerHingeCode =
        normalizeCenterHingeCode(
            input.centerHingeCode
        );

    const centerHingeQty =
        String(productId) === LANDMARK_PRODUCT_ID
            ? Number(
                CENTER_HINGE_CODE_MAP[
                centerHingeCode
                ] || 0
            )
            : (
                Number(doorWidthFeet) <= 9
                    ? 6
                    : 12
            );

    console.log(
        "Hardware carton center hinge:",
        {
            productId,
            centerHingeCode,
            centerHingeQty,
            centerHingeQtyType:
                typeof centerHingeQty
        }
    );

    const hingePacks =
        calcHingePacks(
            numSections,
            centerHingeQty
        );

    if (!centerHingeQty) {
        console.warn(`Hardware carton: no CENTER_HINGE_QTY for center hinge code "${centerHingeCode}".`);
    }

    return {
        END_HINGE_OUTPUT: "327-040",
        // END_HINGE_OUTPUT: "",
        END_HINGE_QTY: calcEndHingeQty(endCaps),

        CENTER_HINGE_OUTPUT: "327-041",
        // CENTER_HINGE_OUTPUT: "",
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

        ...calcWeightQuantities(endCaps, weight, height),


    };
}

function runHardwareCarton(input) {

    const values =
        getHardwareCartonValues(input);

    const missing = [];

    /*
     * Write all calculated carton values directly.
     */
    Object.entries(values).forEach(
        ([id, value]) => {

            const found =
                setEwCartonValue(
                    id,
                    value
                );

            if (!found) {
                missing.push(id);
            }
        }
    );

    /*
     * Final enforcement.
     *
     * CENTER_HINGE_CODE must remain the letter.
     * CENTER_HINGE_QTY must remain the number.
     */
    const finalCenterHingeQty =
        Number(values.CENTER_HINGE_QTY) || 0;

    setEwCartonValue(
        "CENTER_HINGE_QTY",
        finalCenterHingeQty
    );

    /*
     * Verify what is really stored after assignment.
     */
    const qtyElement =
        getEwCartonElement(
            "CENTER_HINGE_QTY"
        );

    const codeElement =
        getEwCartonElement(
            "CENTER_HINGE_CODE"
        );

    console.log(
        "Hardware carton final center hinge:",
        {
            CENTER_HINGE_CODE_input:
                codeElement?.value,

            CENTER_HINGE_QTY_calculated:
                finalCenterHingeQty,

            CENTER_HINGE_QTY_input:
                qtyElement?.value,

            CENTER_HINGE_QTY_nodeset:
                window.nodeset?.CENTER_HINGE_QTY
                    ?.value
        }
    );

    if (missing.length) {
        console.warn(
            "Hardware carton: EW inputs not found:",
            missing
        );
    }

    console.log(
        "Hardware carton values:",
        values
    );

    return {
        values,
        missing
    };
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

    Object.keys(values).forEach(id => setEwCartonValue(id, values[id]));

    return { values, missing: [] };
}

console.log(
    "React hardware carton input:",
    {
        CENTER_HINGE_CODE:
            drivenValues.CENTER_HINGE_CODE,

        type:
            typeof drivenValues.CENTER_HINGE_CODE
    }
);

/* React calls these through window */
window.runHardwareCarton = runHardwareCarton;
window.clearHardwareCarton = clearHardwareCarton;
window.getHardwareCartonValues = getHardwareCartonValues;
