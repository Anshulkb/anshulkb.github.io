sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/Device",
  ],
  function (UIComponent, JSONModel, ResourceModel, Device) {
    "use strict";

    return UIComponent.extend("sap.dashboard.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        manifest: "json",
      },
      init() {
        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().initialize();

        const oDeviceModel = new JSONModel(Device);
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");
      },
    });
  }
);
