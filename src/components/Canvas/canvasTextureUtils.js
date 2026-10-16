export function getTextureImage(
    finish,
    selectedColor
) {

    if (
        selectedColor === "X" ||
        selectedColor === "Y"
    ) {

        return "/images/woodgrain_dark.png";

    }

    if (finish === "S") {

        return "/images/stucco4.png";

    }

    return "/images/woodtexture_dark.png";

}