/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

sap.ui.define([
		"./library",
		"./ExportBase",
		"./ExportDialog",
		"./ExportUtils",
		"./SpreadsheetExport",
		"sap/base/Log",
		"sap/base/i18n/Localization",
		"sap/ui/Device",
		"sap/ui/core/LocaleData"
	],
	function(Library, ExportBase, ExportDialog, ExportUtils, SpreadsheetExport, Log, Localization, Device, LocaleData) {
		"use strict";

		// eslint-disable-next-line
		/* global Blob */

		const CLASS_NAME = "sap.ui.export.Spreadsheet";
		const Status = Library.Status;

		/**
		 * Creates a new spreadsheet export object. Use this object to build and download a spreadsheet file in Office Open XML Spreadsheet format from tabular data.
		 * This functionality is normally used together with UI5 tables.
		 *
		 *
		 * <h3>Overview</h3>
		 * The class builds a spreadsheet in an Office Open XML Spreadsheet format using tabular data from a specified data source.
		 * Data is retrieved and the document is built asynchronously in a worker thread of the browser.
		 * The status of the process is visually presented to the user in a progress dialog that can be suppressed.
		 * The user can cancel the process with the Cancel button of the dialog.
		 *
		 *
		 * This class provides a low level API for spreadsheet export. The {@link sap.ui.comp.smarttable.SmartTable} control implements it internally and provides the export
		 * functionality out of the box. For special cases, please refer to details below.
		 *
		 *
		 * Optional features:
		 * <ul>
		 *   <li>Suppress the progress dialog.</li>
		 *   <li>Suppress worker and run the document generation process in a main thread.</li>
		 *   <li>Configure the exported file name.</li>
		 * </ul>
		 *
		 * <h3>Usage</h3>
		 * To start export, create a new <code>sap.ui.export.Spreadsheet</code> object and call the <code>build</code> method.
		 * Column configuration, data source, and export settings must be provided in the constructor.
		 * The <code>build</code> method opens a progress dialog and starts an asynchronous export process.
		 * The export process fetches data rows from the data source, builds a spreadsheet in-browser in a worker thread, and finally downloads the document
		 * to the client.
		 *
		 *
		 * Example:
		 * <pre>
		 *   const oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.build();
		 * </pre>
		 *
		 *
		 * Optionally, you can attach <code>onprogress</code> event listeners to be notified about the
		 * export progress and follow the completion status of the returned <code>Promise</code>.
		 *
		 *
		 * Example:
		 * <pre>
		 *   const oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.onprogress = function(iValue) {
		 *   	{@link sap.base.Log#debug Log.debug}("Export: %" + iValue + " completed");
		 *   };
		 *   oSpreadsheet.build()
		 *     .then( function() { {@link sap.base.Log#debug Log.debug}("Export is finished"); })
		 *     .catch( function(sMessage) { {@link sap.base.Log#error Log.error}("Export error: " + sMessage); });
		 * </pre>
		 *
		 *
		 * Example of column configuration:
		 * <pre>
		 *   const aColumns = [];
		 *   aColumns.push({
		 *   	label: "Name",
		 *   	property: "name"
		 *   });
		 *   aColumns.push({
		 *     label: "Salary",
		 *     property: "salary",
		 *     type: "number",
		 *     scale: 2
		 *   });
		 *
		 *   const mSettings = {
		 *     workbook: {
		 *       columns: aColumns,
		 *       context: {
		 *         application: 'Debug Test Application',
		 *         version: '1.142.0',
		 *         title: 'Some random title',
		 *         modifiedBy: 'John Doe',
		 *         metaSheetName: 'Custom metadata',
		 *         metainfo: [
		 *           {
		 *             name: 'Grouped Properties',
		 *             items: [
		 *               { key: 'administrator', value: 'Foo Bar' },
		 *               { key: 'user', value: 'John Doe' },
		 *               { key: 'server', value: 'server.domain.local' }
		 *             ]
		 *           },
		 *           {
		 *             name: 'Another Group',
		 *             items: [
		 *               { key: 'property', value: 'value' },
		 *               { key: 'some', value: 'text' },
		 *               { key: 'fu', value: 'bar' }
		 *             ]
		 *           }
		 *         ]
		 *       },
		 *       hierarchyLevel: 'level'
		 *     },
		 *     dataSource: mDataSource,
		 *     fileName: "salary.xlsx"
		 *   };
		 *   const oSpreadsheet = new sap.ui.export.Spreadsheet(mSettings);
		 *   oSpreadsheet.build();
		 * </pre>

		 *
		 * <h3>Restrictions</h3>
		 * For a complete list of restrictions, see:
		 * {@link topic:2c641481649f44de9c1c22c9c3c49d13 Spreadsheet Export Restrictions}
		 *
		 *
		 * You can export only the primitive cell data types that are listed in {@link sap.ui.export.EdmType}.
		 * Icons, images, check boxes, and complex controls in UI5 table cells are not supported.
		 *
		 *
		 * Custom formatter functions in data binding are not supported.
		 *
		 *
		 * The size of an exported table is limited by available browser
		 * memory. Export of large data sets can lead to memory overflow
		 * errors. Therefore, do not use <code>sap.ui.export.Spreadsheet</code>
		 * with data tables containing more than 2,000,000 table cells
		 * on desktop computers and more than 100,000 cells on mobile
		 * devices. Consider a specialized export solution in such cases.
		 * For example, MS Excel® can import spreadsheets from an OData
		 * services directly, without any UI.
		 *
		 *
		 * The export process runs in a worker thread whenever possible.
		 * However, code injection to native XMLHttpRequest events is not
		 * available in the worker environment. Therefore, the
		 * <code>worker</code> parameter in export settings should be set
		 * to <code>false</code> if the application uses a mock server to
		 * fetch table data.
		 *
		 *
		 * For exporting hierarchy level information, the maximum
		 * hierarchy depth is 8. This restriction results from the Office
		 * Open XML standard and the programs that can open such files.
		 * The sap.ui.export.Spreadsheet allows you to export more
		 * hierarchy levels although they might not be displayed
		 * correctly when opening the generated file if the hierarchy
		 * depth exceeds the value of 8.
		 *
		 * The column configuration must contain at least one column to
		 * execute the export process. If there is no column configured,
		 * the export will be canceled.
		 *
		 * If the export is used within a table, any row that is showing
		 * aggregated data (i.E. sum row) will not be exported.
		 *
		 * The properties sheetName and metaSheetName on the workbook.context
		 * object are limited to 31 characters each. If their value exceeds
		 * this maximum length, the value will be truncated.
		 *
		 * @param {sap.ui.export.SpreadsheetSettings} mSettings - Export settings
		 *
		 * @class The <code>sap.ui.export.Spreadsheet</code> class allows you to export table data from a UI5 application to a spreadsheet file.
		 *
		 * @author SAP SE
		 * @version 1.142.0
		 *
		 * @since 1.50
		 * @alias sap.ui.export.Spreadsheet
		 * @extends sap.ui.export.ExportBase
		 * @see {@link topic:2691788a08fc43f7bf269ea7c6336caf Spreadsheet}
		 * @public
		 */
		const Spreadsheet = ExportBase.extend(CLASS_NAME, {

			constructor: function(mSettings) {
				ExportBase.call(this, mSettings);

				/* Spreadsheet default settings */
				this._mSettings.customizing = {};
				this._mSettings.showProgress = true;
				this._mSettings.worker = true;

				/* Only apply supported properties */
				// IMPORTANT: keep count before dataSource to ensure that the expected count can be used for dataSource string
				["showProgress", "worker"].forEach(function(sProperty) {
					if (typeof mSettings[sProperty] !== "undefined") {
						this._mSettings[sProperty] = mSettings[sProperty];
					}
				}.bind(this));

				this.codeListsPromise = this.codeListsPromise instanceof Promise ? this.codeListsPromise : Promise.resolve([null, null]);
			}
		});

		function addUnit(sCurrencyCode, oCurrency, mCurrencies) {
			if (!(mCurrencies[sCurrencyCode] instanceof Object)) {
				mCurrencies[sCurrencyCode] = {};
			}

			if (!isNaN(oCurrency)) {
				mCurrencies[sCurrencyCode].scale = oCurrency;
			}

			if (!isNaN(oCurrency.UnitSpecificScale)) {
				mCurrencies[sCurrencyCode].scale = oCurrency.UnitSpecificScale;
			}

			if (isNaN(mCurrencies[sCurrencyCode].scale)) {
				delete mCurrencies[sCurrencyCode];
			}
		}

		/**
		 * Sets the default document title and sheet name to the export parameters object.
		 *
		 * @param {object} mParameters - Export parameters object
		 * @returns {Promise} Promise object
		 *
		 * @async
		 * @private
		 */
		Spreadsheet.prototype.setDefaultExportSettings = async function(mParameters) {
			const oResourceBundle = await ExportUtils.getResourceBundle();

			/* Attach timezone customizing */
			mParameters.customizing.timezone = ExportUtils.getTimezoneTranslations();

			/**
			 * Check if a document title and a sheet name have been defined in the 'context' settings.
			 * Otherwise use default resource bundle properties
			 */
			let oWorkbookContext = mParameters.workbook.context;

			if (!(oWorkbookContext instanceof Object)) {
				oWorkbookContext = mParameters.workbook.context = {};
			}
			if (!oWorkbookContext.title) {
				oWorkbookContext.title = oResourceBundle.getText("XLSX_DEFAULT_TITLE");
			}
			if (!oWorkbookContext.sheetName) {
				oWorkbookContext.sheetName = oResourceBundle.getText("XLSX_DEFAULT_SHEETNAME");
			}

			/* Initialize currency customizing for currencies and units of measure */
			const mCurrencySettings = mParameters.customizing.currency = {};
			const mUnitSettings = mParameters.customizing.unit = {};
			const oLocaleData = LocaleData.getInstance(Localization.getLanguageTag());
			const oLocaleDataCurrencies = oLocaleData.getAllCurrencyDigits();

			/* Attach custom currency configuration */
			if (oLocaleDataCurrencies) {
				for (const sCurrencyCode in oLocaleDataCurrencies) {
					addUnit(sCurrencyCode, oLocaleDataCurrencies[sCurrencyCode], mCurrencySettings);
				}
			}

			/* Attach CodeLists customizing */
			let sUnitCode;
			const [mCurrencyCodes, mUnitsOfMeasure] = await this.codeListsPromise;

			for (sUnitCode in mCurrencyCodes) {
				addUnit(sUnitCode, mCurrencyCodes[sUnitCode], mCurrencySettings);
			}

			for (sUnitCode in mUnitsOfMeasure) {
				addUnit(sUnitCode, mUnitsOfMeasure[sUnitCode], mUnitSettings);
			}
		};

		/**
		 * Requests the unit and currency specific code lists from
		 * the ODataMetaModel and attaches it to the export settings.
		 *
		 * @param {sap.ui.model.odata.ODataMetaModel} oMetaModel - ODataMetaModel instance that is used to request service specific code lists.
		 * @param {object} mSettings - Export settings that will receive the code lists
		 * @returns {Promise} The returned Promise will always resolve with an Array
		 *
		 * @private
		 */
		Spreadsheet.requestCodeLists = function(oMetaModel) {
			if (!oMetaModel.isA(["sap.ui.model.odata.ODataMetaModel", "sap.ui.model.odata.v4.ODataMetaModel"])) {
				return Promise.resolve([null, null]);
			}

			return Promise.all([
				oMetaModel.requestCurrencyCodes(),
				oMetaModel.requestUnitsOfMeasure()
			]).catch(function(oError) {
				Log.warning(CLASS_NAME + ": Code lists cannot be processed due to the following error - " + oError);
				return Promise.resolve([null, null]);
			});
		};

		/**
		 * The <code>beforeSave</code> event is fired just before the generated file is saved to the file system.
		 * This event allows you to prevent the default action that closes the <code>ExportDialog</code> and
		 * saves the file to your local device. If the default is prevented, the event handler is responsible
		 * for closing and destroying the <code>Dialog</code>.
		 *

		 * @param {sap.ui.base.Event} oEvent
		 * @param {sap.ui.base.EventProvider} oEvent.getSource
		 * @param {object} oEvent.getParameters
		 * @param {ArrayBuffer} oEvent.getParameter.data The data parameter contains the generated file
		 * @param {sap.ui.export.ExportDialog} oEvent.getParameter.exportDialog The export dialog instance
		 *
		 * @name sap.ui.export.Spreadsheet#beforeSave
		 * @event
		 * @since 1.61
		 * @public
		 */

		/**
		 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.export.Spreadsheet#event:beforeSave}
		 * event of this <code>sap.ui.export.Spreadsheet</code>.</br>
		 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
		 * otherwise it will be bound to this <code>sap.ui.export.Spreadsheet</code> itself.</br>
		 * This event is fired just before the generated file is saved to the file system.
		 *
		 * @param {object} [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
		 * @param {function} fnHandler The function to be called when the event occurs
		 * @param {object} [oListener] Context object to call the event handler with. Defaults to this <code>sap.ui.export.Spreadsheet</code> itself
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.61
		 * @public
		 */
		Spreadsheet.prototype.attachBeforeSave = function(oData, fnHandler, oListener) {
			return this.attachEvent("beforeSave", oData, fnHandler, oListener);
		};

		/**
		 * Detaches event handler <code>fnFunction</code> from the {@link sap.ui.export.Spreadsheet beforeSave}
		 * event of this <code>sap.ui.export.Spreadsheet</code>.</br>
		 * The passed function and listener object must match the ones used for event registration.
		 *
		 * @param {function} fnHandler The function to be called, when the event occurs
		 * @param {object} [oListener] Context object on which the given function had to be called
		 * @returns {this} Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.61
		 * @public
		 */
		Spreadsheet.prototype.detachBeforeSave = function(fnHandler, oListener) {
			return this.detachEvent("beforeSave", fnHandler, oListener);
		};

		/**
		 * Cancels a running export process. This method does nothing if no export is running.
		 *
		 * @returns {this} - Reference to <code>this</code> in order to allow method chaining
		 *
		 * @since 1.52
		 * @public
		 */
		Spreadsheet.prototype.cancel = function() {
			if (this.process) {
				this.process.cancel();
				this.process = null;
			}

			return this;
		};

		/**
		 * Returns the specific MIME type
		 *
		 * @returns {string} MIME type for Office Open XML Spreadsheet
		 *
		 * @since 1.112
		 * @public
		 */
		Spreadsheet.prototype.getMimeType = function() {
			return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
		};

		/**
		 * Progress callback. The function is called when the progress status changes.
		 *
		 * @param {number} iFetched - Number of items that are already fetched
		 * @param {number} iTotal - Total amount of items that will be fetched
		 *
		 * @private
		 */
		Spreadsheet.prototype.onprogress = function(iFetched, iTotal) {
			if (isNaN(iFetched) || isNaN(iTotal)) {
				return;
			}

			const iProgress = Math.round(iFetched / iTotal * 100);
			Log.debug(`Spreadsheet export: ${iProgress}% loaded.`);
		};

		/**
		 * Creates a valid dataSource configuration
		 *
		 * @param {sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oBinding - A subclass of <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
		 * @returns {object} - Valid data source configuration built upon the ListBinding
		 *
		 * @private
		 */
		Spreadsheet.prototype.createDataSourceFromBinding = function(oBinding) {
			/**
			 * Use empty array as default in case of <code>ListBinding</code> is not of type
			 * ClientListBinding and does not provide a getDownloadUrl function
			 */
			let oDataSource = [];

			/**
			 * If <code>ClientListBinding</code>, we use the binding path to receive the data from the underlying model
			 */
			if (oBinding.isA("sap.ui.model.ClientListBinding")) {
				const aData = [];

				oBinding.getAllCurrentContexts().forEach(function(oContext) {
					aData.push(oContext.getObject());
				});

				oDataSource = {
					data: aData,
					type: "array"
				};
			}

			if (oBinding.isA("sap.ui.model.ClientTreeBinding")) {
				Log.error("Unable to create dataSource configuration due to not supported Binding: " + oBinding.getMetadata().getName());
			}

			/**
			 * All other <code>Bindings</code> need to provide a downloadUrl
			 */
			if (typeof oBinding.getDownloadUrl === "function") {
				const oModel = oBinding.getModel();
				const bV4ODataModel = oModel.isA("sap.ui.model.odata.v4.ODataModel");
				let sDataUrl = oBinding.getDownloadUrl("json");
				let sServiceUrl = oModel.sServiceUrl;

				sDataUrl = ExportUtils.interceptUrl(sDataUrl);
				sServiceUrl = ExportUtils.interceptUrl(sServiceUrl);

				const bIgnoreCount = sDataUrl.split(/[?&]/g).some((sQuery) => sQuery?.includes("$apply") && sQuery?.includes("com.sap.vocabularies.Hierarchy.v1.TopLevels"));

				oDataSource = {
					type: "odata",
					dataUrl: sDataUrl,
					serviceUrl: sServiceUrl,
					headers: bV4ODataModel ? oModel.getHttpHeaders(true) : oModel.getHeaders(),
					// Ignore count for hierarchical V4 services
					count: bIgnoreCount ? undefined : ExportUtils.getCountFromBinding(oBinding),
					useBatch: bV4ODataModel || oModel.bUseBatch
				};

				/* Obtain CodeLists from ODataMetaModel */
				if (oModel.getMetaModel()
					&& typeof oModel.getMetaModel().requestCurrencyCodes === "function"
					&& typeof oModel.getMetaModel().requestUnitsOfMeasure === "function") {

					this.codeListsPromise = Spreadsheet.requestCodeLists(oModel.getMetaModel(), this._mSettings);
				}
			}

			return oDataSource;
		};

		/**
		 * Sets the data source configuration that will be used for exporting the data. If the passed parameter is null,
		 * the call will be ignored.
		 *
		 * @param {string|Array|Object|sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oDataSource Possible types are a plain
		 *        string that contains an URL of an OData service, an array of JSON objects, a data source configuration,
		 *        a <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
		 * @returns {object|null} - Valid dataSource object or null in case the dataSource configuration is not supported
		 *
		 * @since 1.73
		 * @public
		 */
		Spreadsheet.prototype.processDataSource = function(oDataSource) {
			const sDataSourceType = typeof oDataSource;
			let mDataSource = null;

			if (!oDataSource) {
				return null;
			}

			if (sDataSourceType == "string") {
				return {
					count: this._mSettings.count,
					dataUrl: oDataSource,
					type: "odata",
					useBatch: false
				};
			}

			if (sDataSourceType != "object") {
				Log.error("Spreadsheet#processDataSource: Unable to apply data source of type " + sDataSourceType);

				return null;
			}

			if (oDataSource instanceof Array ) {
				mDataSource = {data: oDataSource, type: "array"};
			}

			if (oDataSource.dataUrl) {
				mDataSource = oDataSource;
			}

			if (oDataSource.isA && oDataSource.isA(["sap.ui.model.ListBinding", "sap.ui.model.TreeBinding"])) {
				mDataSource = this.createDataSourceFromBinding(oDataSource);
			}

			return mDataSource;
		};

		/**
		 * Creates and returns a new Promise object that triggers the export process for the given {@link sap.ui.export.Spreadsheet}.
		 *
		 * @param {object} mParameters - Export parameters object
		 * @returns {Promise} Promise object
		 *
		 * @private
		 */
		Spreadsheet.prototype.createBuildPromise = function(mParameters) {
			const that = this;

			return new Promise(function(fnResolve, fnReject) {

				let progressDialog;
				const MAX_ROWS = 1_048_576; // Maximum allowed Rows per sheet
				const iCount = mParameters.dataSource.count;
				const iDownloadLimit = mParameters.dataSource.downloadLimit;
				const nSizeLimit = Device.system.desktop ? 2_000_000 : 100_000; // 2.000.000 cells on desktop and 100.000 otherwise
				const nRows = mParameters.dataSource.type == "array" ? mParameters.dataSource.data.length : iDownloadLimit || iCount;
				const nColumns = mParameters.workbook.columns.length;

				function onmessage(oMessage) {

					if (oMessage.progress) {
						if (progressDialog) {
							progressDialog.updateStatus(oMessage.fetched, oMessage.total);
						}
						that.onprogress(oMessage.fetched, oMessage.total);
					}

					/*
					 * It is important to check if the process is still assigned, this allows to cancel the export
					 * even though all rows have been appended to the Spreadsheet but the file has not been saved yet
					 */
					if (oMessage.finished && that.process !== null) {
						that.process = null;

						if (!oMessage.spreadsheet) {
							fnReject();
							return;
						}

						const executeDefaultAction = that.fireEvent("beforeSave", {
							data: oMessage.spreadsheet,
							exportDialog: progressDialog
						}, true, false);

						if (executeDefaultAction) {
							/*
							* Keep the progress dialog open for 1 second to avoid
							* screen flickering in case of extremely fast exports
							*/
							if (progressDialog) {
								window.setTimeout(progressDialog.finish, 1000);
							}

							ExportUtils.saveAsFile(new Blob([oMessage.spreadsheet], {
								type: that.getMimeType()
							}), mParameters.fileName);
						}

						ExportUtils.announceExportStatus(Status.FINISHED, { assertive: true });
						fnResolve();
					}

					if (typeof oMessage.error != "undefined") {
						const sError = oMessage.error.message || oMessage.error;
						that.process = null;

						if (progressDialog) {
							progressDialog.finish();
						}

						fnReject(sError);
						ExportDialog.showErrorMessage(sError);
					}
				}

				function isDownloadLimitLessThanCount(iDownloadLimit, iCount) {
					return (iDownloadLimit < iCount);

				}

				function startExport() {
					if (!mParameters.showProgress) {
						if (that.process) {
							fnReject("Cannot start export: the process is already running");
							return;
						}

						that.process = SpreadsheetExport.execute(mParameters, onmessage);
						return;
					}

					// Show progress dialog
					ExportDialog.getProgressDialog().then(function(oDialogResolve) {
						progressDialog = oDialogResolve;

						if (that.process) {
							fnReject("Cannot start export: the process is already running");
							return;
						}

						progressDialog.oncancel = function() {
							return that.process && that.process.cancel();
						};

						progressDialog.open();

						// Set initial status
						progressDialog.updateStatus(0, Math.min(iDownloadLimit || MAX_ROWS, iCount || MAX_ROWS));

						// Start export once the dialog is present and the code lists have been loaded
						that.process = SpreadsheetExport.execute(mParameters, onmessage);
					});
				}

				// When there are no columns --> don't trigger the export
				if (nColumns <= 0) {
					// Consider showing a dialog to the end users instead of just this error!
					fnReject("No columns to export.");
				} else if (nRows * nColumns > nSizeLimit || !nRows || nRows >= MAX_ROWS || isDownloadLimitLessThanCount(nRows, iCount)) { // Amount of rows need to be less than maximum amount because of column header
					const oDialogSettings = {
						rows: nRows,
						columns: nColumns,
						cellLimit: nSizeLimit,
						rowLimit: MAX_ROWS,
						fileType: Library.FileType.XLSX,
						count: iCount
					};

					// Show warning and execute
					ExportDialog.showWarningDialog(oDialogSettings)
						.then(startExport)
						.catch(fnReject);
				} else {
					startExport();
				}

			});
		};

		return Spreadsheet;
	});
