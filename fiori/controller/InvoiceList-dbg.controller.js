sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("ui5.quickstart.controller.InvoiceList", {
      onInit() {
        const oViewModel = new JSONModel({
          currency: "EUR",
        });
        this.getView().setModel(oViewModel, "view");
      },
      onFilterInvoice(oEvent) {
        const aFilter = [];
        const query = oEvent.getParameter("query");
        if (query)
          aFilter.push(
            new Filter("ProductName", FilterOperator.Contains, query)
          );

        const oList = this.byId("invoiceList");
        const oBinding = oList.getBinding("items");
        oBinding.filter(aFilter);
      },
      onClickListItem(oEvent) {
        const oItem = oEvent.getSource();
        const oRouter = this.getOwnerComponent().getRouter();
        oRouter.navTo("detail", {
          invoicePath: window.encodeURIComponent(
            oItem.getBindingContext("invoice").getPath().substring(1)
          ),
        });
      },
    });
  }
);
