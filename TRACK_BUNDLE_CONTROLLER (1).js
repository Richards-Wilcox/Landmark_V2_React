/* ==========================================================
   TRACK_BUNDLE_CONTROLLER.js

   1) Other products (react-wilcox):
        addTrackDrivers() – same addLogic() / addNode() nodes,
        same ids, same dependencies as before.

   2) Landmark React Version (GL_PRODUCT_ID 162059085):
        no addLogic – React calls on Configure:
          await window.runTrackBundle({ productId: "162059085", ... })
        and the values are written into the same EW inputs.

   Both paths use the SAME calculation functions below
   (section "SHARED CALCULATIONS"), so a rule is changed in
   one place only.


   DEBUG
   - TRACK_DEBUG = true -> console table after every run:
       id | calculated | node value | input value | status
   - Second check 1 s later shows if something overwrote a value
   - Console: window.verifyTrackBundle()  -> check again any time
========================================================== */

const TRACK_LANDMARK_PRODUCT_ID = "162059085";

// Set to false to switch off the verification logs
const TRACK_DEBUG = false;

// Every EW input this file writes (Landmark path)
const TRACK_OUTPUT_IDS = [
    "SHAFT_LOCATION",
    "SHAFT_L1_PART",
    "TRACK_BUNDLE",
    "TRACK_SET_INPUT_HL",
    "TRACK_SET_INPUT",
    "UPPER_VERTICAL_TRACKS",
    "LOWER_VERTICAL_TRACKS",
    "SPRING_RH",
    "SPRING_LH",
    "BULK_SPRING_QTY",
    "INCLUDE_SPRING_CUT_INSTR",
    "CUT_INSTR_RH_SPRINGS",
    "CUT_INSTR_LH_SPRINGS",
    "SPRING_LH_QTY",
    "SPRING_RH_QTY",
    "BULK_SPRING_RH",
    "BULK_SPRING_LH",
    "SPRING_RH_DESC",
    "SPRING_LH_DESC"
];

// Fallback spring solution (same value as the original addNode)
const TRACK_DEFAULT_SPRING_SOLUTION = JSON.parse(
    '{"ACTIVE_COILS_HIGH":91.58198771102559,"WEIGHT_LH":12.689963208845942,"QUANTITY":2,"SHAFT_REMAIN":102.97643555265604,"GA_H_CODE":-1,"ACTIVE_COILS_HIGH_LH":87.80224014696961,"VALUE":"433-2036M2","GA_HCONV":-1,"TORTEN_LH":297,"SPRING_RH_DESC":"0.243rd x 2 x 35 \\" RH 1.00C","OPT":"","MIN_LENGTH":-5,"SPRING_LENGTH_RH":34.689524076799074,"FINAL_LENGTH":34.689524076799074,"Q_H":2,"WEIGHT":13.216708673260447,"GA_H_SQFCT":-1,"QTY_EVEN_ODD":2,"BORE_SIZE":1,"MAX_IP":627.4810305007693,"ROUND_OR_SQUARE":"R","SPRING_RH":"52-24350R-R0E","HIGH_LH":1,"SPRING_LH":"52-23320L-R0E","SPRING_LENGTH_LH":32.14134875392614,"MIP_LH":297.0718478819873,"SPRING_GAL":1.266,"WIRE_SIZE_LH":0.234,"WIRE_SIZE":0.243,"DC_1":7,"HIGH_RH":1,"MAX_LENGTH":48,"TORTEN_L":-1,"TORTEN":266.9743,"COUPLER":false,"TORTEN_H":564,"MIP":330.409182618782,"SPRING_LH_DESC":"0.234rd x 2 x 32 LH 1.00C","COIL_DIAMETER":2,"WOUND_LENGTH":39.76356444734397,"CYCLE_LIFE":21.602826154510186}'
);


/* ==========================================================
   SHARED CALCULATIONS (pure – no getState, no DOM)
   Same comparisons as the original addLogic bodies.

   Functions return null where the original code left the
   node value unchanged (no matching range).
========================================================== */

function isTrackHighLift(liftType) {
    return ["High_Lift", "HL"].includes(liftType);
}

/* Removes the shaft from the bundle */
function calcShaftLocation(doorWidthInches) {
    return Number(doorWidthInches) > 147 ? 0 : 1;
}

/* Shaft driver.
   doorModelDesc: "STILO" for other products,
   DOOR_MODEL desc ("Cls" / "Prem" / "Grd") for Landmark. */
function calcShaftPart(doorWidthInches, shaftType, doorModelDesc) {

    const shaftLength = (Number(doorWidthInches) || 0) + 10;
    const doorModel = String(doorModelDesc || "").toUpperCase();

    if (doorModel === "STILO") {

        if (shaftType === "T") {
            if (shaftLength <= 108) return "950-229";
            if (shaftLength <= 120) return "950-230";
            if (shaftLength <= 132) return "950-231";
            if (shaftLength <= 156) return "950-232";
            if (shaftLength <= 180) return "950-233";
            if (shaftLength <= 204) return "950-234";
            if (shaftLength <= 228) return "950-235";
            if (shaftLength <= 252) return "950-236";
        }
        else if (shaftType === "K") {
            if (shaftLength <= 108) return "950-259";
            if (shaftLength <= 132) return "950-261";
            if (shaftLength <= 156) return "950-262";
            if (shaftLength <= 180) return "950-263";
            if (shaftLength <= 204) return "950-264";
            if (shaftLength <= 228) return "950-265";
            if (shaftLength <= 252) return "950-266";
        }

        return null;
    }

    if (shaftType === "T") {
        if (shaftLength <= 108) return "950-239";
        if (shaftLength <= 120) return "950-240";
        if (shaftLength <= 132) return "950-241";
        if (shaftLength <= 156) return "950-242";
        if (shaftLength <= 180) return "950-243";
        if (shaftLength <= 204) return "950-244";
        if (shaftLength <= 228) return "950-245";
        if (shaftLength <= 252) return "950-246";
    }
    else if (shaftType === "K") {
        if (shaftLength <= 111) return "950-259";
        if (shaftLength <= 135) return "950-261";
        if (shaftLength <= 159) return "950-262";
        if (shaftLength <= 183) return "950-263";
        if (shaftLength <= 207) return "950-264";
        if (shaftLength <= 231) return "950-265";
        if (shaftLength <= 255) return "950-266";
    }

    return null;
}

/* Track bundle description */
function calcTrackBundle({
    productId,
    doorWidthFeet,
    doorWidthInches,
    doorHeightFeet,
    doorHeightInches,
    liftHwdesc,
    doorModelDesc,
    endCaps,
    springCycle,
    highlift
}) {

    const widthInches =
        String(doorWidthInches) === "0" ? "" : "-" + doorWidthInches;

    const liftType = liftHwdesc || "";
    const hwType = "+";
    const endStiles = ["double", "Y"].includes(endCaps) ? "DE" : "";

    let doorModel = "";
    let cycle = "";
    let hiLift = "";

    if (String(productId) == TRACK_LANDMARK_PRODUCT_ID) {
        doorModel = doorModelDesc || "";
        cycle = springCycle || "";
        hiLift = liftType === "I" ? highlift : "";
    } else {
        doorModel = "Stilo";
        cycle = "20M";
        hiLift = liftType === "HL" ? highlift : "";
    }

    return [
        "TB",
        `${doorWidthFeet}${widthInches}x${doorHeightFeet}-${doorHeightInches}`,
        doorModel,
        hiLift,                 // included only if not empty
        `${liftType}${hwType}`,
        endStiles,              // included only if not empty
        cycle
    ]
        .filter(v => v)         // removes "", null, undefined, 0
        .join(" ");
}

function calcTrackSetInputHl(liftType, doorHeight, highlift) {

    if (!isTrackHighLift(liftType)) {
        return "NONE";
    }

    if (doorHeight <= 84 && highlift <= 54) return "7-2790";
    if (doorHeight <= 96 && highlift <= 23) return "7-2791";
    if (doorHeight <= 96 && highlift <= 54) return "7-2790";
    if (doorHeight <= 108 && highlift <= 23) return "7-2792";
    if (doorHeight <= 108 && highlift <= 35) return "7-2791";
    if (doorHeight <= 108 && highlift <= 54) return "7-2790";
    if (doorHeight <= 120 && highlift <= 23) return "7-2793";
    if (doorHeight <= 120 && highlift <= 35) return "7-2792";
    if (doorHeight <= 120 && highlift <= 47) return "7-2791";
    if (doorHeight <= 120 && highlift <= 54) return "7-2790";

    return null;
}

function calcTrackSetInput(liftType, liftTrackCode, doorWidthFeet, doorHeight) {

    if (!isTrackHighLift(liftType)) {
        return "NONE";
    }

    const trackSetDoorType = doorWidthFeet < 12 ? "SC" : "DC";

    return `${doorHeight}-${liftTrackCode || ""}-${trackSetDoorType}`;
}

function calcUpperVerticalTracks(liftType, highlift) {

    if (!isTrackHighLift(liftType)) {
        return "NONE";
    }

    return highlift <= 37 ? "7-2786" : "7-2789";
}

function calcLowerVerticalTracks(liftType, doorHeight) {

    if (!isTrackHighLift(liftType)) {
        return "NONE";
    }

    if (doorHeight <= 7 * 12) return "7-2780P";
    if (doorHeight <= 8 * 12) return "7-2781P";
    if (doorHeight <= 9 * 12) return "7-2782";
    if (doorHeight <= 10 * 12) return "7-2783";

    return null;
}


/* ---------- Springs ---------- */

/* Request body for the spring API (same data as before) */
function buildSpringRequest({
    weight,
    height,
    width,
    liftNumval,
    liftRadius,
    highlift
}) {

    const doorData = {
        DOOR_WEIGHT: String(weight ?? 240.03),
        DOOR_HEIGHT: "" + height,
        DOOR_WIDTH: "" + width,
        BORE_SIZE: "1.0",
        CYCLES: "10",
        SPRING_GALVANIZED: "1.0",
        COUPLINGS_QTY: "0",
        LIFT_TYPE: liftNumval || "",
        HILIFT: highlift + "",
        SPRING_QTY: "2",
        CYCLE_FACTOR: "1.131"
    };

    const drumData = {
        DRUM_HM_ARM: "2.215",
        DRUM_FM_ARM: "2.0",
        DRUM_CABLE_DIA: "0.125",
        DRUM_CIRCUMFERENCE: "12.56637",
        DRUM_WIDTH: "2.63",
        DRUM_RORISE_VALUE: "0.21875"
    };

    // ?? keeps "0" (High Lift / Vertical radius) – || would drop it
    const trackData = {
        TRACK_RADIUS: liftRadius ?? "",
        TRACK_ANGLE: "0.0"
    };

    return {
        door: doorData,
        drum: drumData,
        track: trackData
    };
}

/* POST to the spring API – jQuery if available, fetch otherwise */
async function postSpringRequest(body) {

    if (typeof $ === "function" && typeof $.ajax === "function") {
        return $.ajax({
            method: "POST",
            url: "/spr/custom/jpoc/json/1568356027",
            data: body,
            dataType: "json",
            contentType: "text/plain",
            processData: false,
            headers: { LOG: true }
        });
    }

    const response = await fetch("/spr/custom/jpoc/json/1568356027", {
        method: "POST",
        headers: {
            "Content-Type": "text/plain",
            LOG: "true"
        },
        body
    });

    return response.json();
}

/* Calls the API and picks the best solution (same filter + sort).
   fallback is returned on any problem. */
async function fetchSpringSolution(request, doorWidthInches, fallback) {

    if (JSON.stringify(request.door).includes("NaN")) {
        console.warn(
            "Spring calculation skipped due to NaN values",
            request.door
        );
        return fallback;
    }

    let solutions;

    try {
        solutions = await postSpringRequest(JSON.stringify(request));
    } catch (err) {
        console.log("Spring API failed", err);
        return fallback;
    }

    if (!Array.isArray(solutions)) {
        console.warn("Spring API returned invalid response", solutions);
        return fallback;
    }

    const doorWidth = Number(doorWidthInches) || 0;

    // Remove invalid spring solutions
    solutions = solutions.filter(
        (a) =>
            // Only two valid diameters / quantities
            (a.COIL_DIAMETER === 2 || a.COIL_DIAMETER === 2.625) &&
            a.QUANTITY <= 2 &&
            // 2" ID springs only valid if the length is less than 42"
            !(
                (a.COIL_DIAMETER === 2 && Math.round(a.SPRING_LENGTH_RH) >= 42) ||
                (a.COIL_DIAMETER === 2 && Math.round(a.SPRING_LENGTH_LH) >= 42)
            ) &&
            // Max gauge for 2" springs is 2.2625
            !(a.COIL_DIAMETER === 2 && a.WIRE_SIZE > 2.2625) &&
            // Max door width for single spring solutions is 12'
            !(doorWidth >= 144 && a.QUANTITY == 1)
    );

    // Closest to 20k cycles, prefer single spring over double spring
    solutions.sort((a, b) => {
        if ((b.MIP > 410 || b.MIP_LH > 410) && b.QUANTITY === 1) return -1;
        const cycleLifeDiff =
            Math.abs(a.CYCLE_LIFE - 20) - Math.abs(b.CYCLE_LIFE - 20);
        if (Math.abs(cycleLifeDiff) < 0.005 && a.COIL_DIAMETER !== b.COIL_DIAMETER)
            return a.COIL_DIAMETER - b.COIL_DIAMETER;
        if (a.COIL_DIAMETER === b.COIL_DIAMETER && a.QUANTITY !== b.QUANTITY)
            return a.QUANTITY - b.QUANTITY;
        return cycleLifeDiff;
    });

    if (!solutions.length) {
        console.warn("No valid spring solutions found");
        return fallback;
    }

    return solutions[0];
}

/* Spring output fields from one solution (same rules as the
   original addLogic bodies, with guards for missing values) */
function calcSpringOutputs(solution) {

    const s = solution || {};

    const bulkSpringQty = s.COIL_DIAMETER === 2 ? "" : s.QUANTITY;

    return {
        SPRING_RH: s.SPRING_RH ? s.SPRING_RH.replace("R0E", "R1E") : "",
        SPRING_LH: s.SPRING_LH ? s.SPRING_LH.replace("R0E", "R1E") : "",

        BULK_SPRING_QTY: bulkSpringQty,
        INCLUDE_SPRING_CUT_INSTR: (bulkSpringQty > 0).toString().toUpperCase(),

        CUT_INSTR_RH_SPRINGS:
            typeof s.SPRING_LENGTH_RH === "number"
                ? `Cut Springs to ${s.SPRING_LENGTH_RH.toFixed(0)}"`
                : "",

        // Original checks SPRING_LENGTH_RH, then prints the LH length
        CUT_INSTR_LH_SPRINGS:
            s.SPRING_LENGTH_RH && typeof s.SPRING_LENGTH_LH === "number"
                ? `Cut Springs to ${s.SPRING_LENGTH_LH.toFixed(0)}"`
                : "",

        SPRING_LH_QTY: s.HIGH_LH,
        SPRING_RH_QTY: s.HIGH_RH,

        BULK_SPRING_RH: s.BULK_SPRING_RH ?? "",
        BULK_SPRING_LH: s.BULK_SPRING_LH ?? "",

        SPRING_RH_DESC: s.SPRING_RH_DESC,
        SPRING_LH_DESC: s.SPRING_LH_DESC
    };
}


/* ==========================================================
   EW ACCESS (shared by both paths)
========================================================== */

function getEwTrackElement(id) {
    return document.getElementById(id) ||
        (document.ui && document.ui[id]) ||
        null;
}

/* EW node store – bare "nodeset" (let/const) or window.nodeset */
function getTrackNodeset() {
    if (typeof nodeset !== "undefined" && nodeset) {
        return nodeset;
    }
    return window.nodeset || null;
}

/* Landmark React page: values come from runTrackBundle() only.
   #react-root covers the case where GL_PRODUCT_ID is not loaded
   yet when addTrackDrivers() runs. */
function isLandmarkReactPage() {

    let productId = "";

    try {
        if (typeof getState === "function") {
            productId = getState("GL_PRODUCT_ID") || "";
        }
    } catch (err) {
        productId = "";
    }

    if (!productId) {
        productId = getEwTrackElement("GL_PRODUCT_ID")?.value || "";
    }

    return (
        String(productId) === TRACK_LANDMARK_PRODUCT_ID ||
        !!document.getElementById("react-root")
    );
}


/* ==========================================================
   1) OTHER PRODUCTS – react-wilcox (unchanged behaviour)
   Same node ids and dependency lists as the original file.
========================================================== */

/* Lift type option attribute (old radio / select) */
function getSelectedLiftAttr(attr) {
    const selected = getSelected("LIFT_TYPE");
    return selected ? (selected.getAttribute(attr) || "") : "";
}

/* Door model desc for the shaft / bundle (original lookup) */
function getTrackDoorModelDesc() {

    if (getState("GL_PRODUCT_ID") == TRACK_LANDMARK_PRODUCT_ID) {
        const selectedModel = getSelected("DOOR_MODEL");
        return selectedModel?.getAttribute("desc") || "";
    }

    return "STILO";
}

/* Sets this.value only when the calculation has a result
   (original behaviour: no matching range = keep the value) */
function setIfResult(node, value) {
    if (value !== null && value !== undefined) {
        node.value = value;
    }
}

function addTrackDrivers() {

    // No react-wilcox, or Landmark React -> runTrackBundle() handles it.
    // Registering here would overwrite the values written by React.
    if (typeof addLogic !== "function") {
        if (TRACK_DEBUG) console.log("[TrackBundle] addTrackDrivers skipped: addLogic not available");
        return;
    }

    if (isLandmarkReactPage()) {
        if (TRACK_DEBUG) console.log("[TrackBundle] addTrackDrivers skipped: Landmark React page (runTrackBundle is used)");
        return;
    }

    if (TRACK_DEBUG) console.log("[TrackBundle] addTrackDrivers: registering addLogic rules");

    // Removes the shaft from the bundle
    addLogic("SHAFT_LOCATION", function () {
        this.value = calcShaftLocation(getState("WIDTH"));
    }, ["WIDTH"]);

    // Shaft driver
    addLogic("SHAFT_L1_PART", function () {
        setIfResult(this, calcShaftPart(
            getGlobalDoorWidth(),
            getState("SHAFT_TYPE"),
            getTrackDoorModelDesc()
        ));
    }, ["WEIGHT", "WIDTH", "SHAFT_TYPE", "GL_PRODUCT_ID", "DOOR_MODEL"]);

    // Track bundle
    addLogic("TRACK_BUNDLE", function () {

        const productId = getState("GL_PRODUCT_ID");
        const isLandmark = productId == TRACK_LANDMARK_PRODUCT_ID;

        this.value = calcTrackBundle({
            productId,
            doorWidthFeet: getState("DOOR_WIDTH_FEET"),
            doorWidthInches: getState("DOOR_WIDTH_INCHES"),
            doorHeightFeet: getState("DOOR_HEIGHT_FEET"),
            doorHeightInches: getState("DOOR_HEIGHT_INCHES"),
            liftHwdesc: getSelectedLiftAttr("hwdesc"),
            doorModelDesc: isLandmark
                ? (getSelected("DOOR_MODEL")?.getAttribute("desc") || "")
                : "",
            endCaps: getState("END_CAPS"),
            springCycle: getState("SPRING_CYCLE"),
            highlift: getState("HIGHLIFT")
        });

    }, ["HEIGHT", "LIFT_TYPE", "WIDTH", "HIGHLIFT", "END_CAPS", "GL_PRODUCT_ID", "DOOR_MODEL", "SPRING_CYCLE"]);

    addLogic("TRACK_SET_INPUT_HL", function () {
        setIfResult(this, calcTrackSetInputHl(
            getState("LIFT_TYPE"),
            getGlobalDoorHeight(),
            getState("HIGHLIFT")
        ));
    }, ["HEIGHT", "LIFT_TYPE", "HIGHLIFT"]);

    addLogic("TRACK_SET_INPUT", function () {
        this.value = calcTrackSetInput(
            getState("LIFT_TYPE"),
            getSelectedLiftAttr("trackcode"),
            getState("DOOR_WIDTH_FEET"),
            getGlobalDoorHeight()
        );
    }, ["LIFT_TYPE", "WIDTH", "HEIGHT"]);

    addLogic("UPPER_VERTICAL_TRACKS", function () {
        this.value = calcUpperVerticalTracks(
            getState("LIFT_TYPE"),
            getHiLift()
        );
    }, ["HIGHLIFT", "LIFT_TYPE"]);

    addLogic("LOWER_VERTICAL_TRACKS", function () {
        setIfResult(this, calcLowerVerticalTracks(
            getState("LIFT_TYPE"),
            getGlobalDoorHeight()
        ));
    }, ["HEIGHT", "LIFT_TYPE"]);

    // Springs
    addNode(
        {
            id: "SPRING_SOLUTION",
            logic: async function () {
                cacheDebounce(this);
            },
            debounce: getSpringSolutionsRW,
            value: { ...TRACK_DEFAULT_SPRING_SOLUTION }
        },
        ["GLAZING_TYPE", "WEIGHT", "HEIGHT", "LIFT_TYPE", "HIGHLIFT", "WINDOWS", "GL_PRODUCT_ID"]
    );

    // Every spring output reads the same solution
    [
        "SPRING_RH",
        "SPRING_LH",
        "BULK_SPRING_QTY",
        "CUT_INSTR_RH_SPRINGS",
        "SPRING_LH_QTY",
        "SPRING_RH_QTY",
        "BULK_SPRING_RH",
        "BULK_SPRING_LH",
        "CUT_INSTR_LH_SPRINGS",
        "SPRING_RH_DESC",
        "SPRING_LH_DESC"
    ].forEach(id => {
        addLogic(id, function () {
            this.value = calcSpringOutputs(getState("SPRING_SOLUTION"))[id];
        }, ["SPRING_SOLUTION"]);
    });

    // Original: depends on BULK_SPRING_QTY, not on the solution
    addLogic("INCLUDE_SPRING_CUT_INSTR", function () {
        this.value = (getState("BULK_SPRING_QTY") > 0).toString().toUpperCase();
    }, ["BULK_SPRING_QTY"]);
}

/* Original name kept – the SPRING_SOLUTION node (and maybe other
   files) call it without arguments. */
async function getSpringSolutionsRW() {

    const request = buildSpringRequest({
        weight: getState("WEIGHT"),
        height: getState("HEIGHT"),
        width: getState("WIDTH"),
        liftNumval: getSelectedLiftAttr("numval"),
        liftRadius: getSelectedLiftAttr("radius"),
        highlift: getState("HIGHLIFT")
    });

    return fetchSpringSolution(
        request,
        getGlobalDoorWidth(),
        getState("SPRING_SOLUTION")
    );
}


/* ==========================================================
   2) LANDMARK REACT – called on Configure
      await window.runTrackBundle(input)

   input:
   {
       productId:        "162059085",
       doorWidthFeet,    doorWidthInches,
       doorHeightFeet,   doorHeightInches,
       width,            height,          // total inches
       doorModelDesc:    "Cls" | "Prem" | "Grd",
       liftType:         "STD15" | "HL" | "LHF" ...
       liftHwdesc,                        // old "hwdesc" attribute
       liftTrackCode,                     // old "trackcode" attribute
       liftNumval,                        // old "numval" attribute
       liftRadius,                        // old "radius" attribute
       highlift,
       shaftType:        "T" | "K",
       endCaps:          "N" | "Y",
       springCycle:      "10K" | "20K",
       weight
   }
========================================================== */

/* Write the value to the node AND the input, no change event */
function setEwTrackValue(id, value) {

    const element = getEwTrackElement(id);
    const store = getTrackNodeset();
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

/* Track / shaft values (no API call) */
function getTrackBundleValues(input = {}) {

    const n = v => Number(v) || 0;

    const productId = String(input.productId ?? TRACK_LANDMARK_PRODUCT_ID);

    // Total inches – from React (input) or the global functions
    const width = n(input.width ?? (typeof getGlobalDoorWidth === "function" ? getGlobalDoorWidth() : 0));
    const height = n(input.height ?? (typeof getGlobalDoorHeight === "function" ? getGlobalDoorHeight() : 0));

    const liftType = input.liftType || "";
    const highlift = n(input.highlift);

    // Landmark: no match -> clear the field (no stale value)
    const orEmpty = v => (v === null || v === undefined ? "" : v);

    return {
        SHAFT_LOCATION: calcShaftLocation(width),

        SHAFT_L1_PART: orEmpty(calcShaftPart(
            width,
            input.shaftType || "",
            input.doorModelDesc || ""
        )),

        TRACK_BUNDLE: calcTrackBundle({
            productId,
            doorWidthFeet: input.doorWidthFeet ?? "",
            doorWidthInches: input.doorWidthInches ?? 0,
            doorHeightFeet: input.doorHeightFeet ?? "",
            doorHeightInches: input.doorHeightInches ?? 0,
            liftHwdesc: input.liftHwdesc || "",
            doorModelDesc: input.doorModelDesc || "",
            endCaps: input.endCaps || "",
            springCycle: input.springCycle || "",
            highlift: input.highlift ?? ""
        }),

        TRACK_SET_INPUT_HL: orEmpty(calcTrackSetInputHl(liftType, height, highlift)),

        TRACK_SET_INPUT: calcTrackSetInput(
            liftType,
            input.liftTrackCode || "",
            n(input.doorWidthFeet),
            height
        ),

        UPPER_VERTICAL_TRACKS: calcUpperVerticalTracks(liftType, highlift),

        LOWER_VERTICAL_TRACKS: orEmpty(calcLowerVerticalTracks(liftType, height))
    };
}


/* ==========================================================
   DEBUG – verification table
========================================================== */

// Last calculated values (used by window.verifyTrackBundle)
let trackLastValues = null;

/* One row per output id:
   calculated | node (nodeset) | input (DOM) | status */
function verifyTrackValues(expected, label) {

    if (!TRACK_DEBUG || !expected) {
        return [];
    }

    const store = getTrackNodeset();
    const rows = {};
    const problems = [];

    TRACK_OUTPUT_IDS.forEach(id => {

        const calculated = expected[id] ?? "";
        const node = store && store[id] ? store[id].value : undefined;
        const element = getEwTrackElement(id);
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
        `[TrackBundle] ${label} – ${problems.length ? problems.length + " problem(s)" : "all OK"}`
    );
    console.table(rows);
    if (problems.length) {
        console.warn("[TrackBundle] Problem ids:", problems);
    }
    console.groupEnd();

    return problems;
}

/* Console: window.verifyTrackBundle() – check again any time */
function verifyTrackBundle() {

    if (!trackLastValues) {
        console.warn("[TrackBundle] runTrackBundle() has not run yet.");
        return [];
    }

    return verifyTrackValues(trackLastValues, "manual check");
}


/* ==========================================================
   LANDMARK – run
========================================================== */

/* Track values + spring API -> EW inputs */
async function runTrackBundle(input = {}) {

    const n = v => Number(v) || 0;

    if (TRACK_DEBUG) {
        console.groupCollapsed("[TrackBundle] runTrackBundle input");
        console.table(input);
        console.groupEnd();
    }

    const values = getTrackBundleValues(input);

    const width = n(input.width ?? (typeof getGlobalDoorWidth === "function" ? getGlobalDoorWidth() : 0));
    const height = n(input.height ?? (typeof getGlobalDoorHeight === "function" ? getGlobalDoorHeight() : 0));

    const weight =
        input.weight === undefined || input.weight === null || input.weight === ""
            ? (getEwTrackElement("WEIGHT")?.value || undefined)
            : input.weight;

    const store = getTrackNodeset();

    const currentSolution =
        store?.SPRING_SOLUTION?.value &&
        typeof store.SPRING_SOLUTION.value === "object"
            ? store.SPRING_SOLUTION.value
            : { ...TRACK_DEFAULT_SPRING_SOLUTION };

    const request = buildSpringRequest({
        weight,
        height,
        width,
        liftNumval: input.liftNumval || "",
        liftRadius: input.liftRadius ?? "",
        highlift: input.highlift ?? ""
    });

    if (TRACK_DEBUG) {
        console.groupCollapsed("[TrackBundle] spring API request");
        console.table({ ...request.door, ...request.track });
        console.groupEnd();
    }

    const solution = await fetchSpringSolution(request, width, currentSolution);

    if (TRACK_DEBUG) {
        console.log(
            "[TrackBundle] spring solution:",
            solution === currentSolution ? "(fallback – API not used)" : "(from API)",
            solution
        );
    }

    Object.assign(values, calcSpringOutputs(solution));

    const missing = [];

    Object.keys(values).forEach(id => {
        if (!setEwTrackValue(id, values[id])) {
            missing.push(id);
        }
    });

    // SPRING_SOLUTION is an object – nodeset only, never a text input
    if (store && store.SPRING_SOLUTION) {
        store.SPRING_SOLUTION.value = solution;
    }

    if (missing.length) {
        console.warn("[TrackBundle] EW inputs not found:", missing);
    }

    trackLastValues = { ...values };

    // Right after writing
    verifyTrackValues(values, "after write");

    // 1 s later – shows if another rule overwrote a value
    if (TRACK_DEBUG) {
        setTimeout(() => {
            verifyTrackValues(values, "1 s later (overwritten?)");
        }, 1000);
    }

    return { values, solution, missing };
}

/* Assembled / Raw panel or no hardware set */
function clearTrackBundle() {

    const values = {
        SHAFT_LOCATION: "",
        SHAFT_L1_PART: "",
        TRACK_BUNDLE: "",
        TRACK_SET_INPUT_HL: "NONE",
        TRACK_SET_INPUT: "NONE",
        UPPER_VERTICAL_TRACKS: "NONE",
        LOWER_VERTICAL_TRACKS: "NONE",
        SPRING_RH: "",
        SPRING_LH: "",
        BULK_SPRING_QTY: "",
        INCLUDE_SPRING_CUT_INSTR: "FALSE",
        CUT_INSTR_RH_SPRINGS: "",
        CUT_INSTR_LH_SPRINGS: "",
        SPRING_LH_QTY: "",
        SPRING_RH_QTY: "",
        BULK_SPRING_RH: "",
        BULK_SPRING_LH: "",
        SPRING_RH_DESC: "",
        SPRING_LH_DESC: ""
    };

    const missing = [];

    Object.keys(values).forEach(id => {
        if (!setEwTrackValue(id, values[id])) {
            missing.push(id);
        }
    });

    trackLastValues = { ...values };

    verifyTrackValues(values, "cleared");

    return { values, missing };
}

/* React calls these through window */
window.runTrackBundle = runTrackBundle;
window.clearTrackBundle = clearTrackBundle;
window.getTrackBundleValues = getTrackBundleValues;
window.verifyTrackBundle = verifyTrackBundle;

if (TRACK_DEBUG) {
    console.log("[TrackBundle] TRACK_BUNDLE_CONTROLLER.js loaded");
}
