sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/dashboard/utils/ExcelFileControl",
    "sap/dashboard/model/Formatter",
    "sap/ui/core/BusyIndicator",
    "sap/m/Token",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    ExcelFileControl,
    Formatter,
    BusyIndicator,
    Token
  ) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.Employee", {
      formatter: Formatter,
      onInit() {
        const oModel = this.getOwnerComponent().getModel("empModel");
        this.getView().setModel(oModel, "oEmpModel");
        this.getView().addEventDelegate({
          onBeforeShow: function (e) {
            if (e.direction === "back") {
              this.setPageTitle();
            } else this.setDefaultData();
          }.bind(this),
        });
      },
      setPageTitle() {
        const oMainModel = this.getOwnerComponent().getModel("mainModel");
        oMainModel.setProperty("/sPageTitle", "Employees");
      },
      async setDefaultData() {
        const oModel = this.getView().getModel("oEmpModel");
        try {
          BusyIndicator.show(0);
          const sUrl = `/api/users`;
          const req = await fetch(sUrl);
          if (!req.ok) {
            throw new Error(`HTTP error ${req.status}`);
          }
          const { users } = await req.json();

          if (!Array.isArray(users)) {
            throw new Error("Invalid employee data format");
          }

          const oData = {
            Employees: users,
            sSelDesgKeys: [],
            sSelDeptKeys: [],
            sSelOrgKeys: [],
            sSelRoleKeys: [],
            sSelGender: 0,
            count: users.length,
            aAllDesg: [],
            aAllDept: [],
            aAllOrg: [],
            aAllRole: [],
          };
          oModel.setData(oData);
          this.getEmpProperties("/aAllDesg", "company", "title");
          this.getEmpProperties("/aAllDept", "company", "department");
          this.getEmpProperties("/aAllOrg", "company", "name");
          this.getEmpProperties("/aAllRole", "role");
          this.onResetPress();
          oModel.updateBindings(true);
        } catch (err) {
          this.backToDashboard("Employee data load failed.", err.message);
        } finally {
          BusyIndicator.hide();
        }
      },
      resetFilterData() {
        const oModel = this.getView().getModel("oEmpModel");
        oModel.setProperty("/sSelDesgKeys", []);
        oModel.setProperty("/sSelDeptKeys", []);
        oModel.setProperty("/sSelOrgKeys", []);
        oModel.setProperty("/sSelRoleKeys", []);
        oModel.setProperty("/sSelGender", 0);
        this.resetMITokens();
        if (this._oValueHelp) {
          this.getView().byId("idOrgSelDialog").clearSelection();
        }
      },
      getEmpProperties(modelProp, f1, f2) {
        const oModel = this.getView().getModel("oEmpModel");
        const aEmployees = oModel.getProperty("/Employees");
        const aUniqueKeys = new Set();
        const aResult = [];

        for (const employee of aEmployees) {
          const rawValue = f2 ? employee[f1]?.[f2] : employee[f1];
          if (typeof rawValue === "string" && rawValue.length > 0) {
            const sVal = rawValue.charAt(0).toUpperCase() + rawValue.slice(1);
            if (!aUniqueKeys.has(sVal)) {
              aUniqueKeys.add(sVal);
              aResult.push({ key: sVal, text: sVal });
            }
          }
        }
        oModel.setProperty(modelProp, aResult);
      },

      onFilterSearch() {
        const oTable = this.getView().byId("idEmpTable");
        const oModel = this.getView().getModel("oEmpModel");
        const aDesg = oModel.getProperty("/sSelDesgKeys");
        const aDept = oModel.getProperty("/sSelDeptKeys");
        const aOrg = oModel.getProperty("/sSelOrgKeys");
        const aRole = oModel.getProperty("/sSelRoleKeys");
        const iGender = oModel.getProperty("/sSelGender");

        try {
          BusyIndicator.show(0);
          let aFilters = [];
          if (aDesg.length > 0) {
            aDesg.map((sKey) =>
              aFilters.push(
                new Filter({
                  path: "company/title",
                  operator: FilterOperator.EQ,
                  value1: sKey,
                })
              )
            );
          }
          if (aDept.length > 0) {
            aDept.map((sKey) =>
              aFilters.push(
                new Filter({
                  path: "company/department",
                  operator: FilterOperator.EQ,
                  value1: sKey,
                })
              )
            );
          }
          if (aRole.length > 0) {
            aRole.map((sKey) =>
              aFilters.push(
                new Filter({
                  path: "role",
                  operator: FilterOperator.EQ,
                  value1: sKey,
                })
              )
            );
          }
          if (aOrg.length > 0) {
            aOrg.map((sKey) =>
              aFilters.push(
                new Filter({
                  path: "company/name",
                  operator: FilterOperator.EQ,
                  value1: sKey,
                })
              )
            );
          }
          if (iGender) {
            aFilters.push(
              new Filter({
                path: "gender",
                operator: FilterOperator.EQ,
                value1: iGender === 1 ? "male" : "female",
              })
            );
          }
          oTable.getBinding("items").filter(aFilters);
          oModel.setProperty(
            "/count",
            oTable.getBinding("items").getAllCurrentContexts().length
          );
        } catch (error) {
          this.showMessageBox(
            "An unexpected error occcured.\n\n Error:\n " + error.message
          );
        } finally {
          BusyIndicator.hide();
        }
      },
      onTableItemSelect(oEvent) {
        const sPath = oEvent.getSource().getBindingContextPath();
        const sId = sPath.split("/")[2];
        this.getNavContainer().to("idEmpDetails", {
          id: sId,
        });
      },
      async onSortPress() {
        this._oSortDialog ??= await this.loadFragment({
          name: "sap.dashboard.fragment.SortDialog",
        });
        this._oSortDialog.open();
      },
      handleConfirm(oEvent) {
        const oTable = this.getView().byId("idEmpTable");

        const bDesc = oEvent.getParameter("sortDescending");
        const oSelItem = oEvent.getParameter("sortItem");

        if (oSelItem) {
          const sSelItem = oSelItem.getProperty("text");
          let path = "company/";
          switch (sSelItem) {
            case "Name":
              path = "firstName";
              break;
            case "Designation":
              path += "title";
              break;
            case "Organization":
              path += "name";
              break;

            default:
              path += sSelItem.toLowerCase();
              break;
          }
          const aSorter = new Sorter(path, bDesc);
          oTable.getBinding("items").sort(aSorter);
        }
      },
      onDownloadPress() {
        const oModel = this.getView().getModel("oEmpModel");
        const aEmp = oModel.getProperty("/Employees");
        const aData = aEmp.map((e) => ({
          ...e,
          fullName: `${e.firstName} ${e.maidenName} ${e.lastName}`,
          personalAddress: `${e.address.address} ${e.address.city} ${e.address.state} ${e.address.stateCode} ${e.address.postalCode}`,
          companyAddress: `${e.company.address.address} ${e.company.address.city} ${e.company.address.state} ${e.company.address.stateCode} ${e.company.address.postalCode}`,
        }));
        ExcelFileControl.downloadSpreadsheet(
          "Employees.xlsx",
          true,
          "Emp",
          aData
        );
      },
      resetTableData() {
        const oTable = this.getView().byId("idEmpTable");
        const oBindings = oTable.getBinding("items");
        const oModel = this.getView().getModel("oEmpModel");

        oBindings.aSorter = [];
        oBindings.sort(null);
        oBindings.aFilters = [];
        oBindings.filter(null);

        oModel.setProperty(
          "/count",
          oTable.getBinding("items").getAllCurrentContexts().length
        );
      },
      onResetPress() {
        BusyIndicator.show(0);
        this.resetFilterData();
        this.resetTableData();
        BusyIndicator.hide();
      },
      async onShowOrgValueHelp() {
        this._oValueHelp ??= await this.loadFragment({
          name: "sap.dashboard.fragment.ValueHelpDialog",
          controller: this,
        });
        this._oValueHelp.open();
      },
      onOrgF4DialogClose(oEvent) {
        const oView = this.getView();
        const oModel = oView.getModel("oEmpModel");
        const aSelItems = oEvent.getParameter("selectedContexts");
        const oMInput = oView.byId("idOrgMCB");
        const aPrevTokens = oMInput.getTokens();
        if (aSelItems) {
          const sSelTokens = [];
          if (aSelItems.length === 0 || aPrevTokens.length > 0)
            this.resetMITokens();
          if (aSelItems.length > 0) {
            aSelItems.forEach((oItem) => {
              const sItemText = oModel.getProperty(oItem.getPath()).text;
              sSelTokens.push(sItemText);
              return oMInput.addToken(
                new Token({
                  text: sItemText,
                })
              );
            });
            oModel.setProperty("/sSelOrgKeys", sSelTokens);
          }
        }
      },
      onOrgSearchDialog(oEvent) {
        const sValue = oEvent.getParameter("value");
        const aFilter = new Filter("text", FilterOperator.Contains, sValue);
        oEvent.getSource().getBinding("items").filter([aFilter]);
      },
      resetMITokens() {
        this.getView().byId("idOrgMCB").removeAllTokens();
      },
    });
  }
);
