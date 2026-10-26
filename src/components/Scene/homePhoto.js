/* ==========================================================
   HOME PHOTO (upload your own home)
   - Validates + resizes the uploaded photo in the browser
   - Stored per configuration serial in sessionStorage
     (never sent to EW, cleared when the tab closes)

   ConfigureOne CSP is: img-src 'self' https://app.pendo.io
   -> data: and blob: images are BLOCKED in <img> / CSS.
   -> The photo is decoded with createImageBitmap and DRAWN
      on a <canvas> (PhotoCanvas.js). Canvas drawing is not
      affected by img-src.

   Photo object:
   {
       url:     data URL (JPEG) – storage only, never used in <img>,
       width:   image width  (px),
       height:  image height (px),
       opening: { x, y, width, height }  // garage door box (image px)
   }
========================================================== */

export const HOME_PHOTO_MAX_SIZE = 1600;              // longest side (px)
export const HOME_PHOTO_MAX_BYTES = 20 * 1024 * 1024; // 20 MB

// Any image is accepted. These extensions cover files whose
// MIME type is empty (e.g. HEIC on Windows).
const IMAGE_EXTENSIONS = [
    "jpg", "jpeg", "jfif", "pjpeg", "pjp",
    "png", "apng",
    "webp",
    "gif",
    "bmp", "dib",
    "svg", "svgz",
    "avif",
    "ico", "cur",
    "tif", "tiff",
    "heic", "heif"
];

// Formats most browsers (Chrome / Edge / Firefox) cannot open
const LIMITED_SUPPORT = ["heic", "heif", "tif", "tiff"];

const getExtension = (file) =>
    (file?.name || "").split(".").pop().toLowerCase();

const isImageFile = (file) =>
    (file?.type || "").startsWith("image/") ||
    IMAGE_EXTENSIONS.includes(getExtension(file));

/* ---------- Validate ---------- */

export function validateHomePhotoFile(file) {

    if (!file) {
        return "No file selected.";
    }

    if (!isImageFile(file)) {
        return "Please choose an image file.";
    }

    if (file.size > HOME_PHOTO_MAX_BYTES) {
        return "This photo is larger than 20 MB. Please choose a smaller photo.";
    }

    return "";
}

/* ---------- data URL -> Blob (no network, CSP safe) ---------- */

function dataUrlToBlob(dataUrl) {

    const [header, base64] = dataUrl.split(",");

    const mime = (header.match(/data:(.*?);/) || [])[1] || "image/jpeg";

    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    return new Blob([bytes], { type: mime });
}

/* ---------- Decode a stored photo for drawing (cached) ---------- */

const bitmapCache = new Map();
const BITMAP_CACHE_LIMIT = 4;

export function getPhotoBitmap(dataUrl) {

    if (!bitmapCache.has(dataUrl)) {

        const promise = createImageBitmap(dataUrlToBlob(dataUrl));

        // Drop the entry if decoding fails so it can be retried
        promise.catch(() => bitmapCache.delete(dataUrl));

        bitmapCache.set(dataUrl, promise);

        if (bitmapCache.size > BITMAP_CACHE_LIMIT) {
            bitmapCache.delete(bitmapCache.keys().next().value);
        }
    }

    return bitmapCache.get(dataUrl);
}

/* ---------- Read + resize an uploaded file ---------- */

// Fallback for files createImageBitmap can't read (e.g. some SVGs).
// Note: blocked by the ConfigureOne CSP, works on localhost.
function decodeWithImage(file) {

    return new Promise((resolve, reject) => {

        const reader = new FileReader();

        reader.onerror = () => reject(reader.error);

        reader.onload = () => {

            const img = new Image();

            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error("Image load failed (blocked by CSP?)"));

            img.src = reader.result;
        };

        reader.readAsDataURL(file);
    });
}

async function decodeFile(file) {

    try {

        const bitmap = await createImageBitmap(file);

        return {
            source: bitmap,
            width: bitmap.width,
            height: bitmap.height,
            release: () => bitmap.close?.()
        };

    } catch (bitmapError) {

        try {

            const img = await decodeWithImage(file);

            return {
                source: img,
                width: img.naturalWidth,
                height: img.naturalHeight,
                release: () => {}
            };

        } catch (imageError) {

            console.error(
                "Home photo could not be decoded:",
                file?.name,
                file?.type,
                bitmapError,
                imageError
            );

            throw imageError;
        }
    }
}

export async function readHomePhotoFile(file) {

    let decoded;

    try {
        decoded = await decodeFile(file);
    } catch (err) {

        const ext = getExtension(file);

        throw new Error(
            LIMITED_SUPPORT.includes(ext)
                ? `This browser can't open .${ext.toUpperCase()} photos. Please save it as JPG or PNG and try again.`
                : "This photo could not be opened. Please try another one."
        );
    }

    try {

        // SVGs without a size report 0 – use the max size
        const naturalW = decoded.width || HOME_PHOTO_MAX_SIZE;
        const naturalH = decoded.height || Math.round(HOME_PHOTO_MAX_SIZE * 0.66);

        const ratio = Math.min(
            1,
            HOME_PHOTO_MAX_SIZE / Math.max(naturalW, naturalH)
        );

        const width = Math.round(naturalW * ratio);
        const height = Math.round(naturalH * ratio);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        // White background: transparent PNG / GIF / SVG don't turn black as JPEG
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(decoded.source, 0, 0, width, height);

        return {
            url: canvas.toDataURL("image/jpeg", 0.85),
            width,
            height,
            opening: null
        };

    } catch (err) {

        console.error("Home photo could not be resized:", err);

        throw new Error("This photo could not be opened. Please try another one.");

    } finally {
        decoded.release();
    }
}

/* ---------- Storage (per configuration) ----------
   - Key = serial number (e.g. RW_HOME_PHOTO_C-695695)
   - sessionStorage: cleared when the tab / browser closes
   - Only ONE photo is kept: saving a photo for a serial removes
     photos of every other serial. 1000 configurations never
     fill the browser storage, and a new configuration
     (new serial) always starts with the default background. */

const STORAGE_PREFIX = "RW_HOME_PHOTO_";
const LEGACY_KEY = "RW_HOME_PHOTO"; // old localStorage version

const getStorageKey = (serial) => `${STORAGE_PREFIX}${serial}`;

// Remove every stored photo (all serials) + the old localStorage one
function removeAllPhotos() {

    try {

        Object.keys(sessionStorage)
            .filter(key => key.startsWith(STORAGE_PREFIX))
            .forEach(key => sessionStorage.removeItem(key));

        localStorage.removeItem(LEGACY_KEY);

    } catch (err) {
        // Storage disabled – nothing to clear
    }
}

/* Returns true when the photo will survive a refresh.
   No serial yet -> photo works for this visit only. */
export function saveHomePhoto(serial, photo) {

    removeAllPhotos();

    if (!serial) {
        return true;
    }

    try {
        sessionStorage.setItem(getStorageKey(serial), JSON.stringify(photo));
        return true;
    } catch (err) {
        return false;
    }
}

export function loadSavedHomePhoto(serial) {

    // Old version kept the photo forever in localStorage – drop it
    try {
        localStorage.removeItem(LEGACY_KEY);
    } catch (err) {
        // Ignore
    }

    if (!serial) {
        return null;
    }

    try {

        const photo = JSON.parse(
            sessionStorage.getItem(getStorageKey(serial)) || "null"
        );

        if (photo && photo.url && photo.width && photo.height && photo.opening) {
            return photo;
        }

    } catch (err) {
        // Ignore broken data
    }

    return null;
}

export function clearHomePhoto(serial) {

    try {

        if (serial) {
            sessionStorage.removeItem(getStorageKey(serial));
        }

    } catch (err) {
        // Ignore
    }
}

/* ---------- Current configuration serial ----------
   Reads the serial shown in the header (.serial-value,
   e.g. "C-695695"). If HeaderSection gets the serial from an
   EW input, read that input here instead – one line. */

export function getConfigSerial() {

    const element = document.querySelector("#react-root .serial-value");

    return (element?.textContent || "").trim();
}
