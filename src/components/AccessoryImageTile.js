import { useState } from "react";

const ACCESSORY_IMAGE_DIRECTORY =
    `${process.env.PUBLIC_URL}/images/accessories/`;

function AccessoryImageTile({
    accessoryName,
    imageFile
}) {
    const [imageUnavailable, setImageUnavailable] =
        useState(false);

    if (!imageFile) {
        return (
            <div className="image-placeholder-container advanced-accessory-image">
                <div className="no-image-message">
                    <span>No</span>
                    <span>Accessory</span>
                    <span>Selected</span>
                </div>
            </div>
        );
    }

    if (imageUnavailable) {
        return (
            <div className="image-placeholder-container advanced-accessory-image">
                <div className="no-image-message">
                    <span>Accessory image unavailable</span>
                </div>
            </div>
        );
    }

    return (
        <div className="image-placeholder-container advanced-accessory-image">
            <img
                className="rw-image-input-img"
                src={`${ACCESSORY_IMAGE_DIRECTORY}${encodeURIComponent(imageFile)}`}
                alt={accessoryName}
                onError={() => setImageUnavailable(true)}
            />
        </div>
    );
}

export default AccessoryImageTile;
