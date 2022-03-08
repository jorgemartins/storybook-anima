import React from "react";
import { addons, types } from "@storybook/addons";
import { ADDON_ID, EXPORT_END, EXPORT_START } from "./constants";
import { ExportButton } from "./ExportButton";
import { authenticate, getStorybookToken, injectCustomStyles } from "./utils";
import { get } from "lodash";

addons.register(ADDON_ID, (api) => {
  const channel = api.getChannel();

  injectCustomStyles();

  // ON THE MAIN PAGE
  if (window.location === window.parent.location) {
    window.addEventListener(
      "message",
      (event) => {
        const source = get(event, "data.source", "");
        if (source === "anima") {
          const action = get(event, "data.action", "");
          const data = get(event, "data.data", {});

          switch (action) {
            case "export-start":
              channel.emit(EXPORT_START);
              break;
            case "export-end":
              channel.emit(EXPORT_END, { error: data.error });
              break;

            default:
              break;
          }
        }
      },
      false
    );

    const frame = document.createElement("iframe");
    Object.assign(frame.style, {
      width: "100%",
      height: "100%",
      border: "none",
      zIndex: -1,
      visibility: "hidden",
      position: "fixed",
    });

    // let exportButton: HTMLButtonElement | null;

    frame.onload = function () {
      // exportButton = frame.contentDocument.querySelector(
      //   "#export-button"
      // ) as HTMLButtonElement;
    };
    frame.src = window.location.href;
    document.body.appendChild(frame);

    channel.on("createStory", async ({ storyId }) => {
      console.log("createStory", storyId);
      const ev = new CustomEvent("change-story", { detail: { storyId } });
      frame.contentDocument.dispatchEvent(ev);
    });

    authenticate(getStorybookToken()).then((isAuthenticated) => {
      channel.emit("AUTH", isAuthenticated);
    });
  }

  addons.add(ADDON_ID, {
    title: "Anima",
    type: types.TOOL,
    match: () => true,
    render: () => <ExportButton api={api as any} />,
  });
});
