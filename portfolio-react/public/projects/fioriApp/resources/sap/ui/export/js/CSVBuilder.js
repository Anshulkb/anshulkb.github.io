/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

sap.ui.define([
	"sap/ui/base/EventProvider",
	"sap/base/Log"
], function(EventProvider, Log) {
	"use strict";

	// Matches a formula (for usage see #escapeContent):
	// Starts with one of = + - @ but excludes "number only" formulas like -123,45 or =1.234e+5 as they are safe to use
	const rFormula = /^[=\+\-@](?![\d.,]+(?:e[\+-]?\d+)?$)/i;
	const MAX_CELL_LENGTH = 32760;

	/**
	 * CSVBuilder provides functionality to build and export data in CSV format.
	 *
	 * @extends sap.ui.base.EventProvider
	 * @class
	 * @constructor
	 * @param {Array.<Object>} aColumns Array of column metadata objects.
     *   Each object must have:
     *   <ul>
     *      <li>{string} label: The column header name in the CSV file.</li>
     *      <li>{string} property: The property name used to extract data for this column from each data row.</li>
     *   </ul>
	 * @param {string} [sSeparator=","] Character used to separate columns in the CSV file. Default is comma (",").
	 */
	const CSVBuilder = EventProvider.extend("sap.ui.export.js.CSVBuilder", {

		constructor: function(aColumns, sSeparator = ",") {

			this.validateSettings(aColumns, sSeparator);

			this.aCompleteData = [];
			this.aColumns = aColumns;
			this.sSeparator = sSeparator;

			// Create the regex for escaping content based on the separator
			const escapedSeparator = this.sSeparator.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
			this.rContentNeedsEscaping = new RegExp(`[\\r\\n"\\t${escapedSeparator}]`);
		},

		validateSettings(aColumns, sSeparator) {
			if (!Array.isArray(aColumns)) {
				throw new Error("Column information must be in form of an Array");
			}

			if (aColumns.length === 0) {
				throw new Error("Column information must not be an empty array");
			}

			if (!sSeparator || typeof sSeparator !== "string" || sSeparator.length !== 1) {
				throw new Error("Separator must be a single character string");
			}
		}
	});

	/**
	 * Appends data to the current dataset and converts it into a CSV-formatted string.
	 *
	 * @param {Array} aData An array of objects containing the data to be added to the dataset, which can later be converted into a CSV file
	 */
	CSVBuilder.prototype.append = function(aData) {
		const aColumnKeys = this.aColumns.map((col) => col.property);

		aData.forEach((obj) => {
			const aCells = [];

			aColumnKeys.forEach((key) => {
				aCells.push(this.getValue(obj, key));
			});

			this.aCompleteData.push(aCells.join(this.sSeparator));
		});
	};

	/**
	 * Retrieves and escapes the value of a specified property from a data object.
	 *
	 * @param {object} oData
	 * @param {string} sProperty
	 * @returns
	 */
	CSVBuilder.prototype.getValue = function(oData, sProperty) {
		let sValue = oData[sProperty];

		// Explicitly ignore NaN since the String conversion happens afterwards
		// Early return for empty strings will be handled by the escapeContent method
		if (sValue === null || typeof sValue === "undefined") {
			return "";
		}

		if (typeof sValue !== "string") {
			sValue = String(sValue);
		}

		return this.escapeContent(sValue);
	};

	/**
	 * Escapes the content of a cell in a CSV file according to the CSV format specification (RFC 4180).
	 *
	 * This method processes the input value and applies the following rules:
	 * <ul>
	 * <li>If the value contains special characters (for example, separator, newline, or double quotes), it is enclosed in double quotes.</li>
	 * <li>Double quotes within the value are escaped by doubling them (for example, `"` becomes `""`).</li>
	 * <li>If the value starts with '=', '+', '-', or '@', a single quote is prepended to prevent CSV injection.</li>
	 * <li>Values longer than 32,760 characters will be truncated to ensure compatibility with spreadsheet software.</li>
	 * </ul>
	 *
	 * @param {string} valueToCheck - The cell value to process and escape according to CSV rules
	 * @returns {string} The escaped value, ready for inclusion in a CSV file
	 */
	CSVBuilder.prototype.escapeContent = function(valueToCheck) {
		let sValue = valueToCheck;

		if (!sValue) {
			return sValue;
		}

		sValue = sValue.trim();

		// Remove Unicode BOM if present
		if (sValue.charCodeAt(0) === 0xFEFF) {
			sValue = sValue.slice(1);
		}

		// Prepend single quote in case cell content is a formula
		if (rFormula.test(sValue)) {
			sValue = "'" + sValue;
		}

		// Prevent cell overflow
		if (sValue.length > MAX_CELL_LENGTH) {
			sValue = sValue.slice(0, MAX_CELL_LENGTH);
			Log.warning("Cell content truncated to prevent overflow.");
		}

		// Convert value to string
		sValue = sValue.toString();

		// Check if the value contains the separator or other special characters
		const bContainsSeparatorChar = sValue.indexOf(this.sSeparator) > -1;

		// Only wrap content with double quotes if it contains the separator char,
		// a new line (CR / LF), a double quote, or other special characters
		if (bContainsSeparatorChar || this.rContentNeedsEscaping.test(sValue)) {
			// Escape double quotes by preceding them with another one
			sValue = sValue.replace(/"/g, '""');

			// Wrap final content with double quotes
			sValue = `"${sValue}"`;
		}

		return sValue;
	};

	/**
	 * Combines the column labels and corresponding row data into a CSV-formatted string using a separator defined in the settings.
	 *
	 * This method performs the following actions:
	 * <ul>
	 * <li>Converts the CSV-formatted string into a <code>Blob</code> object.</li>
	 * <li>Adds a UTF-8 Byte Order Mark (BOM) at the beginning of the <code>Blob</code> for compatibility with spreadsheet software.</li>
	 * </ul>
	 *
	 * @returns {Blob} A Blob object containing the CSV data with a UTF-8 BOM
	 */
	CSVBuilder.prototype.build = function() {

		// Generate the CSV header
		const aColumnNamesCSV = this.aColumns.map((item) => item.label);
		const sColumnNamesCSV = aColumnNamesCSV.join(this.sSeparator) + "\r\n";

		// Combine all line items into a CSV-formatted string
		const sCsvContent = this.aCompleteData.join("\r\n");

		// Combine the header and data
		const sCompleteCSV = sColumnNamesCSV + sCsvContent;

		// Add UTF-8 BOM
		const blobData = new TextEncoder().encode(sCompleteCSV);
		const blobBOM = Uint8Array.of(0xef, 0xbb, 0xbf);
		const blobContent = new Uint8Array(blobBOM.length + blobData.length);
		blobContent.set(blobBOM);
		blobContent.set(blobData, blobBOM.length);

		try {
			return new Blob([blobContent], {
				type: 'text/csv;charset=utf-8'
			});
		} catch (error) {
			throw new Error("Failed to create CSV Blob");
		}
	};

	return CSVBuilder;
});