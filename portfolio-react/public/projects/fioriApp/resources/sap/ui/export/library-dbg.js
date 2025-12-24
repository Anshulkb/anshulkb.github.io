/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

/**
 * Initialization Code and shared classes of library sap.ui.export.
 */
sap.ui.define(["sap/ui/core/Lib"], function(Library) {
	"use strict";

	/**
	 * UI5 library: sap.ui.export - document export utilities
	 *
	 * @namespace
	 * @alias sap.ui.export
	 * @author SAP SE
	 * @version 1.142.0
	 * @public
	 */

	var thisLib = Library.init({
		name: "sap.ui.export",
		apiVersion: 2,
		dependencies: [
			"sap.ui.core"
		],
		types: [
			"sap.ui.export.Destination",
			"sap.ui.export.EdmType",
			"sap.ui.export.FileType",
			"sap.ui.export.Status"
		],
		interfaces: [],
		controls: [],
		elements: [],
		version: "1.142.0"
	});

	/**
	 * EDM data types for document export.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.50.0
	 */
	thisLib.EdmType = {

		/**
		 * Property of type BigNumber.
		 *
		 * @public
		 * @since 1.60
		 */
		BigNumber : "BigNumber",

		/**
		 * Property of type Boolean.
		 *
		 * @public
		 */
		Boolean : "Boolean",

		/**
		 * Property of type Currency
		 *
		 * @public
		 */
		Currency : "Currency",

		/**
		 * Property of type Date.
		 *
		 * @public
		 */
		Date : "Date",

		/**
		 * Property of type DateTime.
		 *
		 * @public
		 */
		DateTime : "DateTime",

		/**
		 * Property of type Enumeration.
		 *
		 * @public
		 * @since 1.58
		 */
		Enumeration : "Enumeration",

		/**
		 * Property of type Number.
		 *
		 * @public
		 */
		Number : "Number",

		/**
		 * Property of type Percentage.
		 *
		 * @public
		 * @since 1.87
		 */
		Percentage : "Percentage",

		/**
		 * Property of type string.
		 *
		 * @public
		 */
		String : "String",

		/**
		 * Property of type Time.
		 *
		 * @public
		 */
		Time : "Time",

		/**
		 * Property of type Timezone
		 *
		 * @public
		 * @since 1.118
		 */
		Timezone : "Timezone"
	};

	/**
	 * File types for document export.
	 *
	 * @enum {string}
	 * @public
	 * @since 1.78
	 */
	thisLib.FileType = {

		/**
		 * Comma separated values file type.
		 *
		 * @private
		 */
		CSV: "CSV",

		/**
		 * Google Sheets file type.
		 *
		 * @private
		 */
		GSHEET: "GSHEET",

		/**
		 * Portable Document Format (PDF) file type.
		 *
		 * @public
		 * @since 1.117
		 */
		 PDF: "PDF",

		/**
		 * Office Open XML - SpreadsheetML file type.
		 *
		 * @public
		 */
		XLSX: "XLSX"
	};

	/**
	 * File destinations for document export.
	 *
	 * @enum {string}
	 * @private
	 * @since 1.102
	 */
	thisLib.Destination = {

		/**
		 * Destination for local devices
		 *
		 * @private
		 */
		LOCAL: "LOCAL",

		/**
		 * Destination for remote or cloud file share
		 *
		 * @private
		 */
		REMOTE: "REMOTE"
	};

	/**
	 * Export status
	 *
	 * @enum {string}
	 * @private
	 * @since 1.121
	 */
	thisLib.Status = {
		/**
		 * Export finished
		 *
		 * @private
		 */
		FINISHED: "FINISHED",

		/**
		 * Export Updated
		 *
		 * @private
		 */
		UPDATE: "UPDATE"
	};

	// Register shims for non UI5 modules as these seem to have conflict with requirejs (if it is loaded before these modules)
	// Hence disable AMD loader for these modules to enable content retrieval via global names. (Enable using Browserify modules with RequireJS)
	sap.ui.loader.config({
		shim: {
			"sap/ui/export/js/XLSXBuilder": {
				amd: true,
				exports: "XLSXBuilder"
			},
			"sap/ui/export/js/CSVBuilder":{
				amd: true,
				exports: "CSVBuilder"
			}
		}
	});

	/**
	 * @typedef {object} sap.ui.export.SpreadsheetSettings
	 * @property {object} workbook - Spreadsheet properties object.
	 * @property {sap.ui.export.Column[]} workbook.columns - Column configurations.
	 * @property {object} [workbook.context] - Export context that will be applied to the exported file.
	 * @property {string} [workbook.context.application="SAP UI5"] - The application that creates the XLSX document.
	 * @property {string} [workbook.context.version="1.142.0"] - Application version that creates the XLSX document.
	 * @property {string} [workbook.context.title] - Title of the XLSX document (NOT the file name).
	 * @property {string} [workbook.context.modifiedBy] - User context for the XLSX document.
	 * @property {string} [workbook.context.sheetName] - The label of the data sheet.
	 * @property {string} [workbook.context.metaSheetName] - The label of the metadata sheet. The sheet will not be shown unless metadata entries are provided
	 * @property {Array.<{name: string, items: Array.<{key: string, value: string}>}>} [workbook.context.metainfo] - Metadata groups with key/value pairs.
	 * @property {string} [workbook.hierarchyLevel] - Name of the property that contains hierarchy level information.
	 * @property {string|object|Array|sap.ui.model.ListBinding|sap.ui.model.TreeBinding} dataSource
	 *     Source of spreadsheet data. Can be an array with row data, an URL, a binding instance, or an OData properties object.
	 * @property {"odata"} dataSource.type - Type of the data source. Currently, only OData is supported and the value has to be set to "odata".
	 * @property {string} dataSource.dataUrl - URL to table data on the server, including all select, filter, and search query parameters.
	 * @property {string} [dataSource.serviceUrl] - URL to the OData service. Required for OData batch requests.
	 * @property {number} [dataSource.count] - Count of available records on the server.
	 * @property {boolean} [dataSource.useBatch]
	 *     Whether batch requests are used to fetch the spreadsheet data. In this case, <code>serviceUrl</code> and <code>headers</code> have to be
	 *     specified, too.
	 * @property {Object.<string, string>} [dataSource.headers] - Map of HTTP request header properties.
	 * @property {number} [dataSource.sizeLimit] - Maximum allowed number of records that can be obtained from the service in a single request.
	 * @property {number} [dataSource.downloadLimit] - Maximum allowed number of rows that can be exported. If not specified, all rows are exported.
	 * @property {number} [count] - The maximal number of records to export. If not specified, all data from the data source is fetched.
	 * @property {boolean} [worker=true] - Whether to run the export process in a worker or the main thread.
	 * @property {string} [fileName="export.xlsx"] - File name for the exported file.
	 * @property {boolean} [showProgress=true] - Whether to show the progress dialog.
	 *
	 * @public
	 */

	/**
	 * @typedef {object} sap.ui.export.Column
	 * @property {string} [label] - Column header text.
	 * @property {string|string[]} [property] - Field name or array of field names in the data source feed.
	 * @property {sap.ui.export.EdmType} [type=sap.ui.export.EdmType.String] - Data type of the field.
	 * @property {number} [width=10]
	 *     Width of the column in characters. There is no 1:1 correspondence between character widths in the exported spreadsheet and CSS units. The
	 *     width of one character is approximately 0.5em in CSS units, depending on the fonts that are used in the table and in the resulting
	 *     spreadsheet.
	 * @property {string} [textAlign]
	 *     Horizontal alignment of cell contents. Accepted values: `left`, `right`, `center`, `begin`, `end`. If not specified, the columns are
	 *     aligned based on the type.</li>
	 * @property {number} [scale] - Number of digits after the decimal point for numeric values.
	 * @property {boolean} [autoScale] - Allows automatic scale assignment based on unit of measure.
	 * @property {boolean} [delimiter=false] - Whether to display thousands separators in numeric values.
	 * @property {string} [unit]
	 *     Text to display as the unit of measurement or currency next to the numeric value. It is treated as a string and has no influence on the
	 *     value itself. For example, a value of 150 with the unit "%" is still 150 and not 1.5, as a user may expect.
	 * @property {string} [unitProperty] - Name of the data source field that contains the unit/currency text.
	 * @property {boolean} [displayUnit=true] - Defines if the currency is shown in the column (applies to currency values only).
	 * @property {string} [trueValue] - Textual representation of a boolean type that has the value <code>true</code>.
	 * @property {string} [falseValue] - Textual representation of a boolean type that has the value <code>false</code>.
	 * @property {string} [template] - Formatting template that supports indexed placeholders within curly brackets.
	 * @property {string} [format] - Output format for columns of type Date/DateTime/Time.
	 * @property {string} [inputFormat] - Formatting template for string-formatted dates.
	 * @property {boolean} [utc] - Whether the <code>DateTime</code> is displayed as UTC or local time.
	 * @property {string} [timezone] - Defines a fixed IANA time zone.
	 * @property {string} [timezoneProperty] - References an OData property that contains the specific IANA time zone.
	 * @property {boolean} [displayTimezone] - Whether the IANA time zone is displayed within a cell.
	 * @property {object} [valueMap] - Mapping object or Map containing the values that should be mapped to a particular key.
	 * @property {boolean} [wrap] - Indicates if wrapping is enabled for this particular column.
	 *
	 * @public
	 */

	return thisLib;
});