/* ==========================================================
   PRICE (LIVE)
   Port of getPrice() from PRICE_CONTROLLER.js:
   DOOR_FACE_PRICE, GLAZING_PRICE, PRICE, PRICE_DISPLAY
========================================================== */

import { useEffect, useState } from "react";

/* ----------------------------------------------------------
   PRICEBOOK (original loadPricebook)
---------------------------------------------------------- */

// export function usePricebook() {

//     const [pricebook, setPricebook] = useState(
//         window.PRICEBOOK_CACHE || {}
//     );

//     useEffect(() => {

//         const customerName = encodeURIComponent(
//             document.ui?.DC_CUSTOMER_NAME?.value || ""
//         );

//         fetch(`/spr/custom/jpoc/json/1728612690?customer=${customerName}`, {
//             method: "POST"
//         })
//             .then(res => res.json())
//             .then(res => {
//                 const book = Array.isArray(res) ? (res[0] || {}) : (res || {});
//                 window.PRICEBOOK_CACHE = book;
//                 setPricebook(book);
//             })
//             .catch(err => {
//                 console.error("Pricebook load failed:", err);
//             });

//     }, []);

//     return pricebook;
// }

/* ----------------------------------------------------------
   PRICEBOOK (original loadPricebook)
   - Cached per customer in sessionStorage (30 min)
   - One shared request (no duplicate calls)
---------------------------------------------------------- */

const PRICEBOOK_URL = "/spr/custom/jpoc/json/1728612690";
const PRICEBOOK_TTL = 30 * 60 * 1000; // 30 minutes

const pricebookRequests = {};

const getCustomerName = () =>
    document.ui?.DC_CUSTOMER_NAME?.value || "";

const getCacheKey = (customer) => `RW_PRICEBOOK_${customer}`;

const readCachedPricebook = (customer) => {

    try {

        const cached = JSON.parse(
            sessionStorage.getItem(getCacheKey(customer)) || "null"
        );

        if (cached && Date.now() - cached.time < PRICEBOOK_TTL) {
            return cached.book;
        }

    } catch (err) {
        // Ignore broken cache
    }

    return null;
};

const loadPricebook = (customer) => {

    if (!pricebookRequests[customer]) {

        pricebookRequests[customer] = fetch(
            `${PRICEBOOK_URL}?customer=${encodeURIComponent(customer)}`,
            { method: "POST" }
        )
            .then(res => res.json())
            .then(res => {

                const book = Array.isArray(res) ? (res[0] || {}) : (res || {});

                try {
                    sessionStorage.setItem(
                        getCacheKey(customer),
                        JSON.stringify({ time: Date.now(), book })
                    );
                } catch (err) {
                    // Storage full / disabled – keep in memory only
                }

                return book;
            })
            .catch(err => {
                delete pricebookRequests[customer];
                throw err;
            });
    }

    return pricebookRequests[customer];
};

export function usePricebook() {

    const [pricebook, setPricebook] = useState(() =>
        window.PRICEBOOK_CACHE ||
        readCachedPricebook(getCustomerName()) ||
        {}
    );

    useEffect(() => {

        const customer = getCustomerName();
        const cached = readCachedPricebook(customer);

        if (cached) {
            window.PRICEBOOK_CACHE = cached;
            setPricebook(cached);
            return undefined;
        }

        let active = true;

        loadPricebook(customer)
            .then(book => {
                window.PRICEBOOK_CACHE = book;

                if (active) {
                    setPricebook(book);
                }
            })
            .catch(err => {
                console.error("Pricebook load failed:", err);
            });

        return () => {
            active = false;
        };

    }, []);

    return pricebook;
}


/* ----------------------------------------------------------
   PRICES
---------------------------------------------------------- */

const priceOf = (pricebook, code) => Number(pricebook[code]) || 0;

export function getDoorFacePrice({ width, height, doorModel }) {

    const sqft = (Number(width) / 12) * (Number(height) / 12);
    const rate = doorModel === "A" ? 66.66 : 77.77;

    return +(sqft * rate).toFixed(2);
}

export function getGlazingPrice({ glazing, totals, panelStyle, pricebook }) {

    if (glazing.WINDOW_1 === "None") {
        return 0;
    }

    const p = code => priceOf(pricebook, code);

    /* Mixed */

    if (panelStyle === "M") {

        const col = Number(totals.total_colonial_glass_qty) || 0;
        const rnc = Number(totals.total_ranch_glass_qty) || 0;

        return (
            p(glazing.WINDOW_1) * col + p(glazing.WINDOW_2) * rnc +
            p(glazing.INSERT_1) * col + p(glazing.INSERT_2) * rnc +
            p(glazing.EXTERIOR_FRAME_1) * col + p(glazing.EXTERIOR_FRAME_2) * rnc +
            p(glazing.INTERIOR_FRAME_1) * col + p(glazing.INTERIOR_FRAME_2) * rnc
        );
    }

    /* Standard + tempered */

    const standard = Number(totals.total_glass_qty) || 0;
    const tempered = Number(totals.total_temp_glass_qty) || 0;
    const allWindows = standard + tempered;

    let total =
        p(glazing.WINDOW_1) * standard +
        p(glazing.WINDOW_2) * tempered +
        p(glazing.INSERT_1) * allWindows;

    if (glazing.SLIM_YES_NO_FOR_FRAMES === "Y") {
        total += p(glazing.FRAME_KIT) * allWindows;
    } else {
        total += p(glazing.EXTERIOR_FRAME_1) * allWindows;
        total += p(glazing.INTERIOR_FRAME_1) * allWindows;
    }

    return total;
}

export function getPriceValues({
    width,
    height,
    doorModel,
    panelStyle,
    glazing,
    totals,
    pricebook
}) {

    const doorFacePrice = getDoorFacePrice({ width, height, doorModel });

    const glazingPrice = getGlazingPrice({
        glazing,
        totals,
        panelStyle,
        pricebook
    });

    // Hardware / operator prices are empty in the original too
    const price = doorFacePrice + glazingPrice;

    return {
        DOOR_FACE_PRICE: doorFacePrice,
        GLAZING_PRICE: glazingPrice,
        PRICE: price,
        PRICE_DISPLAY: "$" + (Number.isFinite(price) ? price : 0).toFixed(2)
    };
}
