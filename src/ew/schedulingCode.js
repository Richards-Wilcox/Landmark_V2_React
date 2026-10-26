/* ==========================================================
   SCHEDULING CODE (runs on Configure)
   Port of addSchedulingCodeLogic() from SCHEDULING_CODE.js

   Needs SECTION_0x_SMARTCOM_CODE from the glazing code
   driver, so it runs AFTER glazingCodeLogic.

   Output: SECTION_01_SC_CODE ... SECTION_09_SC_CODE
========================================================== */

import { readEwValue } from "./ewSync";

export function getSchedulingValues(input, values) {

    const {
        panelStyle: face,
        selectedColor,
        doorInfoSections = [],
        endCaps = "N"
    } = input;

    // Original getSectionInfo(): BOTTOM -> TOP
    const sections = [...doorInfoSections].reverse();

    // Computed by the glazing code driver (drivenValues.js)
    const lmDoorModel = values.LM_DOOR_MODEL ?? "";
    const panelSpacing = values.PANEL_SPACING ?? "";

    // User input that is still EW-only (Advanced tab)
    const drill = readEwValue("DRILL") ?? "Y";

    const endCapsFlag = endCaps === "Y" ? 1 : 0;

    const out = {};

    for (let i = 0; i < 9; i++) {

        const field = `SECTION_0${i + 1}_SC_CODE`;
        const section = sections[i];

        if (!sections.length || section == null || section === "") {
            out[field] = "";
            continue;
        }

        // Bottom = 3, top = 1, middle = 2
        let panelSeq = 2;

        if (i === 0) {
            panelSeq = 3;
        } else if (i === sections.length - 1) {
            panelSeq = 1;
        }

        const glazed = section.enabled?.some(v => v) ? 1 : 0;
        const btmRetainer = i === 0 ? 1 : 0;
        const scCode = values[`SECTION_0${i + 1}_SMARTCOM_CODE`] ?? "";
        const widthCode = `${section.height}-R${selectedColor}`;
        const panelPerSb = 1;

        out[field] = [
            lmDoorModel,
            face,
            selectedColor,
            drill,
            `${face}${panelSpacing}`,
            glazed,
            btmRetainer,
            endCapsFlag,
            panelSeq,
            scCode,
            widthCode,
            panelPerSb
        ].join(",");
    }

    return out;
}
