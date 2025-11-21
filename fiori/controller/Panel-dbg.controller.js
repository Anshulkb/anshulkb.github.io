sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  function (Controller, MessageToast) {
    "use strict";
    return Controller.extend("ui5.quickstart.controller.Panel", {
      onPress() {
        //   MessageToast.show("Hello App!");
        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        const sRecipient = this.getView()
          // .getModel("oDefaultModel")
          .getModel("oComponentModel")
          .getProperty("/recipient/name");
        const sMsg = oBundle.getText("helloMsg", [sRecipient]);
        MessageToast.show(sMsg);
      },
      async onOpenDialog() {
        this.oDialog ??= await this.loadFragment({
          name: "ui5.quickstart.fragment.Dialog",
        });
        this.oDialog.open();
      },
      onCloseDialog() {
        this.oDialog.close();
      },
    });
  }
);
