sap.ui.define(
  [
    "sap/dashboard/controller/BaseController",
    "sap/dashboard/model/Formatter",
    "sap/m/GenericTag",
    "sap/m/Image",
    "sap/ui/core/BusyIndicator",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    Formatter,
    GenericTag,
    Image,
    BusyIndicator,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend("sap.dashboard.controller.ProdDetails", {
      formatter: Formatter,
      onInit() {
        this.getView().addEventDelegate({
          onBeforeShow: function (evt) {
            this._onBeforeShow(evt.data.id);
          }.bind(this),
        });
      },
      _onBeforeShow(id) {
        this.getOwnerComponent()
          .getModel("mainModel")
          .setProperty("/sPageTitle", "Product Details");
        this.setDefaultData();
        this.getProdDetails(id);
      },
      goBackToProducts() {
        this.getView().getModel("oProdDetModel").setData({});
        this.getNavContainer().back();
      },
      setDefaultData() {
        const oModel = this.getOwnerComponent().getModel("prodDetailModel");
        this.getView().setModel(oModel, "oProdDetModel");
      },
      async getProdDetails(sId) {
        const oModel = this.getView().getModel("oProdDetModel");
        try {
          BusyIndicator.show(0);
          const sUrl = `/api/products?id=${sId}`;
          const req = await fetch(sUrl);
          if (!req.ok) {
            throw new Error(`HTTP error ${req.status}`);
          }
          const prodDet = await req.json();
          if (typeof prodDet !== "object") {
            throw new Error(`Invalid format for product details.`);
          }
          const aProdDetails = {
            ...prodDet,
            userRating: 0,
            userComment: "",
            reviewPresent: false,
            fProdImg: "",
          };
          aProdDetails.rating = Number(aProdDetails.rating.toFixed(1));
          oModel.setData(aProdDetails);
          this.bindTags();
          this.checkUserReview();
          this.setDefautImg();
        } catch (err) {
          MessageBox.error("Unable to fetch Product details.", {
            details: err.message,
            onClose: () => {
              this.goBackToProducts();
            },
          });
        } finally {
          BusyIndicator.hide();
        }
      },
      bindTags() {
        const oHBox = this.getView().byId("idGenTagContainer");
        if (oHBox.getItems().length > 0) {
          oHBox.removeAllItems();
        }
        const aTags =
          this.getView().getModel("oProdDetModel").getProperty("/tags") ?? [];
        aTags.forEach((item) => {
          const tag = new GenericTag({
            text: item.charAt(0).toUpperCase() + item.substring(1),
          });
          tag.addStyleClass("sapUiSmallMarginEnd");
          tag.addStyleClass("sapUiTinyMarginBottom");
          tag.addStyleClass("genericTagStyle");

          oHBox.addItem(tag);
        });
      },
      onImagePress(oEvent) {
        const oModel = this.getView().getModel("oProdDetModel");
        const oHBox = this.getView().byId("idImgContainer");
        const aPages = oHBox.getItems();
        const oSource = oEvent.getSource();
        const sId = oSource.getId();
        const sSelImgPath = oSource
          .getBindingContext("oProdDetModel")
          .getPath();
        const sSelImg = oModel.getProperty(sSelImgPath);
        aPages.forEach((oEle) => {
          oEle.toggleStyleClass("selectImg", oEle.sId === sId);
        });
        oModel.setProperty("/fProdImg", sSelImg);
      },
      onAddReviewPress() {
        this.checkUserReview();
        this.createFragment("sap.dashboard.fragment.ReviewDialog");
      },
      navToReviews() {
        const oPage = this.getView().byId("idProdDetPage");
        const oList = this.getView().byId("idReviewList");
        oPage.scrollToElement(oList);
      },
      async createFragment(sPath) {
        this._oDialog ??= await this.loadFragment({
          name: sPath,
          controller: this,
        });
        this.openDialog();
      },
      openDialog() {
        this._oDialog.open();
      },
      closeDialog() {
        this._oDialog.close();
        this._oDialog.destroy();
        this._oDialog = null;
      },
      onCancelReviewDialog() {
        const oModel = this.getView().getModel("oProdDetModel");
        oModel.setProperty("/userRating", 0);
        oModel.setProperty("/userComment", "");
        this.closeDialog();
      },
      showBarcode() {
        const oModel = this.getView().getModel("oProdDetModel");
        const sBarcode = oModel.getProperty("/meta/barcode");
        const canvas = document.createElement("canvas");
        if (window.JsBarcode) {
          try {
            JsBarcode(canvas, sBarcode, {
              format: "CODE128",
              displayValue: true,
              lineColor: "#000",
              height: 60,
              width: 2,
              fontSize: 14,
            });
            const base64 = canvas.toDataURL("image/png");
            oModel.setProperty("/code", base64);
            this.createFragment("sap.dashboard.fragment.ImageDialog");
          } catch (error) {
            this.showMessageBox(String(error.message));
          }
        } else {
          this.showMessageBox(
            "Unable to load libraries.\nPlease refresh the page and try again."
          );
        }
      },
      showQrcode() {
        const oModel = this.getView().getModel("oProdDetModel");
        const sQrcode = oModel.getProperty("/meta/qrCode");
        oModel.setProperty("/code", sQrcode);
        this.createFragment("sap.dashboard.fragment.ImageDialog");
      },
      onSaveReviewDialog() {
        const oModel = this.getView().getModel("oProdDetModel");
        const iRating = oModel.getProperty("/userRating");
        const sComment = oModel.getProperty("/userComment").trim();
        const aReviews = oModel.getProperty("/reviews");
        if (!iRating) {
          this.showMessageBox("error", "Please provide a rating.");
          return;
        }
        try {
          BusyIndicator.show(0);
          const sNow = new Date().toISOString();
          const oExistingReview = aReviews.find(
            (rev) => rev.reviewerName === "Anonymous User"
          );
          if (oExistingReview) {
            Object.assign(oExistingReview, {
              rating: iRating,
              comment: sComment,
              date: sNow,
            });
          } else {
            aReviews.unshift({
              rating: iRating,
              comment: sComment,
              date: sNow,
              reviewerName: "Anonymous User",
              reviewerEmail: "anonymous@test.com",
            });
          }
          oModel.setProperty("/reviews", aReviews);
          oModel.setProperty("/reviewPresent", true);
          this.closeDialog();
        } catch (error) {
          this.showMessageBox(String(error.message));
        } finally {
          BusyIndicator.hide();
        }
      },
      checkUserReview() {
        const oModel = this.getView().getModel("oProdDetModel");
        const aReviews = oModel.getProperty("/reviews") ?? [];
        const aFilterValue = aReviews.find(
          (oEle) => oEle.reviewerName === "Anonymous User"
        );
        if (aFilterValue) {
          oModel.setProperty("/userRating", aFilterValue.rating);
          oModel.setProperty("/userComment", aFilterValue.comment);
          oModel.setProperty("/reviewPresent", true);
        }
      },
      setDefautImg() {
        const oHBox = this.getView().byId("idImgContainer");
        const aPages = oHBox.getItems();
        aPages[0].addStyleClass("selectImg");
        this.getView()
          .getModel("oProdDetModel")
          .setProperty("/fProdImg", aPages[0].getProperty("src"));
      },
    });
  }
);
