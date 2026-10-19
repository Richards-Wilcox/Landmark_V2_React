// export function getTextureImage(
//     finish,
//     selectedColor
// ) {

//     if (
//         selectedColor === "X" ||
//         selectedColor === "Y"
//     ) {

//         return "/images/woodgrain_dark.png";

//     }

//     if (finish === "S") {

//         return "/images/stucco4.png";

//     }

//     return "/images/woodtexture_dark.png";

// }

const IMG = "/HTML/products/162059085/images/";

export function getTextureImage(finish, selectedColor) {
    if (selectedColor === "X" || selectedColor === "Y") return `${IMG}woodgrain_dark.png`;
    if (finish === "S") return `${IMG}stucco4.png`;
    return `${IMG}woodtexture_dark.png`;
}