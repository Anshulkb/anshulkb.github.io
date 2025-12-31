sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/m/MessageToast",
    "sap/dashboard/utils/ExcelFileControl",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/dashboard/model/Formatter",
  ],
  function (
    BaseController,
    MessageToast,
    ExcelFileControl,
    MessageBox,
    Fragment,
    Formatter
  ) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.Master", {
      formatter: Formatter,
      onInit() {
        const oModel = this.getOwnerComponent().getModel("masterModel");
        this.getView().setModel(oModel, "oMasterModel");
        this.getView().addEventDelegate({
          onBeforeShow: function () {
            this.setDefaultData();
          }.bind(this),
        });
      },
      setDefaultData() {
        const oModel = this.getView().getModel("oMasterModel");
        const oData = {
          showFilter: true,
          sSelKey: "",
          showUpload: false,
          filePath: "",
          uploadBtnEnable: false,
          showTable: false,
          count: 0,
          scrollHeight: "0px",
          tableData: [],
          aErrors: [],
          oSelItem: {},
          sSelItemPath: "",
          oRichContent: "",
          sDialogTitle: "",
        };
        oModel.setData(oData);
      },
      resetTableSection() {
        const oModel = this.getView().getModel("oMasterModel");
        oModel.setProperty("/tableData", []);
        oModel.setProperty("/count", 0);
        oModel.setProperty("/showTable", false);
      },
      resetUploadSection() {
        const oModel = this.getView().getModel("oMasterModel");
        oModel.setProperty("/showUpload", true);
        oModel.setProperty("/filePath", "");
        oModel.setProperty("/uploadBtnEnable", false);
      },
      resetBoth() {
        this.resetTableSection();
        this.resetUploadSection();
      },
      onSelectionChange(oEvent) {
        this.resetBoth();
      },
      async openErrorDialog() {
        this.oErrorDialog ??= await this.loadFragment({
          name: "sap.dashboard.fragment.ExcelErrorDialog",
        });
        this.oErrorDialog.open();
      },
      onCloseDialog() {
        const oModel = this.getView().getModel("oMasterModel");
        oModel.setProperty("/filePath", "");
        oModel.setProperty("/uploadBtnEnable", false);
        this.oErrorDialog.close();
      },
      onRecordCancelPress() {
        var that = this;
        MessageBox.warning("All record(s) will be removed. Are you sure?", {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (oAction) {
            if (oAction === "OK") {
              that.resetBoth();
            }
          },
        });
      },
      onRecordSavePress() {
        var that = this;
        const oModel = that.getView().getModel("oMasterModel");
        const aItems = oModel.getProperty("/tableData");
        const aRemainingItems = aItems.filter((oEle) => oEle.isDeleted !== "X");
        MessageBox[aRemainingItems.length > 0 ? "success" : "error"](
          aRemainingItems.length > 0
            ? "All record(s) have been saved successfully."
            : "Unable to save. No record found.",
          {
            onClose: function () {
              that.resetBoth();
            },
          }
        );
      },
      onDeletePress() {
        const oModel = this.getView().getModel("oMasterModel");
        const sTbName = this.getTableId(oModel.getProperty("/sSelKey"));
        const oTable = this.getView().byId(sTbName);
        const aItems = oTable.getSelectedContextPaths();
        if (aItems.length < 1) {
          MessageToast.show("No item(s) selected for deletion.");
          return;
        }
        aItems.forEach((item) => {
          oModel.getProperty(item).isDeleted = "X";
        });
        MessageToast.show("Selected item(s) deleted successfully.");
        this.updateCount();
        this.resetTableSelection();
        oModel.updateBindings(true);
      },
      updateCount() {
        const oModel = this.getView().getModel("oMasterModel");
        const count = oModel
          .getProperty("/tableData")
          .filter((item) => item.isDeleted !== "X").length;
        oModel.setProperty("/count", count);
      },
      onTemplateDownload() {
        const oModel = this.getView().getModel("oMasterModel");
        const sKey = oModel.getProperty("/sSelKey");
        ExcelFileControl.downloadSpreadsheet(
          (sKey === "E" ? "Employees" : "Products") + "Template.xlsx",
          false,
          sKey === "E" ? "Emp" : "Products"
        );
      },
      onTypeMismatch(oEvent) {
        const fileName = oEvent.getParameter("fileName");
        const filetype = oEvent.getParameter("fileType");
        this.showMessageBox(
          "error",
          "File- " +
            fileName +
            " is of type- " +
            filetype +
            ". Please upload either .xlsx or .csv files only."
        );
      },
      onFileUploadEvent(oEvent) {
        const reader = new FileReader();
        const oModel = this.getView().getModel("oMasterModel");
        let file;
        try {
          sap.ui.core.BusyIndicator.show(0);
          if (oEvent.getId() === "change") {
            file = oEvent.getParameter("files")[0];
            if (file) {
              oModel.setProperty("/file", file);
              this.resetTableSection();
              reader.onloadend = () => {
                oModel.setProperty("/uploadBtnEnable", true);
              };
            } else {
              oModel.setProperty("/filePath", oModel.getProperty("/file").name);
            }
          }
          if (oEvent.getId() === "press") {
            file = oModel.getProperty("/file");
            reader.onload = (e) => {
              this.handleUploadedFile(e.target.result);
            };
          }
          if (file) {
            reader.readAsArrayBuffer(file);
          }
        } catch (error) {
          this.showMessageBox("error", String(error));
        } finally {
          sap.ui.core.BusyIndicator.hide();
        }
      },
      handleUploadedFile(content) {
        const oModel = this.getView().getModel("oMasterModel");
        const sSource =
          oModel.getProperty("/sSelKey") === "E" ? "Employees" : "Products";

        const data = new Uint8Array(content);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const workSheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(workSheet, { header: 1 });
        const validation = ExcelFileControl.validateData(json, sSource);
        if (validation === "Success") {
          const formatteddata = ExcelFileControl.formatData(json, sSource);
          oModel.setProperty("/tableData", formatteddata);
          oModel.setProperty("/showTable", true);
          oModel.setProperty("/scrollHeight", window.innerHeight - 330 + "px");

          oModel.setProperty("/uploadBtnEnable", false);
          this.updateCount();
          this.bindTableFragment(sSource);
        } else {
          oModel.setProperty("/aErrors", validation);
          this.openErrorDialog();
        }
      },
      async bindTableFragment(sName) {
        const oScroll = this.getView().byId("idMasterScroll");
        const name = "sap.dashboard.fragment.master." + sName + "Table";
        if (oScroll.getContent().length > 0) {
          this.destroyTables();
          oScroll.removeAllContent();
        }
        Fragment.load({
          id: this.getView().getId(),
          name,
          controller: this,
        }).then((oFragment) => oScroll.addContent(oFragment));
      },
      onEditPress() {
        const oModel = this.getView().getModel("oMasterModel");
        const sTbName = this.getTableId(oModel.getProperty("/sSelKey"));
        const oTable = this.getView().byId(sTbName);
        const aItems = oTable.getSelectedContextPaths();
        if (aItems.length > 1) {
          this.resetTableSelection();
          this.showMessageBox(
            "error",
            "Please select one row at a time to edit."
          );
          return;
        } else if (aItems.length === 1) {
          const oItemData = JSON.parse(
            JSON.stringify(oModel.getProperty(aItems[0]))
          );
          oModel.setProperty("/oSelItem", oItemData);
          oModel.setProperty("/sSelItemPath", aItems[0]);
          oModel.setProperty("/sDialogTitle", "Edit Details");
          this.openEditDialog();
        } else {
          MessageToast.show("Please select a row to edit details.");
        }
      },
      onToggleFilterVisible() {
        const oModel = this.getView().getModel("oMasterModel");
        const isVisible = oModel.getProperty("/showFilter");
        oModel.setProperty("/showFilter", !isVisible);
        const height = isVisible
          ? window.innerHeight - 160
          : window.innerHeight - 330;
        oModel.setProperty("/scrollHeight", height + "px");
        oModel.updateBindings(true);
      },
      openEditDialog() {
        this.openDialog(
          "_oEditDialog",
          "sap.dashboard.fragment.master.EditDialog"
        );
      },
      async openDialog(sName, sPath) {
        this[sName] ??= await this.loadFragment({
          name: sPath,
          controller: this,
        });
        this[sName].open();
      },
      onCloseEditDialog() {
        this.resetTableSelection();
        this._oEditDialog.close();
      },
      onSaveEditDialog() {
        const oModel = this.getView().getModel("oMasterModel");
        const oNewData = this.trimValues(oModel.getProperty("/oSelItem"));
        const sPath = oModel.getProperty("/sSelItemPath");
        const sTbName = this.getTableId(oModel.getProperty("/sSelKey"));
        const oTable = this.getView().byId(sTbName);
        oModel.setProperty(sPath, oNewData);
        oModel.updateBindings(true);

        oTable.scrollToIndex(Number(sPath.split("/")[2]));
        this.onCloseEditDialog();
      },
      onRowBtnPress(oEvent) {
        const oModel = this.getView().getModel("oMasterModel");
        const sItem = oEvent.getSource().getProperty("icon").split("//")[1];
        const sPath = oEvent.getSource().getParent().getBindingContextPath();
        let sProperty = "";
        switch (sItem) {
          case "bar-code":
            sProperty = "Barcode";
            break;
          case "qr-code":
            sProperty = "QR Code";
            break;
          case "image-viewer":
            sProperty = "Images";
            break;
          case "picture":
            sProperty = "Thumbnail";
            break;
        }
        const sLoc = sPath + "/" + sProperty;
        const details = oModel.getProperty(sLoc);
        const oObj = {
          sRichConDetail: details,
          sRichConTitle: sProperty,
          sItemPath: sLoc,
        };
        oModel.setProperty("/oRichContent", oObj);
        this.openRichContentDialog();
      },
      openRichContentDialog() {
        this.openDialog(
          "_oRichDialog",
          "sap.dashboard.fragment.master.EditRichContentDialog"
        );
      },
      resetTableSelection() {
        const oModel = this.getView().getModel("oMasterModel");
        const sTbName = this.getTableId(oModel.getProperty("/sSelKey"));
        const oTable = this.getView().byId(sTbName);
        oTable.removeSelections();
        oTable.setSelectedContextPaths([]);
      },
      trimValues(oObj) {
        return Object.fromEntries(
          Object.entries(oObj).map(([key, value]) => {
            return [key, typeof value === "string" ? value.trim() : value];
          })
        );
      },
      onRichDialogClose() {
        this._oRichDialog.close();
      },
      onChgRichDetails(oEvent) {
        const oModel = this.getView().getModel("oMasterModel");
        oModel.setProperty(
          "/oRichContent/sRichConDetail",
          oEvent.getParameter("value")
        );
      },
      onRichDialogSave() {
        const oModel = this.getView().getModel("oMasterModel");
        const sPath = oModel.getProperty("/oRichContent/sItemPath");
        oModel.setProperty(
          sPath,
          oModel.getProperty("/oRichContent/sRichConDetail")
        );
        oModel.updateBindings(true);
        this.onRichDialogClose();
      },
      destroyTables() {
        if (sap.ui.getCore().byId("idMaster--idMasterProdTable"))
          sap.ui.getCore().byId("idMaster--idMasterProdTable").destroy();
        if (sap.ui.getCore().byId("idMaster--idMasterEmpTable"))
          sap.ui.getCore().byId("idMaster--idMasterEmpTable").destroy();
      },
      getTableId(sSelKey) {
        return sSelKey === "E" ? "idMasterEmpTable" : "idMasterProdTable";
      },
      onAddPress() {
        const oModel = this.getView().getModel("oMasterModel");
        const iRows = oModel.getProperty("/tableData").length;
        const sSelKey = oModel.getProperty("/sSelKey");

        const oNewRow = {
          employee: {
            "Employee ID": iRows + 1,
            Name: "",
            Age: "",
            Gender: "",
            Email: "",
            "Phone Number": "",
            "Date of Birth": "",
            "Blood Group": "",
            Address: "",
            Country: "",
            SSN: "",
            Role: "",
            Designation: "",
            Department: "",
            Company: "",
            "Company Address": "",
            isDeleted: "",
          },
          products: {
            "Product Name": "",
            Description: "",
            Brand: "",
            Category: "",
            Price: "",
            Discount: "",
            Rating: "",
            Stock: "",
            Tags: "",
            "Stock keeping unit": "",
            Weight: "",
            "Dimensions (WxHxD)": "",
            "Warranty Details": "",
            "Shipping Information": "",
            Availability: "",
            "Return Policy": "",
            "Minimum Order Quantity": "",
            Barcode: "",
            "QR Code": "",
            Images: "",
            Thumbnail: "",
            isDeleted: "",
          },
        };

        this.resetTableSelection();
        oModel.setProperty(
          "/oSelItem",
          sSelKey === "E" ? oNewRow.employee : oNewRow.products
        );
        oModel.setProperty("/sSelItemPath", "/tableData/" + iRows.toString());
        oModel.setProperty("/sDialogTitle", "Add Details");
        this.openEditDialog();
      },
    });
  }
);
