sap.ui.define(
  ["sap/ui/export/Spreadsheet", "sap/m/MessageToast"],
  (Spreadsheet, MessageToast) => {
    "use strict";
    const oConfig = {
      Employees: {
        fields: [
          "Employee ID",
          "Name",
          "Age",
          "Gender",
          "Email",
          "Phone Number",
          "Date of Birth",
          "Blood Group",
          "Address",
          "Country",
          "SSN",
          "Role",
          "Designation",
          "Department",
          "Company",
          "Company Address",
        ],
        template: [{}],
        columns: [
          {
            label: "Employee ID",
            property: "id",
            type: "String",
          },
          {
            label: "Name",
            property: "fullName",
            type: "String",
          },
          {
            label: "Age",
            property: "age",
            type: "String",
          },
          {
            label: "Gender",
            property: "gender",
            type: "String",
          },
          {
            label: "Email",
            property: "email",
            type: "String",
          },
          {
            label: "Phone Number",
            property: "phone",
            type: "String",
          },
          {
            label: "Date of Birth",
            property: "birthDate",
            type: "String",
          },
          {
            label: "Blood Group",
            property: "bloodGroup",
            type: "String",
          },
          {
            label: "Address",
            property: "personalAddress",
            type: "String",
          },
          {
            label: "Country",
            property: "address/country",
            type: "String",
          },
          {
            label: "SSN",
            property: "ssn",
            type: "String",
          },
          {
            label: "Role",
            property: "role",
            type: "String",
          },
          {
            label: "Designation",
            property: "company/title",
            type: "String",
          },
          {
            label: "Department",
            property: "company/department",
            type: "String",
          },
          {
            label: "Company",
            property: "company/name",
            type: "String",
          },
          {
            label: "Company Address",
            property: "companyAddress",
            type: "String",
          },
        ],
      },
      Products: {
        fields: [
          "Product Name",
          "Description",
          "Brand",
          "Category",
          "Price",
          "Discount",
          "Rating",
          "Stock",
          "Tags",
          "Stock keeping unit",
          "Weight",
          "Dimensions (WxHxD)",
          "Warranty Details",
          "Shipping Information",
          "Availability",
          "Return Policy",
          "Minimum Order Quantity",
          "Barcode",
          "QR Code",
          "Images",
          "Thumbnail",
        ],
        columns: [
          {
            label: "Product Name",
            property: "title",
            type: "String",
          },
          {
            label: "Description",
            property: "description",
            type: "String",
          },
          {
            label: "Brand",
            property: "brand",
            type: "String",
          },
          {
            label: "Category",
            property: "category",
            type: "String",
          },
          {
            label: "Price",
            property: "price",
            type: "String",
          },
          {
            label: "Discount",
            property: "discountPercentage",
            type: "String",
          },
          {
            label: "Rating",
            property: "rating",
            type: "String",
          },
          {
            label: "Stock",
            property: "stock",
            type: "String",
          },
          {
            label: "Tags",
            property: "tags",
            type: "String",
          },
          {
            label: "Stock keeping unit",
            property: "sku",
            type: "String",
          },
          {
            label: "Weight",
            property: "weight",
            type: "String",
          },
          {
            label: "Dimensions (WxHxD)",
            property: "prodDim",
            type: "String",
          },
          {
            label: "Warranty Details",
            property: "warrantyInformation",
            type: "String",
          },
          {
            label: "Shipping Information",
            property: "shippingInformation",
            type: "String",
          },
          {
            label: "Availability",
            property: "availabilityStatus",
            type: "String",
          },
          {
            label: "Return Policy",
            property: "returnPolicy",
            type: "String",
          },
          {
            label: "Minimum Order Quantity",
            property: "minimumOrderQuantity",
            type: "String",
          },
          {
            label: "Barcode",
            property: "meta/barcode",
            type: "String",
          },
          {
            label: "QR Code",
            property: "meta/qrCode",
            type: "String",
          },
          {
            label: "Images",
            property: "images",
            type: "String",
          },
          {
            label: "Thumbnail",
            property: "thumbnail",
            type: "String",
          },
        ],
        template: [
          {
            title: "",
            description: "",
            category: "",
            price: 0.0,
            discountPercentage: 0.0,
            rating: 0.0,
            stock: "",
            tags: "value1; value2",
            sku: "",
            weight: 0.0,
            prodDim: "WxHxD",
            warrantyInformation: "",
            shippingInformation: "",
            availabilityStatus: "",
            returnPolicy: "",
            minimumOrderQuantity: "",
            meta: {
              barcode: "",
              qrCode: "",
            },
            images: "image1; image2",
            thumbnail: "",
            brand: "",
          },
        ],
      },
    };

    const getConfig = (sSource) => oConfig[sSource] || oConfig.Employees;
    return {
      validateData(rawData, sSource) {
        if (!rawData?.length) {
          return [{ error: "File is empty." }];
        }
        const headers = rawData[0];
        let errors = [];
        const { fields } = getConfig(sSource);
        fields.forEach((expected, index) => {
          if (headers[index] !== expected) {
            errors.push({
              error: `Expected ${expected} but found "${
                headers[index] || ""
              }" at column ${index + 1}`,
            });
          }
        });
        return errors.length > 0 ? errors : "Success";
      },

      formatData(rawData, sSource) {
        const rows = rawData.slice(1);
        const { fields } = getConfig(sSource);
        const headers = [...fields, "isDeleted"];

        return rows.map((row) =>
          headers.reduce((obj, key, i) => {
            obj[key] = row[i] ?? "";
            return obj;
          }, {})
        );
      },
      downloadSpreadsheet(sName, isWorker, sSource, aData) {
        const { columns, template } = getConfig(sSource);
        const oSettings = {
          workbook: { columns },
          dataSource: aData ?? template,
          fileName: sName,
          worker: isWorker,
        };
        const oSheet = new Spreadsheet(oSettings);
        sap.ui.core.BusyIndicator.show(0);
        oSheet
          .build()
          .then(() => MessageToast.show("File is currently downloading."))
          .catch((err) => String(err))
          .finally(() => {
            sap.ui.core.BusyIndicator.hide();
            oSheet.destroy();
          });
      },
    };
  }
);
