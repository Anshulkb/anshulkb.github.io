sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/dashboard/model/Formatter",
    "sap/dashboard/utils/ExcelFileControl",
    "sap/ui/core/BusyIndicator",
  ],
  function (BaseController, Formatter, ExcelFileControl, BusyIndicator) {
    "use strict";
    return BaseController.extend("sap.dashboard.controller.Products", {
      formatter: Formatter,
      onInit() {
        this.getView().addEventDelegate({
          onBeforeShow: function (e) {
            if (e.direction === "back") {
              this.setPageTitle();
            } else this._onBeforeShow();
          }.bind(this),
        });
      },
      onAfterRendering() {
        const oTable = this.byId("idProductsTable");
        sap.ui.core.ResizeHandler.register(oTable, () => {
          this._adjustVisibleRows();
        });
        this._adjustVisibleRows();
      },
      _onBeforeShow() {
        this.setDefaultData();
        this.getProducts();
        this.onResetTable();
      },
      setPageTitle() {
        const oMainModel = this.getOwnerComponent().getModel("mainModel");
        oMainModel.setProperty("/sPageTitle", "Products");
      },
      setDefaultData() {
        const oData = {
          products: [],
        };
        const oModel = this.getOwnerComponent().getModel("productModel");
        oModel.setData(oData);
        this.getView().setModel(oModel, "oProductModel");
      },
      async getProducts() {
        try {
          BusyIndicator.show(0);
          const oModel = this.getView().getModel("oProductModel");
          const sUrl = `/api/products`;
          const request = await fetch(sUrl);
          if (!request.ok) {
            throw new Error(`HTTP error ${request.status}`);
          }
          const { products } = await request.json();
          const aUpdatedProducts = products.map((e) => ({
            ...e,
            rating: Number(e.rating.toFixed(1)),
          }));
          if (!Array.isArray(aUpdatedProducts)) {
            throw new Error("Invalid product data format");
          }
          oModel.setProperty("/products", aUpdatedProducts);
        } catch (err) {
          this.backToDashboard("Unable to load products.", err.message);
        } finally {
          BusyIndicator.hide();
        }
      },
      onRowItemSelected(oEvent) {
        let sSelItem = "";
        if (oEvent.getId() === "press") {
          sSelItem = oEvent
            .getParameter("row")
            .getBindingContext("oProductModel")
            .getPath()
            .split("/")[2];
        }
        if (oEvent.getId() === "cellClick") {
          sSelItem =
            oEvent.getParameter("rowBindingContext")?.getPath().split("/")[2] ||
            "";
        }
        if (sSelItem !== "") {
          this.getNavContainer().to("idProdDetails", {
            id: Number(sSelItem) + 1,
          });
        }
      },
      onResetTable() {
        const oTable = this.getView().byId("idProductsTable");

        oTable.getBinding().aSorter = [];
        oTable.getBinding().sort(null);
        oTable.getColumns().forEach((col) => {
          oTable.filter(col, null);
          col.setSorted(false);
          col.setSortOrder("None");
        });
      },
      onDownloadSelected() {
        this.joinValues();
        ExcelFileControl.downloadSpreadsheet(
          "Products.xlsx",
          false,
          "Products",
          this.getView().getModel("oProductModel").getProperty("/products")
        );
      },
      joinValues() {
        const oModel = this.getView().getModel("oProductModel");
        const products = oModel.getProperty("/products");
        const newProducts = products.map((e) => ({
          ...e,
          prodDim:
            e.dimensions.width +
            " x " +
            e.dimensions.height +
            " x " +
            e.dimensions.depth +
            " cm",
          images: e.images.join("; "),
          tags: e.tags.join("; "),
        }));
        oModel.setProperty("/products", newProducts);
      },
      _adjustVisibleRows() {
        const oTable = this.byId("idProductsTable");
        const iRowHeight = oTable.getProperty("rowHeight");
        const iRows = Math.round((window.innerHeight - 220) / iRowHeight);
        oTable.setProperty("visibleRowCount", iRows);
      },
    });
  }
);
