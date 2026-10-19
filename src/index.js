import React from "react";
import ReactDOM from "react-dom/client";

import "bootstrap/dist/css/bootstrap.min.css";

import App from "./App";

let mountNode = document.getElementById("root");

if (!mountNode) {

    mountNode =
        document.getElementById("react-root");

    if (!mountNode) {

        mountNode =
            document.createElement("div");

        mountNode.id = "react-root";

        mountNode.className =
            "react-root landmark-app";

        const configureOneContainer =
            document.querySelector(
                ".concept-ui-form.scrollable"
            );

        if (configureOneContainer) {

            configureOneContainer.appendChild(
                mountNode
            );

        } else {

            document.body.appendChild(
                mountNode
            );

        }

    }

}

const root =
    ReactDOM.createRoot(
        mountNode
    );

root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
