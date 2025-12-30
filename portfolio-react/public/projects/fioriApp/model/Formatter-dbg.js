sap.ui.define(
  ["sap/ui/core/date/UI5Date", "sap/ui/core/format/DateFormat"],
  function (UI5Date, DateFormat) {
    "use strict";
    return {
      stockStatusString(sValue) {
        let status = "None";
        switch (sValue) {
          case "Low Stock":
            status = "Warning";
            break;

          case "In Stock":
            status = "Success";
            break;

          case "Out of Stock":
            status = "Error";
            break;
        }
        return status;
      },
      bindDimensions(oDimensions) {
        return oDimensions
          ? oDimensions.width +
              " x " +
              oDimensions.height +
              " x " +
              oDimensions.depth +
              " cm"
          : "";
      },
      firstLetterCaps(sStr) {
        return sStr ? sStr.charAt(0).toUpperCase() + sStr.substring(1) : "";
      },
      convertJoinToList(sStr) {
        return sStr ? sStr.replaceAll("; ", "\n") : "";
      },
      showPrice(fPrice, fDiscount) {
        let fCost = "";
        if (fPrice && fDiscount) {
          fCost = (fPrice - fPrice * (fDiscount / 100)).toFixed(2);
        }
        return fCost;
      },
      formatDate(sDate) {
        let formatterDate = "";
        if (sDate) {
          var oDate = UI5Date.getInstance(sDate);
          formatterDate = DateFormat.getDateTimeInstance().format(oDate);
        }
        return formatterDate;
      },
      ratingStatus(iValue) {
        switch (true) {
          case iValue > 3.5:
            return "Success";
            break;

          case iValue < 3.5 && iValue > 2:
            return "Warning";
            break;

          case iValue < 2:
            return "Error";
            break;

          default:
            return "None";
            break;
        }
      },
      stockStatus(iValue) {
        let sStatus = "None";
        switch (true) {
          case iValue > 30:
            sStatus = "Success";
            break;

          case iValue < 30 && iValue > 10:
            sStatus = "Warning";
            break;

          case iValue <= 10:
            sStatus = "Error";
            break;
        }
        return sStatus;
      },
      dateFormatter(sDate) {
        if (sDate) {
          const aDate = sDate.split("-");
          return (
            (aDate[2].length === 1 ? "0" : "") +
            aDate[2] +
            "-" +
            (aDate[1].length === 1 ? "0" : "") +
            aDate[1] +
            "-" +
            aDate[0]
          );
        }
        return "";
      },
      validateString(sValue) {
        let status = "None";
        sValue = sValue ?? "";
        if (sValue.trim() === "") status = "Error";
        return status;
      },
      validateStringText(sValue) {
        let msg = "";
        sValue = sValue ?? "";
        if (sValue.trim() === "") msg = "Please enter a valid value.";
        return msg;
      },
      validateStateCode(sValue) {
        sValue = sValue ?? "";
        let status = "None";
        if (sValue.trim() === "" || sValue.trim().length !== 2) {
          status = "Error";
        }
        return status;
      },
      validateStateCodeText(sValue) {
        sValue = sValue ?? "";
        let msg = "";
        if (sValue.trim() === "" || sValue.trim().length !== 2) {
          msg = "Please enter valid state code.";
        }
        return msg;
      },

      validatePincode(sValue) {
        let status = "None";
        sValue = sValue ?? "";
        if (Number(sValue) === 0 || sValue.length !== 5 || Number(sValue) < 0)
          status = "Error";
        return status;
      },
      validatePincodeText(sValue) {
        let msg = "";
        sValue = sValue ?? "";
        if (Number(sValue) === 0 || Number(sValue) < 0)
          msg = "Please enter a valid value.";
        else if (sValue.length !== 5) {
          msg = "Code should be 5 digits only.";
        }
        return msg;
      },
    };
  }
);
