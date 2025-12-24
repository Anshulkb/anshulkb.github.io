sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/m/MessageBox",
    "sap/dashboard/model/Formatter",
    "sap/ui/core/BusyIndicator",
  ],
  function (BaseController, MessageBox, Formatter, BusyIndicator) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.EmpDetails", {
      formatter: Formatter,
      onInit() {
        this.getView().addEventDelegate({
          onBeforeShow: function (evt) {
            this.getOwnerComponent()
              .getModel("mainModel")
              .setProperty("/sPageTitle", "Employee Details");
            this.setDefaultData();
            this.getEmpDetails(evt.data.id);
          }.bind(this),
        });
      },
      setDefaultData() {
        const oModel = this.getOwnerComponent().getModel("empDetailModel");
        const oData = {
          details: {},
          isEditing: false,
          isDataModified: false,
          newDetails: {},
          isModified: false,
          aErrors: [],
        };
        oModel.setData(oData);
        this.getView().setModel(oModel, "detailsModel");
      },
      async getEmpDetails(sId) {
        try {
          const oModel = this.getView().getModel("detailsModel");
          BusyIndicator.show(0);
          const sUrl = `/api/users?id=${sId}`;
          const req = await fetch(sUrl);
          if (!req.ok) {
            throw new Error(`HTTP error ${req.status}`);
          }
          const oUserDet = await req.json();
          if (typeof oUserDet !== "object") {
            throw new Error(`Invalid format for employee details.`);
          }
          oModel.setProperty("/details", oUserDet);
        } catch (err) {
          MessageBox.error("Unable to fetch Employee details. " + err.message, {
            onClose: () => {
              this.onBackPress();
            },
          });
        } finally {
          BusyIndicator.hide();
        }
      },
      onBackPress() {
        this.getView().getModel("detailsModel").setData({});
        this.getNavContainer().back();
      },
      onClickEdit() {
        const oModel = this.getView().getModel("detailsModel");
        const oDetails = oModel.getProperty("/details");
        oModel.setProperty("/isEditing", true);
        oModel.setProperty("/newDetails", JSON.parse(JSON.stringify(oDetails)));
      },
      onClickSave() {
        const oModel = this.getView().getModel("detailsModel");
        const oNewDet = oModel.getProperty("/newDetails");
        const aErrors = oModel.getProperty("/aErrors");
        if (aErrors.length > 0) {
          this.showMessageBox("error", "Please check all the entered values.");
          return;
        }
        const oPayload = {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...oNewDet,
          }),
        };
        try {
          BusyIndicator.show(0);
          fetch(`/api/users?id=${oNewDet.id}`, oPayload)
            .then((res) => res.json())
            .then(() => {
              MessageBox.success("Data saved successfully.", {
                onClose: function () {
                  oModel.setProperty("/isEditing", false);
                  oModel.setProperty("/isModified", false);
                  oModel.setProperty("/details", oNewDet);
                  BusyIndicator.hide();
                },
              });
            });
        } catch (error) {
          this.showMessageBox("error", String(error));
        }
      },
      onClickCancel() {
        const oModel = this.getView().getModel("detailsModel");
        const bModified = oModel.getProperty("/isModified");
        const oDetails = oModel.getProperty("/details");
        if (bModified) {
          MessageBox.warning("All unsaved changes will be lost", {
            actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
            emphasizedAction: MessageBox.Action.OK,
            onClose: function (oAction) {
              if (oAction === "OK") {
                oModel.setProperty("/isEditing", false);
                oModel.setProperty("/isModified", false);
                oModel.setProperty("/details", oDetails);
              }
            },
          });
        } else oModel.setProperty("/isEditing", false);
      },
      onValueChange(oEvent) {
        const oModel = this.getView().getModel("detailsModel");
        const bModified = oModel.getProperty("/isModified");
        let aErrors = oModel.getProperty("/aErrors");
        const aDeepProperty = ["company", "address"];

        const sPath = oEvent.getSource().getBinding("value").getPath();
        const sDetProp = sPath.replace("newDetails", "details");
        const sValue = oEvent.getParameter("value").trim();
        const iValue = Number(sValue);
        const sProperty = aDeepProperty.includes(sPath.split("/")[2])
          ? sPath.split("/")[3] === "address"
            ? sPath.split("/")[4]
            : sPath.split("/")[3]
          : sPath.split("/")[2];

        const oValidations = {
          postalCode: () =>
            !Number.isInteger(iValue) || iValue <= 0 || sValue.length !== 5,
          stateCode: () => sValue.length !== 2,
          default: () => sValue === "",
        };
        const hasError = (oValidations[sProperty] || oValidations.default)();
        if (hasError) {
          if (!aErrors.includes(sPath)) {
            aErrors.push(sPath);
          }
        } else {
          aErrors = aErrors.filter((oEle) => oEle !== sPath);
        }
        oModel.setProperty("/aErrors", aErrors);
        if (!bModified && sValue !== oModel.getProperty(sDetProp))
          oModel.setProperty("/isModified", true);
      },
    });
  }
);
