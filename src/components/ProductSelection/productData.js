
import { PiGarage } from "react-icons/pi";
import { FaLayerGroup } from "react-icons/fa6";
import { FaThLarge } from "react-icons/fa";

const productData = [
    {
        value: "COMPLETE_DOOR",
        title: "Complete Door",
        description:
            "Door, hardware and operator configuration.",
        icon: PiGarage
    },
    {
        value: "ASSEMBLED_PANEL",
        title: "Assembled Panel",
        description:
            "Ready-to-assemble door sections.",
        icon: FaLayerGroup
    },
    {
        value: "RAW_PANEL",
        title: "Raw Panel",
        description:
            "Panel components only.",
        icon: FaThLarge
    }
];

export default productData;