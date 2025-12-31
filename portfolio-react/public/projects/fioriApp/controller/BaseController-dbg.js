sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/ui/core/Fragment"],
  function (Controller, MessageBox, Fragment) {
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
      async onInfoIconPress(oEvent) {
        const oButton = oEvent.getSource();
        this._oInfoPopup ??= await Fragment.load({
          name: "sap.dashboard.fragment.InfoPopup",
        });
        if (!this._oInfoPopup.isOpen()) {
          this.getView().addDependent(this._oInfoPopup);
          this._oInfoPopup.openBy(oButton);
        } else {
          this._oInfoPopup.close();
        }
      },
    });
  }
);
