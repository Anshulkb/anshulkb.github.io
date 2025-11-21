sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
    "ui5/quickstart/models/formatter",
  ],
  function (Controller, History, MessageToast, formatter) {
    "use strict";
    return Controller.extend("ui5.quickstart.controller.Detail", {
      Formatter: formatter,
      //   core: sap.ui.getCore(),
      onInit() {
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter
          .getRoute("detail")
          .attachPatternMatched(this.onObjectMatched, this);
      },
      onObjectMatched(oEvent) {
        this.byId("rating").reset();
        this.getView().bindElement({
          path:
            "/" +
            window.decodeURIComponent(
              oEvent.getParameter("arguments").invoicePath
            ),
          model: "invoice",
        });
        // console.log(core.byId("rating"));
      },
      onNavBack() {
        const oHistory = History.getInstance();
        const sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          const oRouter = this.getOwnerComponent().getRouter();
          oRouter.navTo("overview", {}, true);
        }
      },
      onRatingChange(oEvent) {
        const fValue = oEvent.getParameter("value");
        const oResourceBundle = this.getView()
          .getModel("i18n")
          .getResourceBundle();
        MessageToast.show(
          oResourceBundle.getText("ratingConfirmation", [fValue])
        );
      },
    });
  }
);
