sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox"],
  function (Controller, MessageBox) {
    "use strict";
    return Controller.extend("sap.dashboard.controller.BaseController", {
      onInit() {},
      getNavContainer() {
        return this.getOwnerComponent()._container;
      },
      setNavContainer(oContainer) {
        this.getOwnerComponent()._container = oContainer;
      },
      showMessageBox(sType, sMsg) {
        MessageBox[sType](sMsg);
      },
      backToDashboard(sMsg, sDetails) {
        MessageBox.error(sMsg, {
          details: sDetails,
          contentWidth: "100px",
          onClose: () => {
            this.getSideNav().fireItemSelect();
          },
        });
      },
      setSideNav(oContainer) {
        this.getOwnerComponent()._oSideNav = oContainer;
      },
      getSideNav() {
        return this.getOwnerComponent()._oSideNav;
      },
    });
  }
);
