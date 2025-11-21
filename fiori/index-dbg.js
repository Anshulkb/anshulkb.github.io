sap.ui.define(
  [
    "sap/m/Button",
    "sap/m/MessageToast",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/ComponentContainer",
  ],
  (Button, MessageToast, XMLView, ComponentContainer) => {
    "use strict";

    // new Button({
    //   text: "Ready...",
    //   press() {
    //     MessageToast.show("Hello World!");
    //   },

    // XMLView.create({
    //   viewName: "ui5.quickstart.view.App",
    // }).then((oView) => {
    //   oView.placeAt("content");

    // });
    // }
    // ).placeAt("content");

    new ComponentContainer({
      name: "ui5.quickstart",
      settings: {
        id: "quickstart",
      },
      async: true,
    }).placeAt("content");
  }
);
