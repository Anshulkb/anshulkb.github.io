sap.ui.define(
  ["sap/dashboard/controller/BaseController", "sap/ui/core/BusyIndicator"],
  function (BaseController, BusyIndicator) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.App", {
      onInit() {
        var oToolPage = this.byId("toolPage");
        const oModel = this.getOwnerComponent().getModel("mainModel");

        const data = {
          navList: [],
          selectedNavListKey: "",
          sPageTitle: "",
        };
        oModel.setData(data);
        this.setPages();
        this.loadNavList();
        oToolPage.setSideExpanded(false);
      },
      onSideNavButtonPress() {
        var oToolPage = this.byId("toolPage");
        oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
      },
      async loadNavList() {
        try {
          BusyIndicator.show(0);
          const sUrl = `/projects/dist/utils/navigationList.json`;
          const request = await fetch(sUrl);
          if (!request.ok) {
            throw new Error(`HTTP error ${req.status}`);
          }
          const oNavList = await request.json();
          if (!Array.isArray(oNavList)) {
            throw new Error("Invalid menu format type");
          }
          const oModel = this.getOwnerComponent().getModel("mainModel");
          oModel.setProperty("/navList", oNavList);
          this.onItemSelect();
          oModel.updateBindings(true);
        } catch (error) {
          this.showMessageBox(
            "error",
            "Unable to load navigation menu. Error: " + error.message
          );
        } finally {
          BusyIndicator.hide();
        }
      },
      onItemSelect(oEvent) {
        try {
          const sSelItem =
            oEvent?.getParameter("item")?.getProperty("text") ?? "Dashboard";
          const oModel = this.getOwnerComponent().getModel("mainModel");
          const aNavList = oModel.getProperty("/navList");
          var oToolPage = this.byId("toolPage");

          const sId = aNavList.filter((oEle) => oEle.text === sSelItem)[0].id;
          oModel.setProperty("/sPageTitle", sSelItem);
          if (!oEvent?.getParameter("item"))
            oModel.setProperty("/selectedNavListKey", sId);

          oToolPage.setSideExpanded(false);
          this.getView().byId("pagesContainer").to(sId);
        } catch (error) {
          this.showMessageBox(
            "error",
            "An unexpected error occured. " + error.message
          );
        }
      },
      setPages() {
        const oNavContainer = this.getView().byId("pagesContainer");
        const pages = [
          {
            id: "idDashboard",
            viewName: "sap.dashboard.view.Dashboard",
          },
          {
            id: "idProduct",
            viewName: "sap.dashboard.view.Products",
          },
          {
            id: "idChart",
            viewName: "sap.dashboard.view.Chart",
          },
          {
            id: "idEmployee",
            viewName: "sap.dashboard.view.Employees",
          },
          {
            id: "idEmpDetails",
            viewName: "sap.dashboard.view.EmpDetails",
          },
          {
            id: "idMaster",
            viewName: "sap.dashboard.view.Master",
          },
          {
            id: "idProdDetails",
            viewName: "sap.dashboard.view.ProdDetails",
          },
        ];
        pages.forEach((page) => {
          const oView = sap.ui.view({
            id: page.id,
            viewName: page.viewName,
            type: sap.ui.core.mvc.ViewType.XML,
          });

          oNavContainer.addPage(oView);
        });
        this.setNavContainer(oNavContainer);
        this.setSideNav(this.byId("idSideNav"));
      },
    });
  }
);
