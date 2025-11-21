sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/Device",
  ],
  function (UIComponent, JSONModel, ResourceModel, Device) {
    "use strict";

    return UIComponent.extend("sap.quickstart.Component", {
      metadata: {
        interfaces: ["sap.ui.core.IAsyncContentCreation"],
        // below is now declared in manifest.json file
        // rootView: {
        //   viewName: "ui5.quickstart.view.App",
        //   type: "XML",
        //   id: "app",
        // },
        manifest: "json",
      },
      init() {
        UIComponent.prototype.init.apply(this, arguments);

        const oData = {
          recipient: {
            name: "",
          },
        };
        const oModel = new JSONModel(oData);
        this.setModel(oModel, "oComponentModel");

        // const i18n = new ResourceModel({
        //   bundleName: "ui5.quickstart.i18n.i18n",
        // });
        // this.setModel(i18n, "i18n");
        this.getRouter().initialize();

        const oDeviceModel = new JSONModel(Device);
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.setModel(oDeviceModel, "device");
      },
      getContentDensityClass() {
        return Device.support.touch ? "sapUiSizeCozy" : "sapUiSizeCompact";
      },
    });
  }
);
