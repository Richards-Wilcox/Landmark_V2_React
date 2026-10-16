import {
    BsHouseDoor,
    BsWindow,
    BsTools,
    BsLightning,
    BsSliders,
    BsInfoSquare,
} from "react-icons/bs";

import { PiGarage, PiSliders } from "react-icons/pi";
import { MdOutlineWindow } from "react-icons/md";
import { FaTools } from "react-icons/fa";

import "./NavigationTabs.css";

const tabs = [
    {
        id: "dimensions",
        title: "Door Model",
        icon: PiGarage
    },
    {
        id: "glazing",
        title: "Glazing",
        icon: MdOutlineWindow
    },
    {
        id: "hardware",
        title: "Hardware",
        icon: FaTools
    },
    {
        id: "operator",
        title: "Operator",
        icon: BsLightning
    },
    {
        id: "advanced",
        title: "Advanced",
        icon: PiSliders
    },
    {
        id: "annotations",
        title: "Annotations",
        icon: BsInfoSquare
    }
];

function NavigationTabs({
    activeTab,
    setActiveTab
}) {

    return (

        <div id="NAVIGATION_SPC">

            <div className="rw-configurator__select">

                {tabs.map(tab => {

                    const Icon = tab.icon;

                    return (

                        <div
                            key={tab.id}
                            className={
                                activeTab === tab.id
                                    ? "navigation-tab active"
                                    : "navigation-tab"
                            }
                            onClick={() =>
                                setActiveTab(
                                    tab.id
                                )
                            }
                        >

                            <label className="navigation-label">

                                <Icon
                                    size={18}
                                    className="navigation-icon"
                                />

                                {tab.title}

                            </label>

                        </div>

                    );

                })}

            </div>

        </div>

    );

}

export default NavigationTabs;