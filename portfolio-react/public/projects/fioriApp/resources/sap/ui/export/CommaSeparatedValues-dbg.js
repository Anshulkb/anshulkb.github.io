/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

sap.ui.define([
	"./library",
	"sap/base/Log",
	"sap/ui/export/js/CSVBuilder",
	"sap/ui/export/ExportBase",
	"sap/ui/export/ExportUtils"
], function(library, Log, CSVBuilder, ExportBase, ExportUtils) {
	"use strict";

	const FileType = library.FileType;

	/**
	 * Provides functionality to export data in CSV format.
	 *
	 * The <code>CommaSeparatedValues</code> class extends the <code>ExportBase</code> class and provides the functionality to create CSV files.
	 * It supports appending data, validating data, escaping content, and building the final CSV file. Additionally, it provides methods to
	 * process data sources, apply default export settings, and manage the export process.
	 *
	 * There are the following key features:
	 * <ul>
	 * <li>Supports JSON arrays and ClientListBindings as data sources.</li>
	 * <li>Escapes special characters and prevents CSV injection.</li>
	 * <li>Adds a UTF-8 Byte Order Mark (BOM) for compatibility with spreadsheet software.</li>
	 * </ul>
	 *
	 * Example Usage:
	 * ```javascript
	 * const oCSV = new sap.ui.export.CommaSeparatedValues(mSettings);
	 * oCSV.build();
	 * ```
	 *
	 * @class sap.ui.export.CommaSeparatedValues
	 * @extends sap.ui.export.ExportBase
	 * @alias sap.ui.export.CommaSeparatedValues
	 * @public
	 * @since 1.142
	 */
	const CSV = ExportBase.extend("sap.ui.export.CommaSeparatedValues", {});

	/**
	 * Marks the current export process as cancelled which prevents the file from being saved.
	 *
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @public
	 */
	CSV.prototype.cancel = function() {
		if (!this._bIsCancelled) {
			this._bIsCancelled = true;
		}

		return this;
	};

	/**
	 * Sets the data source configuration that is used for exporting the data.
	 *
	 * <ul>
	 * <li>If the passed parameter is null, the call is ignored.</li>
	 * <li>Supports JSON arrays as data sources.</li>
	 * <li>Logs an error for unsupported data source types.</li>
	 * </ul>
	 *
	 * @param {object|sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oDataSource Possible types are a data
	 * source configuration, a <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
	 * @returns {object|null} Valid <code>dataSource</code> object or null in case the <code>dataSource</code> configuration is not supported
	 *
	 * @private
	 */
	CSV.prototype.processDataSource = function(oDataSource) {
		const sDataSourceType = typeof oDataSource;
		const mDataSource = {data: [], type: "array"};

		if (!oDataSource) {
			return null;
		}

		if (sDataSourceType !== "object") {
			Log.error("CommaSeparatedValues#processDataSource: Unable to apply data source of type " + sDataSourceType);

			return null;
		}

		if (oDataSource.dataUrl) {
			Log.error("CommaSeparatedValues#processDataSource: URLs (such as dataUrl) are not supported as data sources. Type: " + sDataSourceType);

			return null;
		}

		if (Array.isArray(oDataSource)) {
			mDataSource.data = oDataSource;
		}

		/**
		 * If <code>ClientListBinding</code>, we use the binding path to receive the
		 * data from the underlying model. This takes sorter and filters into account.
		 */
		if (oDataSource.isA?.("sap.ui.model.ClientListBinding")) {
			const aData = [];

			oDataSource.getAllCurrentContexts().forEach(function(oContext) {
				aData.push(oContext.getObject());
			});

			mDataSource.data = aData;
		}

		return mDataSource;
	};

	/**
	 * Applies default settings to the export configuration.
	 *
	 * - Adjusts the provided settings object to include default values where necessary.
	 * - Delegates the actual adjustment logic to the CSVBuilder instance.
	 *
	 * @param {object} mParameters Export parameters object
	 *
	 * @returns {Promise} A Promise that resolves when default settings have been applied
	 * @private
	 */
	CSV.prototype.setDefaultExportSettings = function(mParameters) {
		if (!mParameters.fileType) {
			mParameters.fileType = FileType.CSV;
		}

		if (!mParameters.workbook.separator) {
			mParameters.workbook.separator = ",";
		}

		return Promise.resolve();
	};

	/**
	 * Creates a Promise that is resolved after the export has been finished.
	 *
	 * - Ensures that no other export process is running before starting a new one.
	 * - Resolves the Promise with the result of the build process.
	 * - Rejects the Promise if an error occurs or if a process is already running.
	 *
	 * @param {object} mParameters Validated export configuration
	 * @returns {Promise} A Promise that resolves when the build is complete
	 *
	 * @private
	 */
	CSV.prototype.createBuildPromise = function(mParameters) {
		try {
			if (this._oBuilder) {
				return Promise.reject('Cannot start export: The process is already running');
			}

			const mWorkbook = mParameters.workbook;

			this._bIsCancelled = false;
			this._oBuilder = new CSVBuilder(mWorkbook.columns, mWorkbook.separator);
			this._oBuilder.append(mParameters.dataSource.data);

			const oBlob = this._oBuilder.build();

			if (!this._bIsCancelled) {
				ExportUtils.saveAsFile(oBlob, mParameters.fileName);
			}

			this._oBuilder = null;

			return Promise.resolve();
		} catch (oError) {
			return Promise.reject(oError);
		}
	};

	/**
	 * Returns the specific MIME type.
	 *
	 * @public
	 * @returns {string} The MIME type of the Comma Separated Values format
	 */
	CSV.prototype.getMimeType = function() {
		return "text/csv";
	};

	return CSV;
});