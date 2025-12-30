sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/dashboard/model/Formatter",
    "sap/ui/core/BusyIndicator",
  ],
  function (BaseController, Formatter, BusyIndicator) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.Dashboard", {
      formatter: Formatter,
      onInit() {
        this.getView().addEventDelegate({
          onBeforeShow: function () {
            this._onPatternMatched();
          }.bind(this),
        });
      },
      _onPatternMatched() {
        const oModel = this.getOwnerComponent().getModel("productModel");
        this.getView().setModel(oModel, "oProductModel");
        this.setDefaultData();
        this.getInitialData();
        this.setBusy("idColChart", true);
        this.setBusy("idDonutChart", true);
      },
      async getInitialData() {
        try {
          BusyIndicator.show(0);
          const oModel = this.getView().getModel("oProductModel");
          const sUrl = "/api/products";
          const request = await fetch(sUrl);
          if (!request.ok) {
            throw new Error(`HTTP error ${request.status}`);
          }
          const { products } = await request.json();
          if (!Array.isArray(products)) {
            throw new Error("Invalid data format.");
          }
          const lowStock = this.filterStock(products);
          const range = this.filterRange(products, "stock", 10);
          oModel.setProperty("/products", products);
          oModel.setProperty("/filterByStock", lowStock);
          oModel.setProperty("/filterByRange", range);

          this.setVizFrame(oModel);
          this.setColChart(oModel);
        } catch (err) {
          this.showMessageBox(
            "error",
            "Unable to fetch details. " + err.message
          );
        } finally {
          BusyIndicator.hide();
        }
      },
      setDefaultData() {
        const oModel = this.getView().getModel("oProductModel");
        const oData = {
          filterByStock: "",
          filterByRange: "",
          count: "0",
          products: [],
          tableData: [],
        };
        oModel.setData(oData);
      },
      filterStock(products) {
        const lowStocks = products.filter(
          (oEle) => oEle.availabilityStatus === "Low Stock"
        );
        return this.sortData(lowStocks);
      },
      sortData(data) {
        return data.sort((a, b) => b.stock - a.stock);
      },
      filterRange(products, field, bucketSize) {
        const buckets = {};

        products.forEach((item) => {
          const value = item[field];
          let rangeLabel;
          if (value === 0) {
            rangeLabel = `Out of stock`;
          } else {
            const bucketIndex = Math.floor((value - 1) / bucketSize) + 1;

            const min = (bucketIndex - 1) * bucketSize + 1;
            const max = bucketIndex * bucketSize;
            rangeLabel = `${min}-${max}`;
          }
          if (!buckets[rangeLabel]) {
            buckets[rangeLabel] = 0;
          }

          buckets[rangeLabel]++;
        });

        const arr = Object.keys(buckets).map((range) => ({
          range: range,
          count: buckets[range],
        }));
        arr.sort((a, b) => {
          const aMin = parseInt(a.range.split("-")[0], 10);
          const bMin = parseInt(b.range.split("-")[0], 10);
          return aMin - bMin;
        });

        return arr;
      },
      tableShowByRange(data) {
        let arr = [];
        const products = this.getView()
          .getModel("oProductModel")
          .getProperty("/products");
        data.map((oEle) => {
          const sRange = oEle.data.Range;
          const min = parseInt(sRange.split("-")[0]);
          const max = parseInt(sRange.split("-")[1]);
          let bFlag = false;
          if (sRange === "Out of stock") bFlag = true;
          const res = products.filter(
            (oEle) =>
              (oEle.stock >= min && oEle.stock <= max) ||
              (bFlag && oEle.stock === 0)
          );
          arr.push(res);
        });
        return arr;
      },
      setVizFrame(oModel) {
        const oVizFrame = this.getView().byId("idDonutChart");
        oVizFrame.setVizProperties({
          title: {
            text: "Low in stock",
          },
          plotArea: {
            dataLabel: {
              name: "Value Label",
              visible: true,
              type: "value",
            },
          },
          legend: {
            visible: true,
          },
        });
        oVizFrame.setModel(oModel);

        var oPopOver = this.getView().byId("idPopOver");
        oPopOver.connect(oVizFrame.getVizUid());
        this.setBusy("idDonutChart", false);
      },
      setColChart(oModel) {
        const oVizFrame = this.getView().byId("idColChart");
        oVizFrame.setVizProperties({
          title: {
            text: "Current stock",
          },
          plotArea: {
            dataLabel: {
              name: "Value Label",
              visible: true,
              type: "value",
              position: "top",
            },
          },
          legend: {
            visible: true,
          },
          valueAxis: {
            title: {
              visible: false,
            },
            label: {
              visible: false,
            },
          },
          categoryAxis: {
            title: {
              visible: false,
            },
            label: {
              visible: true,
            },
          },
        });
        oVizFrame.setModel(oModel);

        this.setBusy("idColChart", false);
      },
      onColumnItemSelect() {
        const aSelData = this.getView().byId("idColChart").vizSelection();
        const aNewTableData = this.tableShowByRange(aSelData).flat();
        const oModel = this.getView().getModel("oProductModel");
        oModel.setProperty("/tableData", aNewTableData);
        oModel.setProperty("/count", aNewTableData.length);
      },
      onRemoveSelection() {
        var oVizFrame = this.getView().byId("idColChart");
        oVizFrame.vizSelection([], { clearSelection: true });
        oModel.setProperty("/count", "0");
      },
      setBusy(sItem, bFlag) {
        this.getView().byId(sItem).setBusy(bFlag);
      },
    });
  }
);
