import { useEffect } from "react";

/* ==========================================================
   EW / CONFIGUREONE DOM BRIDGE

   React never renders the EW inputs. It only:
   - READS current values of EW inputs  (readEwValue)
   - WRITES calculated values into them (writeEwValue / writeEwValues)
========================================================== */

const escape = (value) =>
    window.CSS && CSS.escape
        ? CSS.escape(String(value))
        : String(value).replace(/"/g, '\\"');

/* ----------------------------------------------------------
   READ: current value of an EW input (like getState)
   Returns null if the input is not on the page.
---------------------------------------------------------- */

export function readEwValue(id) {

    const element = document.getElementById(id);

    if (element) {

        const tag = element.tagName;
        const type = (element.getAttribute("type") || "").toLowerCase();

        if (tag === "INPUT" && type === "checkbox") {
            return element.checked ? (element.value || "Y") : "";
        }

        if (tag === "INPUT" && type === "radio") {
            return element.checked ? element.value : "";
        }

        if (
            tag === "INPUT" ||
            tag === "SELECT" ||
            tag === "TEXTAREA" ||
            tag === "OPTION"
        ) {
            return element.value;
        }

        return element.innerText;
    }

    const radios = document.querySelectorAll(
        `input[type="radio"][name="${escape(id)}"]`
    );

    if (!radios.length) {
        return null;
    }

    const checked = Array.from(radios).find(radio => radio.checked);

    return checked ? checked.value : "";
}

/* ----------------------------------------------------------
   WRITE: one value into one EW input
   Returns true if changed, false if unchanged, null if not found.
---------------------------------------------------------- */

export function writeEwValue(id, value, { fireChange = false } = {}) {

    const text =
        value === null || value === undefined
            ? ""
            : String(value);

    const element = document.getElementById(id);

    /* No element with this id: try a radio group with this name */

    if (!element) {

        const radios = document.querySelectorAll(
            `input[type="radio"][name="${escape(id)}"]`
        );

        if (!radios.length) {
            return null;
        }

        let changed = false;

        radios.forEach(radio => {

            const shouldCheck = radio.value === text;

            if (radio.checked !== shouldCheck) {
                radio.checked = shouldCheck;
                changed = true;
            }
        });

        if (changed && fireChange) {
            radios[0].dispatchEvent(new Event("change", { bubbles: true }));
        }

        return changed;
    }

    const tag = element.tagName;
    const type = (element.getAttribute("type") || "").toLowerCase();

    let changed = false;

    if (tag === "INPUT" && (type === "radio" || type === "checkbox")) {

        const shouldCheck =
            text === element.value ||
            text === "Y" ||
            text === "true";

        if (element.checked !== shouldCheck) {
            element.checked = shouldCheck;
            changed = true;
        }

    } else if (
        tag === "INPUT" ||
        tag === "SELECT" ||
        tag === "TEXTAREA" ||
        tag === "OPTION"
    ) {

        if (element.value !== text) {
            element.value = text;
            changed = true;
        }

    } else {

        if (element.innerText !== text) {
            element.innerText = text;
            changed = true;
        }
    }

    if (changed && fireChange) {
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    return changed;
}

/* ----------------------------------------------------------
   BATCH WRITE: used by the Configure button
   Returns the list of ids that were not found on the page.
---------------------------------------------------------- */

export function writeEwValues(values, options = {}) {

    const missing = [];

    Object.entries(values).forEach(([id, value]) => {

        if (writeEwValue(id, value, options) === null) {
            missing.push(id);
        }
    });

    return missing;
}

/* ----------------------------------------------------------
   HOOK: keep EW inputs in sync with live React values
---------------------------------------------------------- */

export function useEwSync(values, options = {}) {

    useEffect(() => {

        const missing = writeEwValues(values, options);

        if (missing.length) {
            console.warn("EW inputs not found:", missing);
        }

        // Console access (like getState in React-Wilcox)
        window.EW_LIVE_VALUES = values;

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [values]);
}
