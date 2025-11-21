sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
  ],
  (Controller, MessageToast, JSONModel, ResourceModel) => {
    "use strict";

    return Controller.extend("ui5.quickstart.App", {
      onInit() {
        //   const oData = {
        //     recipient: {
        //       name: "",
        //     },
        //   };
        //   const oModel = new JSONModel(oData);
        //   this.getView().setModel(oModel, "oDefaultModel");
        console.log(this.getOwnerComponent().getModel("invoice"));
      },
      // onPress() {
      //   //   MessageToast.show("Hello App!");
      //   const oBundle = this.getView().getModel("i18n").getResourceBundle();
      //   const sRecipient = this.getView()
      //     // .getModel("oDefaultModel")
      //     .getModel("oComponentModel")
      //     .getProperty("/recipient/name");
      //   const sMsg = oBundle.getText("helloMsg", [sRecipient]);
      //   MessageToast.show(sMsg);
      // },
      // onPress() {},
    });
  }
);
