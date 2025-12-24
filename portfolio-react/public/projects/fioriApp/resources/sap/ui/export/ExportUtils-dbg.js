/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	"./library",
	"./util/Filter",
	"sap/base/config",
	"sap/base/Log",
	"sap/base/i18n/Formatting",
	"sap/base/i18n/Localization",
	"sap/base/i18n/date/CalendarType",
	"sap/ui/core/Element",
	"sap/ui/core/Fragment",
	"sap/ui/core/InvisibleMessage",
	"sap/ui/core/Lib",
	"sap/ui/core/Locale",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/library",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/LocaleData",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/resource/ResourceModel",
	"sap/ui/performance/trace/FESRHelper",
	"sap/ui/util/openWindow",
	"sap/ui/VersionInfo"
], function(library, Filter, BaseConfig, Log, Formatting, Localization, CalendarType, Element, Fragment, InvisibleMessage, Library, Locale, DateFormat, coreLibrary, syncStyleClass, LocaleData, JSONModel, ResourceModel, FESRHelper, openWindow, VersionInfo) {
	"use strict";

	// eslint-disable-next-line
	/* global Blob, MouseEvent, FileReader, URL */

	// Shortcuts
	const ValueState = coreLibrary.ValueState;
	const FileType = library.FileType;
	const EdmType = library.EdmType;
	const Destination = library.Destination;
	const MessageMode = coreLibrary.InvisibleMessageMode;

	let uiVersion = null;
	let oDefaultFormatSettings = null;

	/* Async call to resource bundle */
	let oResourceBundle;

	const CLASS_NAME = "sap.ui.export.ExportUtils";
	const UNSUPPORTED_SHEETNAME_CHARACTERS_REGEX = /[\\\/\?\*:\[\]]/g;
	const MAX_STRING_LENGTH = 256;

	/*
	 * Trigger loading of sap-ui-version.json during initialization,
	 * although it is not 100% ensured that the version is available
	 * when the variable is accessed, it is most likely the case.
	 */
	VersionInfo.load().then(function(oVersionInfo) {
		const aMatch = /^[0-9]+\.[0-9]+/.exec(oVersionInfo.version);

		uiVersion = aMatch ? aMatch[0] : null;
	});

	/* Reset cached format settings if formatSettings changed */
	Formatting.attachChange(() => {
		oDefaultFormatSettings = null;
	});

	/* Initialize InvisibleMessage early */
	// BCP 2380135231 - Fails when called before the DOM has been initialized
	// InvisibleMessage.getInstance();

	/* Returns the Export Settings used by the User Settings Dialog */
	function getDefaultSettings(oCustomConfig, oResourceBundle, oExportCapabilities, bRemoteDestination) {
		const aSupportedFormats = Object.keys(oExportCapabilities);

		const oDefaultConfig = {
			fileName: "Standard",
			fileTypeCollection: [],
			fileType: "XLSX",
			destinationCollection: [
				{ key: Destination.LOCAL, text: oResourceBundle.getText("DESTINATION_LOCAL") }
			],
			destination: Destination.LOCAL,
			paperSize: "DIN_A4",
			orientation: "LANDSCAPE",
			splitCells: false,
			includeFilterSettings: false,
			addDateTime: false,
			doEnableAccessibility: false,
			pdfArchive: false,
			capabilities: oExportCapabilities,
			fitToPage: false,
			paperSizeCollection: [
				{ key: "DIN_A4", text: oResourceBundle.getText("PAPER_SIZE_A4") },
				{ key: "US_LETTER", text: oResourceBundle.getText("PAPER_SIZE_US_LETTER") }
			],
			orientationCollection: [
				{ key:"LANDSCAPE", text: oResourceBundle.getText("ORIENTATION_LAND") },
				{ key:"PORTRAIT", text: oResourceBundle.getText("ORIENTATION_PORT") }
			],
			fontSize: 10,
			signature: false,
			signatureReason: "",
			showPageNumber: true
		};

		aSupportedFormats.forEach(function(sFormat) {
			const sFileType = sFormat.toUpperCase();
			const sResourceBundleKey = `${sFileType}_FILETYPE`;

			oDefaultConfig.fileTypeCollection.push({
				key: sFileType,
				text: oResourceBundle.getText(sResourceBundleKey)
			});
		});

		if (bRemoteDestination) {
			oDefaultConfig.destinationCollection.push({
				key: "REMOTE",
				text:  oResourceBundle.getText("DESTINATION_REMOTE")
			});
		}

		const oExportConfig = Object.assign({}, oDefaultConfig, oCustomConfig || {});

		/* Select first element if selected key is unavailable */
		if (!oExportConfig.fileTypeCollection.some(function(oEntry) {
			return oEntry.key === oExportConfig.fileType;
		})) {
			oExportConfig.fileType = oExportConfig.fileTypeCollection[0].key;
		}

		return oExportConfig;
	}

	function processExportSettings(oSettings) {
		const oFinalSettings = {};

		["fileName", "fileType", "paperSize", "orientation", "splitCells", "includeFilterSettings", "addDateTime", "doEnableAccessibility", "fitToPage", "fontSize", "signature", "signatureReason", "pdfArchive", "destination", "showPageNumber"].forEach(function(sProperty) {
			oFinalSettings[sProperty] = oSettings[sProperty];
		});

		return oFinalSettings;
	}

	/**
	 * @class Utilities related to export to enable reuse in integration scenarios (e.g. tables).
	 *
	 * @author SAP SE
	 * @version 1.142.0
	 *
	 * @since 1.59
	 * @alias sap.ui.export.ExportUtils
	 * @private
	 * @ui5-restricted sap.ui.comp.smarttable.SmartTable
	 */
	const Utils = {

		_INTERCEPTSERVICE: "sap/ushell/cloudServices/interceptor/InterceptService",
		/**
		 * Uses the Launchpad Cloud Service to intercept a given URL.
		 *
		 * @param {string} sUrl The URL to intercept
		 * @return {string} The intercepted URL
		 *
		 * @static
		 * @since 1.112
		 * @public
		 */
		interceptUrl: function(sUrl) {
			// Check if cloud InterceptService exists (for destination routing) - See JIRA: FIORITECHP1-8941
			// This is necessary for cloud instances e.g. SAP CP, due to some destination routing that is not known by UI5 model/client!
			const InterceptService = sap.ui.require(Utils._INTERCEPTSERVICE);
			if (InterceptService) {
				const oInterceptService = InterceptService.getInstance();

				if (oInterceptService && oInterceptService.interceptUrl) {
					sUrl = oInterceptService.interceptUrl(sUrl);
				}
			}
			return sUrl;
		},

		/**
		 * Loads the <code>FileShareSupport</code> module and requests
		 * available data sources. If no <code>FileShareSupport</code>
		 * module is registered or the module does not provide a
		 * data source, the <code>Promise</code> resolves without any
		 * result.
		 *
		 * @returns {Promise} A <code>Promise</code> that gets resolved with a data source obtained from the <code>FileShareSupport</code> module or undefined if there is none
		 *
		 * @static
		 * @since 1.108
		 * @public
		 */
		fetchDataSource: function() {
			if (Utils._oDataSource) {
				return Promise.resolve(Utils._oDataSource);
			}

			const sFileShareSupportModuleName = BaseConfig.get({
				name: "sapUiFileShareSupport",
				type: BaseConfig.Type.String,
				defaultValue: undefined
			});

			if (!sFileShareSupportModuleName) {
				return Promise.resolve();
			}

			return new Promise(function(fnResolve) {
				sap.ui.require([sFileShareSupportModuleName], function(oFileShareSupport) {
					oFileShareSupport.getDataSource().then(function(oDataSource) {
						Utils._oDataSource = oDataSource;
						fnResolve(oDataSource);
					}).catch(function () {
						fnResolve();
					});
				});
			});
		},

		/**
		 * Ensures that the URL is absolute, so that it can
		 * be used within a Web Worker.
		 *
		 * @param {string} url Relative URL that needs to be processed for Web Worker usage
		 * @returns {string|any} Returns the absolute URL or the original value in case there is no URL provided
		 *
		 * @static
		 * @private
		 */
		normalizeUrl: function(url) {
			return url ? new URL(url, document.baseURI).toString() : url;
		},

		/**
		 * Creates the Export settings dialog that can be used for configuring the spreadsheet before exporting.
		 *
		 * @param {object} mCustomConfig Initial configuration of the settings dialog
		 * @param {object} oExportCapabilities Definition of supported export features
		 * @param {boolean} [bRemoteDestination] Activates remote destinations for export
		 * @param {sap.ui.core.Control} [oOpener] The opener of the dialog
		 * @param {function(sap.m.Dialog)} [fnCallback] Handler function that is called once the dialog has been opened. A reference to the dialog is passed as parameter
		 * @returns {Promise} Promise which resolves with the export settings defined by the user
		 *
		 * @static
		 * @private
		 */
		getExportSettingsViaDialog: function(mCustomConfig, oExportCapabilities, bRemoteDestination, oOpener, fnCallback) {
			return new Promise(function (fnResolve, fnReject) {
				let oExportSettingsDialog;
				let bFileNameExceeded = false;
				let bSignatureReasonExceeded = false;

				// Shift optional arguments
				if (typeof bRemoteDestination === "object") {
					fnCallback = oOpener;
					oOpener = bRemoteDestination;
					bRemoteDestination = undefined;
				} else if (typeof bRemoteDestination === "function") {
					fnCallback = bRemoteDestination;
					bRemoteDestination = undefined;
				} else if (typeof oOpener === "function") {
					fnCallback = oOpener;
					oOpener = null;
				}

				Utils.getResourceBundle().then((oResourceBundle) => {
					const oExportConfigModel = new JSONModel();

					function fnSetSemanticStepName (oExportConfigModel, oExportButton) {
						const sDestination = oExportConfigModel.getProperty("/destination");
						const sFileType = oExportConfigModel.getProperty("/fileType");
						let sStepName = "OI:EXP:";

						sStepName += sDestination === Destination.REMOTE ? "CL:" : "LOC:";

						switch (sFileType) {
							case FileType.PDF:
								sStepName += "PDF";
								break;
							case FileType.XLSX:
								sStepName += "XLS";
								break;
							case FileType.GSHEET:
								sStepName += "GS";
								break;
							default:
								sStepName = "OI:EXP";
						}

						FESRHelper.setSemanticStepname(oExportButton, "press", sStepName);
					}

					oExportConfigModel.setData(getDefaultSettings(mCustomConfig, oResourceBundle, oExportCapabilities, bRemoteDestination));

					Fragment.load({
						name: "sap.ui.export.fragments.SettingsDialog",
						type: "XML",
						controller: {
							isSupported: function(sFileType, bFeatureEnabled) {
								return sFileType !== FileType.PDF || bFeatureEnabled;
							},
							isPDF: function(sValue, bFeatureEnabled) {
								return sValue === FileType.PDF && bFeatureEnabled !== false;
							},
							isSpreadsheet: function(sValue) {
								return sValue === FileType.XLSX || sValue === FileType.GSHEET;
							},
							isDestinationEnabled: function(sFileType) {
								return oExportCapabilities?.PDF?.UploadToFileShare ? sFileType !== FileType.GSHEET : sFileType === FileType.XLSX;
							},
							hasDestinations: function(aDestinationCollection) {
								return aDestinationCollection.length > 1;
							},
							formatExportButton: function(sDestination) {
								return sDestination === Destination.LOCAL ? oResourceBundle.getText("EXPORT_BUTTON") : oResourceBundle.getText("DIALOG_BUTTON_CLOUD_DESTINATION");
							},
							onCancel: function() {
								oExportSettingsDialog._bSuccess = false;
								oExportSettingsDialog.close();
							},
							onExport: function() {
								oExportSettingsDialog._bSuccess = true;
								oExportSettingsDialog.close();
							},

							/**
							 * User input validation for file name
							 *
							 * @param {sap.ui.base.Event} oEvent LiveChange event of the Input control
							 */
							onFileNameChange: function(oEvent) {
								const oInput = oEvent.getSource();
								const sFileName = oEvent.getParameter("value");
								const oRegEx = /[\\/:|?"*<>]/;
								const oExportBtn = Element.getElementById("exportSettingsDialog-exportButton");
								let bValidate = oRegEx.test(sFileName);

								if (bValidate) {
									oInput.setValueState(ValueState.Error);
									oInput.setValueStateText(oResourceBundle.getText("FILENAME_ERROR"));
								} else if (sFileName.length > MAX_STRING_LENGTH) {
									oInput.setValueState(ValueState.Error);
									oInput.setValueStateText(oResourceBundle.getText("FILENAME_LENGTH_ERROR", [MAX_STRING_LENGTH]));
									bValidate = true;
								} else if (sFileName.length > 100) {
									oInput.setValueState(ValueState.Warning);
									oInput.setValueStateText(oResourceBundle.getText("FILENAME_WARNING"));
								} else {
									oInput.setValueState(ValueState.None);
									oInput.setValueStateText(null);
								}
								bFileNameExceeded = bValidate;
								oExportBtn.setEnabled(!bValidate && !bSignatureReasonExceeded);
							},
							/**
							 * User input validation for signature reason
							 *
							 * @param {sap.ui.base.Event} oEvent LiveChange event of the Input control
							 */
							onSignatureReasonChange: function(oEvent) {
								const oInput = oEvent.getSource();
								const sSignatureReason = oEvent.getParameter("value");
								const oExportBtn = Element.getElementById("exportSettingsDialog-exportButton");
								const bValidate = sSignatureReason.length > MAX_STRING_LENGTH;

								if (bValidate) {
									oInput.setValueState(ValueState.Error);
									oInput.setValueStateText(oResourceBundle.getText("SIGNATURE_REASON_LENGTH_ERROR", [MAX_STRING_LENGTH]));
								} else {
									oInput.setValueState(ValueState.None);
									oInput.setValueStateText(null);
								}

								bSignatureReasonExceeded = bValidate;
								oExportBtn.setEnabled(!bValidate && !bFileNameExceeded);
							},
							onFileTypeChange: function(oEvent) {
								const oSelectedItem = oEvent.getParameter("selectedItem");

								if (!oSelectedItem) {
									return;
								}

								const sKey = oSelectedItem.getKey();
								switch (sKey) {
									case FileType.PDF:
										if (!oExportCapabilities?.PDF?.CoverPage) {
											oExportConfigModel.setProperty("/includeFilterSettings", false);
										}
										fnSetSemanticStepName(oExportConfigModel, oExportSettingsDialog.getBeginButton());
										break;
									case FileType.GSHEET:
										oExportConfigModel.setProperty("/destination", Destination.REMOTE);
										fnSetSemanticStepName(oExportConfigModel, oExportSettingsDialog.getBeginButton());
										break;
									default:
										Element.getElementById("exportSettingsDialog-signatureReason").setVisible(false);
										Element.getElementById("exportSettingsDialog-signatureReasonLabel").setVisible(false);
										fnSetSemanticStepName(oExportConfigModel, oExportSettingsDialog.getBeginButton());
								}
								oExportConfigModel.setProperty("/fileType", sKey);
							},
							onDestinationChange: function (oEvent) {
								if (!oEvent.getParameter("selectedItem")) {
									return;
								}

								fnSetSemanticStepName(oExportConfigModel, oExportSettingsDialog.getBeginButton());
							},
							onFontSizeChange: function(oEvent) {
								// user input validation for font size
								const oInput = oEvent.getSource();
								const sFontValue = oEvent.getParameter("value");
								const oRegEx = /[^\d]/g;
								const oExportBtn = Element.getElementById("exportSettingsDialog-exportButton");
								const bValidate = oRegEx.test(sFontValue);

								if (bValidate) {
									oInput.setValueState(ValueState.Error);
									oInput.setValueStateText(oResourceBundle.getText("NUMBER_ERROR"));
								} else {
									oInput.setValueState(ValueState.None);
									oInput.setValueStateText(null);
								}
								oExportBtn.setEnabled(!bValidate);
							},
							onAfterClose: function() {
								if (oExportSettingsDialog._bSuccess) {
									fnResolve(processExportSettings(oExportConfigModel.getData()));
								} else {
									// Handle Cancel after close when export button was not pressed
									// because a close could also be triggered via Esc
									fnReject(null);
								}
								oExportSettingsDialog.destroy();
								oExportSettingsDialog = null;
							}
						}
					}).then(function(oDialog) {
						oExportSettingsDialog = oDialog;

						if (oExportCapabilities.PDF && !oExportCapabilities.PDF["HeaderFooter"]) {
							oExportConfigModel.oData.showPageNumber = false;
						}

						oExportSettingsDialog.setModel(oExportConfigModel);
						oExportSettingsDialog.setModel(new ResourceModel({
							bundle: oResourceBundle
						}), "i18n");

						if (oOpener) {
							syncStyleClass("sapUiSizeCompact", oOpener, oExportSettingsDialog);
						}

						fnSetSemanticStepName(oExportConfigModel, oExportSettingsDialog.getBeginButton());
						FESRHelper.setSemanticStepname(oExportSettingsDialog.getEndButton(), "press", "OI:EXP:CANCEL");

						oExportSettingsDialog.open();

						if (fnCallback) {
							fnCallback(oExportSettingsDialog);
						}
					});
				});
			});
		},

		/**
		 * Combines the filter operator with the value and
		 * creates a textual representation.
		 *
		 * @param {object} oFilter A single filter object according to ListBinding#getFilterInfo
		 * @returns {string} Textual representation of the filter operation and value
		 *
		 * @static
		 * @private
		 */
		_getReadableFilterValue: function(oFilter) {
			switch (oFilter.op || oFilter.name) {
				case "==":
				case ">":
				case "<":
				case "!=":
				case "<=":
				case ">=":
					return {
						operator: oFilter.op || oFilter.name,
						value: oFilter.right.value
					};
				case "between":
					return {
						operator: oFilter.op || oFilter.name,
						value: [oFilter.args[1].value, oFilter.args[2].value]
					};
				case "contains":
				case "endswith":
				case "startswith":
					return {
						operator: oFilter.op || oFilter.name,
						value: oFilter.args[1].value
					};
				default:
					throw Error("getReadableFilter");
			}
		},

		/**
		 * Parse filter tree recursively.
		 *
		 * @param {object} oFilter Filter configuration according to ListBinding#getFilterInfo
		 * @returns {Array} Array of filter entries
		 *
		 * @static
		 * @private
		 */
		_parseFilter: function(oFilter) {
			switch (oFilter.type) {
				case "Logical":
					return Utils._parseLogical(oFilter);
				case "Binary":
					return Utils._parseBinary(oFilter);
				case "Unary":
					return Utils._parseUnary(oFilter);
				case "Call":
					return Utils._parseCall(oFilter);
				default:
					throw Error(`Filter type ${oFilter.type} not supported`);
			}
		},

		/**
		 * Parses a logical filter and concatenates all
		 * subsequent filters.
		 *
		 * @param {object} oLogicalFilter Filter object according to ListBinding#getFilterInfo
		 * @returns {Array} Array containing evaluated filter settings
		 *
		 * @static
		 * @private
		 */
		_parseLogical: function(oLogicalFilter) {
			let aFilters;

			try {
				/*
				 * BCP 002075129400002076772023
				 * When too many filters are applied, the
				 * filter evaluation might fail due to an
				 * "Maximum call stack size exceeded" error.
				 * This will be prevented by try-catch and
				 * still allows to keep existing results.
				 * Once the error occurs, additional filters
				 * will be ignored. This only happens for
				 * Logical filters with OR operator because
				 * they can lead to an unbalanced filter tree.
				 * For the unlikely scenario that the failing
				 * filter is a between filter, this scenario
				 * is also contained in try-catch.
				 */

				/* Breakout behavior for between filter */
				if (oLogicalFilter.op == "&&"
					&& oLogicalFilter.left.type === "Binary"
					&& oLogicalFilter.right.type === "Binary"
					&& oLogicalFilter.left.op === ">="
					&& oLogicalFilter.right.op === "<="
					&& oLogicalFilter.left.left.path === oLogicalFilter.right.left.path) {

					return Utils._parseCall({
						args: [
							{
								path: oLogicalFilter.left.left.path,
								type: "Reference"
							},
							{
								type: "Literal",
								value: oLogicalFilter.left.right.value
							},
							{
								type: "Literal",
								value: oLogicalFilter.right.right.value
							}
						],
						name: "between",
						type: "Call"
					});
				}

				aFilters = Utils._parseFilter(oLogicalFilter.left).concat(Utils._parseFilter(oLogicalFilter.right));

				/* Group logical OR filter on the same property */
				if (oLogicalFilter.op === "||" && aFilters.length) {
					const sProperty = aFilters[0].key;

					if (aFilters.every(function(item) { return item.key === sProperty; })) {
						aFilters = [
							{
								key: sProperty,
								value: aFilters.reduce(function(acc, item) {
									if (Array.isArray(item.value)) {
										return acc.concat(item.value);
									}

									acc.push(item.value);

									return acc;
								}, [])
							}
						];
					}
				}
			} catch (oError) {
				aFilters = [];
			}

			return aFilters;
		},

		/**
		 * Parses a binary filter and returns an Array that
		 * contains this explicit filter item.
		 *
		 * @param {object} oBinaryFilter Filter object according to ListBinding#getFilterInfo
		 * @returns {Array} Array containing this explicit filter setting
		 *
		 * @static
		 * @private
		 */
		_parseBinary: function(oBinaryFilter) {
			if (!oBinaryFilter.left || oBinaryFilter.left.type != "Reference"
				|| !oBinaryFilter.right || oBinaryFilter.right.type != "Literal") {
				return [];
			}

			return [{
				key: oBinaryFilter.left.path,
				value: Utils._getReadableFilterValue(oBinaryFilter)
			}];
		},

		/**
		 * Parses an unary filter and returns a modified
		 * subsequent filter.
		 *
		 * @param {object} oUnaryFilter Filter object according to ListBinding#getFilterInfo
		 * @returns {Array} Array containing the modified subsequent filter
		 *
		 * @static
		 * @private
		 */
		_parseUnary: function(oUnaryFilter) {
			if (!oUnaryFilter.arg) {
				return [];
			}

			const result = Utils._parseFilter(oUnaryFilter.arg);

			if (oUnaryFilter.op === "!" && result[0].value) {
				result[0].value.exclude = true;
			}

			return result;
		},

		/**
		 * Parses an call filter and returns an Array containing
		 * this particular filter configuration.
		 *
		 * @param {object} oCallFilter Filter object according to ListBinding#getFilterInfo
		 * @returns {Array} Array containing this explicit filter setting
		 *
		 * @static
		 * @private
		 */
		_parseCall: function(oCallFilter) {
			if (!oCallFilter.args || oCallFilter.args.length < 2) {
				return [];
			}

			return [{
				key: oCallFilter.args[0].path,
				value: Utils._getReadableFilterValue(oCallFilter)
			}];
		},

		/**
		 * This function has been deprecated and might be removed in future releases.
		 *
		 * @returns {Promise}
		 * Promise, which resolves with an object containing a name
		 * property and items array with key value pairs which can be
		 * attached to the metainfo in the sap.ui.export.Spreadsheet
		 * configuration
		 * @deprecated
		 *
		 * @ui5-restricted sap.ui.comp.smarttable.SmartTable
		*/
		parseFilterConfiguration: function() {
			Log.error("Function is deprecated and must not be used anymore");

			return Utils.getResourceBundle().then(function(oResourceBundle) {
				return {
					name: oResourceBundle.getText("FILTER_HEADER"),
					items: []
				};
			});
		},

		/**
		 * Accepts a binding of type sap.ui.model.ListBinding or
		 * sap.ui.model.TreeBinding and extracts the filter
		 * configuration in a format that can be attached to
		 * a sap.ui.export.Spreadsheet instance.
		 *
		 * @param {sap.ui.model.ListBinding | sap.ui.model.TreeBinding} oBinding ListBinding or TreeBinding instance
		 * @returns {sap.ui.export.util.Filter[]} Array of sap.ui.export.util.Filter objects. The Array is empty if no filters are available on the binding.
		 *
		 * @static
		 * @private
		 */
		getFilters: function(oBinding) {
			const aFilters = [];

			if (!oBinding || !oBinding.isA(["sap.ui.model.ListBinding", "sap.ui.model.TreeBinding"])) {
				Log.error("A ListBinding or TreeBinding is required for parsing the filter settings");
				return aFilters;
			}

			const oFilterInfo = oBinding.getFilterInfo();
			if (oFilterInfo) {
				Utils._parseFilter(oFilterInfo).forEach(function(oEntry) {
					aFilters.push(new Filter(oEntry.key, oEntry.value));
				});
			}

			return aFilters;
		},

		/**
		 * Promise, which resolves with an array containing username and
		 * time stamp at which the document was created
		 *
		 * @returns {Promise<object>} Resolves when the technical information has been obtained
		 *
		 * @static
		 * @private
		 */
		parseTechnicalConfiguration: async function() {
			const oUserConfig = {};

			const oUshellContainer = sap.ui.require("sap/ushell/Container");
			const [oBundle, oUserInfo] = await Promise.all([
				Utils.getResourceBundle(),
				oUshellContainer?.getServiceAsync("UserInfo")
			]);

			oUserConfig.name = oBundle.getText("TECHNICAL_INFORMATION");
			oUserConfig.items = [
				{
					key: oBundle.getText("CREATED_TIME"),
					value: DateFormat.getDateTimeWithTimezoneInstance().format(new Date())
				}
			];

			if (oUserInfo?.getFullName()) {
				oUserConfig.items.unshift({
					key: oBundle.getText("USER_NAME"),
					value: oUserInfo.getFullName()
				});
			}

			return oUserConfig;
		},

		/**
		 * This function saves the provided Blob to the local file system.
		 * The parameter name is optional and depending on the browser it
		 * is not ensured that the filename can be applied. Google Chrome,
		 * Mozilla Firefox, Internet Explorer and Microsoft Edge will
		 * apply the filename correctly.
		 *
		 * @param {Blob} oBlob - Binary large object of the file that should be saved to the filesystem
		 * @param {string} [sFilename] - Filename of the file including the file extension
		 *
		 * @static
		 * @since 1.112
		 * @public
		 */
		saveAsFile: function(oBlob, sFilename) {
			let fnSave;

			/* Ignore other formats than Blob */
			if (!(oBlob instanceof Blob)) {
				return;
			}

			const link = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
			const downloadSupported = "download" in link;

			if (downloadSupported) {
				fnSave = function(data, fileName) {
					link.download = fileName;
					link.href = URL.createObjectURL(data);
					link.dispatchEvent(new MouseEvent("click"));
				};
			}

			/* In case of pre iOS 13 Safari, MacOS Safari (legacy) */
			if (typeof fnSave === "undefined") {
				fnSave = function(data) {
					const reader = new FileReader();

					reader.onloadend = function() {
						const url = reader.result.replace(/^data:[^;]*;/, "data:attachment/file;");
						const opened = openWindow(url, "_blank");

						if (!opened) {
							window.location.href = url;
						}
					};
					reader.readAsDataURL(data);
				};
			}

			/* Save file to device */
			fnSave(oBlob, sFilename);
		},

		/**
		 * Validates the export configuration and logs information, warnings and errors. A severe misconfiguration
		 * can lead to throwing an <code>Error</code>. Missing or incorrect information might get adjusted by either
		 * default values or by truncating the original value.
		 *
		 * @param {object} mSettings Export settings that will be validated
		 * @param {number} mSettings.count Expected amount of data that will be available on the service
		 * @param {object} mSettings.dataSource DataSource configuration that will be used to fetch the data
		 * @param {string} mSettings.fileName Name of the exported file
		 * @param {string} mSettings.fileType Member of sap.ui.export.FileType
		 * @param {boolean} mSettings.showProgress Controls whether the progress dialog will be shown during export or not
		 * @param {object} mSettings.workbook Export settings that are relevant for the file structure
		 * @param {boolean} mSettings.worker Controls whether the export will be run in a dedicated Web Worker or not
		 * @param {object} mSettings.customizing Contains export customizing like currency and unit scale settings
		 *
		 * @static
		 * @private
		 */
		validateSettings: function(mSettings) {

			/* Validate dataSource */
			Utils._validateDataSource(mSettings.dataSource);

			Utils.validateFileSettings(mSettings);

			/* Validate showProgress */
			if (typeof mSettings.showProgress !== "boolean") {
				mSettings.showProgress = true; // Default value
			}

			/* Validate workbook */
			Utils._validateWorkbook(mSettings.workbook);

			/* Validate worker */
			if (typeof mSettings.worker !== "boolean") {
				mSettings.worker = true; // Default value
			}

			/* Validate customizing */
			Utils._validateScaleCustomizing(mSettings.customizing, "currency");
			Utils._validateScaleCustomizing(mSettings.customizing, "unit");
		},

		/**
		 * Validates the filename and type related export settings
		 *
		 * @param {object} mSettings Export settings containing the file
		 *
		 * @static
		 * @private
		 */
		validateFileSettings: function(mSettings) {
			mSettings.fileType = FileType[mSettings.fileType] ? mSettings.fileType : FileType.XLSX;
			mSettings.fileName = Utils.validateFileName(mSettings.fileName, mSettings.fileType);
		},

		/**
		 * Ensures that the corresponding file extension is present
		 * on the name of the file.
		 *
		 * @param {string} sName Name of the file
		 * @param {sap.ui.export.FileType} sType Selected FileType
		 * @returns {string} Updated file name
		 *
		 * @static
		 * @private
		 */
		validateFileName: function(sName, sType) {
			const sExtension = "." + sType.toLowerCase();

			sName = sName || "export";

			if (!sName.endsWith(sExtension) && sType !== FileType.GSHEET) {
				sName += sExtension;
				Log.info(`${CLASS_NAME}: fileName was missing the proper file extension - extension has been added`);
			}

			return sName;
		},

		/**
		 * Validates the datasource configuration.
		 *
		 * @param {object} mDataSource DataSource configuration that will be used to fetch the data
		 * @param {number|null} mDataSource.count Amount of data that will be requested from the service
		 * @param {Array} [mDataSource.data] Array of data that will be exported
		 * @param {string} [mDataSource.dataUrl] URL that is used to request the data from the backend
		 * @param {string} [mDataSource.headers] Associative Array containing HTTP headers that are used for $batch requests
		 * @param {string} [mDataSource.serviceUrl] URL of the service used for $batch requests
		 * @param {number} [mDataSource.sizeLimit] Amount of entries that are fetched with a single request
		 * @param {string} mDataSource.type Defines the type of export i.E. "odata" or "array"
		 * @param {boolean} [mDataSource.useBatch] Controls whether the OData export uses $batch requests or not
		 *
		 * @static
		 * @private
		 */
		_validateDataSource: function(mDataSource) {
			if (!mDataSource || typeof mDataSource !== "object") {
				throw new Error(`${CLASS_NAME}: dataSource has not been specified`);
			}

			mDataSource.type = typeof mDataSource.type === "string" && mDataSource.type.toLowerCase() || "odata";

			if (mDataSource.type === "array" && !Array.isArray(mDataSource.data)) {
				Log.warning(`${CLASS_NAME}: Defined type does not match the provided data`);
			}

			if (Array.isArray(mDataSource.data)) {
				mDataSource.count = mDataSource.data.length;
			}

			if (mDataSource.type === "odata") {
				if (typeof mDataSource.dataUrl !== "string" || mDataSource.dataUrl.length === 0) {
					throw new Error(`${CLASS_NAME}: Unable to export data. No dataUrl provided.`);
				}

				// Ensure absolute URLs for dataUrl and serviceUrl
				if (mDataSource.dataUrl) {
					mDataSource.dataUrl = Utils.normalizeUrl(mDataSource.dataUrl);
				}

				if (mDataSource.serviceUrl) {
					mDataSource.serviceUrl = Utils.normalizeUrl(mDataSource.serviceUrl);
				}
			}

			if (typeof mDataSource.count !== "number" || mDataSource.count < 0 || isNaN(mDataSource.count) || mDataSource.count % 1 !== 0) {
				Log.info(`${CLASS_NAME}: Invalid value for dataSource.count - value will be ignored`);
				mDataSource.count = null;
			}

			if (typeof mDataSource.downloadLimit !== "number" || mDataSource.downloadLimit < 0 || isNaN(mDataSource.downloadLimit) || mDataSource.downloadLimit % 1 !== 0) {
				Log.info(`${CLASS_NAME}: Invalid value for dataSource.downloadLimit - value will be ignored`);
				mDataSource.downloadLimit = null;
			}

			if (typeof mDataSource.useBatch !== "boolean") {
				mDataSource.useBatch = false; // Default value
				Log.info(`${CLASS_NAME}: Parameter useBatch not provided. The value false will be applied as default`);
			} else if (mDataSource.useBatch === true) {

				if (typeof mDataSource.serviceUrl !== "string" || mDataSource.serviceUrl.length === 0) {
					mDataSource.useBatch = false;
					Log.warning(`${CLASS_NAME}: serviceUrl is required for OData batch requests`);
				}

				if (typeof mDataSource.headers !== "object") {
					mDataSource.useBatch = false;
					Log.warning(`${CLASS_NAME}: headers are required for OData batch requests`);
				}
			}

			let iSizeLimit = mDataSource.sizeLimit;
			if (!iSizeLimit || isNaN(iSizeLimit) || iSizeLimit % 1 !== 0) {
				const iMaxSize = 5000;
				const iMinSize = 200;

				// Try to load data in 5 steps, but each step should be at least 200 rows
				iSizeLimit = mDataSource.count ? Math.round(mDataSource.count / (iMinSize * 5)) * iMinSize : iMinSize;
				iSizeLimit = Math.min(iMaxSize, Math.max(iSizeLimit, iMinSize));
				mDataSource.sizeLimit = iSizeLimit;

				Log.info(`${CLASS_NAME}: No valid sizeLimit provided. sizeLimit is set to ${iSizeLimit}`);
			}
		},

		/**
		 * Validates the workbook configuration that contains information about the columns,
		 * the hierarchyLevel and meta information.
		 *
		 * @param {object} mWorkbook Configuration of the Spreadsheet workbook
		 * @param {Array} mWorkbook.columns Column definition of the worksheet
		 * @param {object} mWorkbook.context Meta information that is written to the generated file
		 * @param {string} mWorkbook.hierarchyLevel Name of the property that contains the hierarchy level information
		 *
		 * @static
		 * @private
		 */
		_validateWorkbook: function(mWorkbook) {
			if (!(mWorkbook instanceof Object)  || !Array.isArray(mWorkbook.columns)) {
				throw new Error(`${CLASS_NAME}: column configuration is not provided. Export is not possible`);
			}

			/* Eliminate incorrect column definitions */
			mWorkbook.columns = mWorkbook.columns.filter(function(oColumn, iIndex) {
				if (!(oColumn instanceof Object)) {
					Log.error(`${CLASS_NAME}: Column ${iIndex} skipped due to invalid configuration`);
					return false;
				}

				/* *** Validation of general properties *** */

				if (Array.isArray(oColumn.property) && oColumn.type !== EdmType.String && oColumn.type != null) {
					Log.warning(`${CLASS_NAME}: Type ${oColumn.type} does not support an array of properties`);
					oColumn.property = oColumn.property[0];
				}

				if (typeof oColumn.property !== "string" && !Array.isArray(oColumn.property)) {
					Log.error(`${CLASS_NAME}: Column ${iIndex} skipped due to missing mandatory property`);
					return false;
				}

				/* Use property name if label is not defined */
				oColumn.label = oColumn.label || (oColumn.property instanceof Array ? oColumn.property[0] : oColumn.property);

				/* Column width calculation */
				let iWidth = oColumn.width;

				if (typeof iWidth === "string") {
					const sWidth = iWidth.toLowerCase();

					iWidth = parseFloat(sWidth);

					/*
					* We need to convert the column width (rem/px) into
					* export specific character amount. This calculation
					* is based on Office Open SpreadsheetML
					* (ISO/IEC 29500-1:2016) section 18.3.1.13
					*
					* The following fixed values are:
					* 16: Amount of pixels per rem
					* 5: Padding and grid pixels
					* 8: Maxium pixel width per character
					* 100: Formula specific constant
					* 0.5: Formula specific constant
					*/
					if (sWidth.indexOf("em") > 0) {
						iWidth = Math.floor((((iWidth * 16) - 5) / 8 * 100) + 0.5) / 100;
					} else if (sWidth.indexOf("px") > 0) {
						iWidth = Math.floor(((iWidth - 5) / 8 * 100) + 0.5) / 100;
					}
				}

				if (isNaN(iWidth) || iWidth < 1) {
					iWidth = 10;
				}

				oColumn.width = Math.round(iWidth);

				Utils._validateType(oColumn, iIndex);
				Utils._validateString(oColumn, "textAlign");

				if (oColumn.textAlign) {
					let textAlign = String(oColumn.textAlign).toLowerCase();

					/* Map the values begin & end according to RTL */
					if (["begin", "end"].indexOf(textAlign) > -1) {
						const mappedAlignment = ["left", "right"];

						textAlign = (Localization.getRTL() ? mappedAlignment.reverse() : mappedAlignment)[["begin", "end"].indexOf(textAlign)];
					}

					if (textAlign !== "" && ["left","right","center"].indexOf(textAlign) == -1) {
						Log.warning(`${CLASS_NAME}: Incorrect column alignment value ${textAlign} on column "${oColumn.label || oColumn.property}". Default alignment is used.`);
						textAlign = "";
					}
					oColumn.textAlign = textAlign;
				}

				/* *** Validation of type specific properties *** */

				/* Validate boolean based properties (not column type Boolean related) */
				["autoScale", "delimiter", "displayTimezone", "displayUnit", "utc", "wrap"].forEach(function(sProperty) {
					Utils._validateProperty(oColumn, sProperty, "boolean");
				});

				/* Validate string based properties (not column type String related) */
				["inputFormat", "unit", "unitProperty", "template", "trueValue", "falseValue", "timezone", "timezoneProperty"].forEach(function(sProperty) {
					Utils._validateString(oColumn, sProperty);
				});

				/* Validate template property */
				if (oColumn.template && !Array.isArray(oColumn.property) && typeof oColumn.inputFormat !== "string") {
					Log.warning(`${CLASS_NAME}: Template is not applicable on a single property without inputFormat - value will be discarded on column "${oColumn.label || oColumn.property}".`);
					delete oColumn.template;
				}

				/* Only allow supported calendars */
				if (typeof oColumn.calendar === "string" && [CalendarType.Gregorian, CalendarType.Islamic, CalendarType.Japanese].indexOf(oColumn.calendar) < 0) {
					Log.warning(`${CLASS_NAME}: Unsupported calendar ${oColumn.calendar} on column "${oColumn.label || oColumn.property}". Value will be discarded.`);
					delete oColumn.calendar;
				}

				/* Validate trueValue & falseValue properties */
				if (oColumn.type === EdmType.Boolean && (oColumn.trueValue === null || oColumn.falseValue === null)) {
					Log.warning(`${CLASS_NAME}: The properties trueValue and falseValue have to be assigned correctly on column "${oColumn.label || oColumn.property}". Values will be discarded.`);
					delete oColumn.trueValue;
					delete oColumn.falseValue;
				}

				/* Validate autoScale property */
				if (oColumn.autoScale === true && (oColumn.type !== EdmType.Number || (!oColumn.unit && !oColumn.unitProperty))) {
					Log.warning(`${CLASS_NAME}: autoScale cannot be taken into account due to invalid configuration.`);
					delete oColumn.autoScale;
				}

				/* Validate utc property */
				if (oColumn.type === EdmType.DateTime) {

					/*
					 * Apply user timezone or UTC as fixed timezone
					 * in case no timezone was provided. This also
					 * serves as a fallback if timezoneProperty
					 * is defined but the Line Item has no value
					 * for the referenced property name.
					 */
					if (!oColumn.timezone) {
						oColumn.timezone = oColumn.utc === false ? Localization.getTimezone() : "UTC";
					}

					/* Remove obviously incorrect timezoneProperty settings */
					if (oColumn.property === oColumn.timezoneProperty || (typeof oColumn.timezoneProperty === "string" && oColumn.timezoneProperty.split(",").length > 1)) {
						Log.warning(`${CLASS_NAME}: Property timezoneProperty is invalid.`);
						delete oColumn.timezoneProperty;
					}
				} else if (typeof oColumn.utc === "boolean") {
					Log.warning(`${CLASS_NAME}: Property utc is only supported for type DateTime.`);
					delete oColumn.utc;
				}

				/* Validate scale property */
				let iScale = oColumn.scale;
				if (oColumn.type === EdmType.Number && isNaN(iScale) && iScale !== "variable") {
					Log.warning(`${CLASS_NAME}: scale parameter for numerical column configuration is missing.`);
				}
				if (typeof iScale === "string") {
					iScale = parseInt(iScale);
				}
				if (isNaN(iScale)) {
					iScale = null;
				}
				oColumn.scale = iScale;

				/* Validate valueMap property */
				if (oColumn.valueMap && typeof oColumn.valueMap !== "object") {
					/* Once the valueMap property is invalid, the column type is anyway reverted to EdmType.String */
					Log.warning(`${CLASS_NAME}: Invalid value for property valueMap on column "${oColumn.label || oColumn.property}". Value will be discarded.`);
					delete oColumn.valueMap;
				}

				return true; // Important for the Array#filter call
			});

			Utils._validateWorkbookContext(mWorkbook.context);
			Utils._validateString(mWorkbook, "hierarchyLevel");
			Utils._validateString(mWorkbook, "drillState");
		},

		/**
		 * Validates and fixes the type definition of a particular column if possible.
		 *
		 * @param {object} oColumn Export settings of a particular column
		 *
		 * @static
		 * @private
		 */
		_validateType: function(oColumn) {
			if (typeof oColumn.type !== "string") {
				oColumn.type = EdmType.String;
				return;
			}

			if (!EdmType[oColumn.type]) {
				let sFixedType = EdmType.String;

				/* Fix type for case insensitive match */
				for (const sType in EdmType) {
					if (sType.toLowerCase() == oColumn.type.toLowerCase()) {
						sFixedType = sType;
					}
				}

				Log.warning(`${CLASS_NAME}: Unsupported column type ${oColumn.type} on column ${oColumn.label || oColumn.property}. EdmType.${sFixedType} is applied.`);
				oColumn.type = sFixedType;
			}

			switch (oColumn.type) {
				case EdmType.Date:
					if (!oColumn.format && !oColumn.calendar) {
						Utils._validateString(oColumn, "format", Utils.getFormatSettings().datePattern);
						Utils._validateString(oColumn, "calendar", Utils.getFormatSettings().calendar);
					}
					break;
				case EdmType.DateTime:
					if (!oColumn.format && !oColumn.calendar) {
						Utils._validateString(oColumn, "format", Utils.getFormatSettings().dateTimePattern);
						Utils._validateString(oColumn, "calendar", Utils.getFormatSettings().calendar);
					}
					break;
				case EdmType.Time:
					Utils._validateString(oColumn, "format", Utils.getFormatSettings().timePattern);
					break;
				case EdmType.Number:
					/* Keep default delimiter disabled until scale issue has been resolved */
					// Utils._validateProperty(oColumn, "delimiter", "boolean", Utils.getFormatSettings().delimiter);
					break;
				case EdmType.Currency:
					if (!oColumn.unitProperty) {
						Log.warning(`${CLASS_NAME}: Missing unitProperty for type Currency on column "${oColumn.label || oColumn.property}". Type is reverted to String.`);
						oColumn.type = EdmType.String;
					}
					break;
				case EdmType.Enumeration:
					if (!oColumn.valueMap || typeof oColumn.valueMap !== "object") {
						Log.warning(`${CLASS_NAME}: Invalid valueMap for type Enumeration on column "${oColumn.label || oColumn.property}". Type is reverted to String.`);
						oColumn.type = EdmType.String;
					}
					break;
				default: /* Do nothing */
			}
		},

		/**
		 * Validates the context object on the workbook definition.
		 *
		 * @param {object} oContext Context object
		 * @param {string} [oContext.application] Name of the application (default: "SAP UI5")
		 * @param {string} [oContext.version] Application version (default: "1.142.0")
		 * @param {string} [oContext.title] Title that will be written to the file (NOT the filename)
		 * @param {string} [oContext.modifiedBy] Optional user context that will be written to the file
		 * @param {string} [oContext.sheetName] Name of the data sheet - Maximum length of 31 characters
		 * @param {string} [oContext.metaSheetName] Name of the optional metainfo sheet - Maximum length of 31 characters
		 * @param {Array} [oContext.metainfo] Array of objects that represent a group in the additional metainfo sheet
		 *
		 * @static
		 * @private
		 */
		_validateWorkbookContext: function(oContext) {
			if (!(oContext instanceof Object)) {
				return;
			}

			Utils._validateString(oContext, "application", "SAP UI5");
			Utils._validateString(oContext, "version", uiVersion); // Async initialization - might be null
			Utils._validateString(oContext, "title");
			Utils._validateString(oContext, "modifiedBy");
			Utils._validateString(oContext, "sheetName", "SAPUI5 Spreadsheet Export", 31, UNSUPPORTED_SHEETNAME_CHARACTERS_REGEX);
			Utils._validateString(oContext, "metaSheetName", "Metadata", 31, UNSUPPORTED_SHEETNAME_CHARACTERS_REGEX);

			if (oContext.metainfo) {
				if (!Array.isArray(oContext.metainfo)) {
					Log.warning(`${CLASS_NAME}: Invalid value for property metainfo. Value will be discarded.`);
					oContext.metainfo = null;
				} else {
					oContext.metainfo.filter(function(oGroup, iIndex) {
						if (typeof oGroup.name !== "string" || oGroup.name.length === 0) {
							Log.warning(`${CLASS_NAME}: Invalid name for metainfo group at index ${iIndex}. Entry will be discarded.`);
							return false;
						}
						return true;
					});
				}
			}
		},

		/**
		 * The function validates a property on the context to be of type "string" if defined.
		 * It can apply additional restrictions if defined. Once the property value does not meet the criteria,
		 * the value will be adjusted or discarded and the function writes an entry to the Log. If the property value
		 * exceeds the maximum allowed length, it will be truncated.
		 *
		 * @param {object} oContext Context on which the property is defined
		 * @param {string} sProperty Name of the property
		 * @param {string} sDefaultValue Default value that gets applied in case of an invalid value - null if not defined
		 * @param {number} [iMaxLength] Maximum allowed length.
		 * @param {string|RegExp} [sRemove] Unsupported characters that will be removed
		 *
		 * @static
		 * @private
		 */
		_validateString: function(oContext, sProperty, sDefaultValue, iMaxLength, sRemove) {
			Utils._validateProperty(oContext, sProperty, "string", sDefaultValue);

			let sValue = oContext[sProperty];

			if (typeof sValue === "string" && (typeof sRemove === "string" || sRemove instanceof RegExp)) {
				sValue = sValue.replace(sRemove, "");
			}

			if (typeof sValue === "string" && iMaxLength && sValue.length > iMaxLength) {
				Log.warning(`${CLASS_NAME}: The value of ${sProperty} exceeds the max length of ${iMaxLength} and will be truncated.`);
				sValue = sValue.slice(0, iMaxLength);
			}

			oContext[sProperty] = sValue;
		},

		/**
		 * The function validates a property on the context to be of type  if defined.
		 * Once the property value does not meet the criteria, the value will be discarded and
		 * the function writes an entry to the Log.
		 *
		 * @param {object} oContext Context on which the property is defined
		 * @param {string} sProperty Name of the property
		 * @param {string} sType Expected type of the property
		 * @param {Any} [defaultValue] Default value that gets applied if the initial value is invalid
		 *
		 * @static
		 * @private
		 */
		_validateProperty: function(oContext, sProperty, sType, defaultValue) {
			let value = oContext[sProperty];

			// eslint-disable-next-line valid-typeof
			if (value != null && typeof value !== sType) {
				Log.warning(`${CLASS_NAME}: Invalid value for property ${sProperty}. Value will be discarded.`);
				value = null;
			}

			if (value == null && typeof defaultValue !== "undefined") {
				value = defaultValue;
			}

			if (value == null) {
				delete oContext[sProperty];
			} else {
				oContext[sProperty] = value;
			}
		},

		/**
		 * Validates the unit specific scale settings and ensures
		 * that the format is according to the definition.
		 *
		 * @param {object} oCustomizing General export customizing
		 * @param {object} oCustomizing.currency Currency specific customizing
		 * @param {object} oCustomizing.unit Unit of measure specific customizing
		 * @param {string} sProperty Key property of the specific customizing setting
		 *
		 * @static
		 * @private
		 */
		_validateScaleCustomizing: function(oCustomizing, sProperty) {
			if (!oCustomizing) {
				return;
			}

			const mScaleSettings = oCustomizing[sProperty];

			if (!(mScaleSettings instanceof Object) || Array.isArray(mScaleSettings)) {
				Log.warning(`${CLASS_NAME}: Invalid scale customizing for ${sProperty}.`);
				oCustomizing[sProperty] = {};
			} else {
				for (const sKey in mScaleSettings) {
					if (!(mScaleSettings[sKey] instanceof Object)) {
						Log.warning(`${CLASS_NAME}: Key ${sKey} has been removed from customizing`);
						delete mScaleSettings[sKey];
					} else if (typeof mScaleSettings[sKey].scale !== "number" || mScaleSettings[sKey].scale < 0) {
						Log.warning(`${CLASS_NAME}: Key ${sKey} has been removed from customizing due to invalid scale`);
						delete mScaleSettings[sKey];
					}
				}
			}
		},

		/**
		 * Returns an instance of the specific export class that is evaluated
		 * by FileType. The default class is sap/ui/export/Spreadsheet when
		 * no specific FileType is defined in the export settings.
		 *
		 * @param {object} mSettings Export configuration with optional FileType
		 * @param {object} [mCapabilities] Export capabilities for all supported types
		 * @param {object} [mCloudFileInfo] Information about the file that is stored in the remote FileShare
		 * @returns {Promise<sap.ui.export.ExportBase>} A Promise that gets resolved with the requested instance
		 *
		 * @static
		 * @since 1.112
		 * @public
		 */
		getExportInstance: function(mSettings, mCapabilities, mCloudFileInfo) {
			const sFileType = typeof mSettings.fileType === "string" ? mSettings.fileType.toUpperCase() : mSettings.fileType;
			let sClassName;

			mCapabilities = mCapabilities ? mCapabilities : {};

			switch (sFileType) {
				case FileType.PDF:
					sClassName = "sap/ui/export/PortableDocument";
					break;
				default:
					sClassName = "sap/ui/export/Spreadsheet";
			}

			return new Promise(function(fnResolve) {
				sap.ui.require([sClassName], function(ExportClass) {
					fnResolve(new ExportClass(mSettings, mCapabilities[sFileType], mCloudFileInfo));
				});
			});
		},

		/**
		 * Returns the amount of data that is available on the backend
		 * in case the binding provides this information.
		 *
		 * @param {sap.ui.model.ListBinding|sap.ui.model.TreeBinding} oBinding - A subclass of <code>sap.ui.model.ListBinding</code> or <code>sap.ui.model.TreeBinding</code>
		 * @returns {number|null} Amount of data in the backend or null if the binding does not provide this information
		 *
		 * @static
		 * @private
		 */
		getCountFromBinding: function(oBinding) {
			let iCount;

			if (typeof oBinding.getCount === "function") {
				iCount = oBinding.getCount();
			} else if (!oBinding.isA("sap.ui.model.TreeBinding") // Explicitly exclude TreeBinding because Binding#getLength is numberOfExpandedLevels dependent
					&& typeof oBinding.isLengthFinal === "function"
					&& oBinding.isLengthFinal()) {

				iCount = oBinding.getLength();
			}

			if (typeof iCount !== "number" || iCount < 0 || isNaN(iCount)) {
				iCount = null;
			}

			return iCount;
		},

		/**
		 * Returns the "hierarchy-level-for" / "$DistanceFromRoot" annotated property of the bound entity.
		 *
		 * @param {sap.ui.model.odata.v2.ODataTreeBinding|sap.ui.model.odata.v4.ODataListBinding} oBinding Binding that is used to evaluate the property name
		 * @returns {string|undefined} Name of the property which is annotated with "hierarchy-level-for" or "$DistanceFromRoot"
		 *
		 * @static
		 * @private
		 */
		getHierarchyLevel: function(oBinding) {
			if (!oBinding || typeof oBinding.isA !== "function") {
				return undefined;
			}

			/* Check for ODataTreeBinding#getTreeAnnotation since this is not a public function */
			if (oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding") && typeof oBinding.getTreeAnnotation === "function") {
				return oBinding.getTreeAnnotation("hierarchy-level-for");
			}

			if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				return oBinding.getAggregation(/*bVerbose*/true)?.$DistanceFromRoot;
			}

			return undefined;
		},

		/**
		 * Returns the "hierarchy-drill-state-for" / "$DrillState" annotated property of the bound entity.
		 *
		 * @param {sap.ui.model.odata.v2.ODataTreeBinding|sap.ui.model.odata.v4.ODataListBinding} oBinding Binding that is used to evaluate the property name
		 * @returns {string|undefined} Name of the property which is annotated with "hierarchy-drill-state-for" or "$DrillState"
		 *
		 * @static
		 * @private
		 */
		getHierarchyDrillState: function(oBinding) {
			if (!oBinding || typeof oBinding.isA !== "function") {
				return undefined;
			}

			/* Check for ODataTreeBinding#getTreeAnnotation since this is not a public function */
			if (oBinding.isA("sap.ui.model.odata.v2.ODataTreeBinding") && typeof oBinding.getTreeAnnotation === "function") {
				return oBinding.getTreeAnnotation("hierarchy-drill-state-for");
			}

			if (oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				return oBinding.getAggregation(/*bVerbose*/true)?.$DrillState;
			}

			return undefined;
		},

		/**
		 * Splits up all column settings that reference multiple
		 * properties as well as amounts and currency codes.
		 *
		 * The function returns an array with the updated column
		 * configuration for the export.
		 *
		 * @param {Array} aColumns Export-related column configuration that will be split up if necessary
		 * @param {function} [fnResolveColumnLabel] Resolves the label for a particular column that is not directly reflected
		 * @returns {Array} Updated column configuration
		 *
		 * @static
		 * @private
		 */
		splitColumns: function(aColumns, fnResolveColumnLabel) {
			const aResult = [];

			/* Assign dummy function to prevent multiple typeof checks */
			if (typeof fnResolveColumnLabel !== "function") {
				fnResolveColumnLabel = function() {};
			}

			aColumns.forEach(function(oColumn) {
				let aSplittedColumns, oUpdatedColumn, oAdditionalColumn, sColumnLabel;

				/* Split EdmType.String columns with multiple properties */
				if (Array.isArray(oColumn.property) && oColumn.property.length > 1) {
					oUpdatedColumn = Object.assign({}, oColumn);
					oUpdatedColumn.property = oColumn.property[0];
					oUpdatedColumn.label = fnResolveColumnLabel(oUpdatedColumn.property) || oColumn.label;

					delete oUpdatedColumn.template;

					aSplittedColumns = [oUpdatedColumn];

					/* Ignore the leading property because it is already in aSplittedColumns */
					oColumn.property.slice(1).forEach(function(sProperty, iIndex) {
						sColumnLabel = fnResolveColumnLabel(sProperty);

						oAdditionalColumn = {
							property: sProperty,
							label: sColumnLabel || `${oColumn.label} (${iIndex + 1})`
						};

						aSplittedColumns.push(oAdditionalColumn);
					});
				}

				/* Split EdmType.Currency and EdmType.Number columns */
				if (oColumn.unitProperty && oColumn.displayUnit !== false) { // displayUnit is assumed to be true by default - so undefined needs to be treated like true
					oUpdatedColumn = Object.assign({}, oColumn);
					sColumnLabel = fnResolveColumnLabel(oColumn.unitProperty);
					aSplittedColumns = [oUpdatedColumn, {
						property: oColumn.unitProperty,
						label: sColumnLabel || `${oColumn.label} (1)`
					}];

					oUpdatedColumn.displayUnit = false;
				}

				if (oColumn.timezoneProperty && oColumn.displayTimezone !== false) {
					oUpdatedColumn = Object.assign({}, oColumn);
					sColumnLabel = fnResolveColumnLabel(oColumn.timezoneProperty);
					aSplittedColumns = [oUpdatedColumn, {
						property: oColumn.timezoneProperty,
						label: sColumnLabel || `${oColumn.label} (1)`
					}];

					oUpdatedColumn.displayTimezone = false;
				}

				aResult.push(aSplittedColumns || oColumn);
			});

			return aResult.flat();
		},

		/**
		 * Returns a <code>Promise</code> that resolves with the
		 * <code>ResourceBundle</code> of the sap.ui.export library.
		 *
		 * @returns {Promise} <code>Promise</code> with the <code>ResourceBundle</code>
		 *
		 * @static
		 * @private
		 */
		getResourceBundle: function() {
			if (!oResourceBundle) {
				return Library.load({ name: "sap.ui.export" }).then(() => {
					oResourceBundle = Library.getResourceBundleFor("sap.ui.export");

					return oResourceBundle;
				});
			}
			return Promise.resolve(oResourceBundle);
		},

		/**
		 * Provides Office Open XML compliant default format settings
		 * based on the UI5 LocaleData facade.
		 *
		 * @param {"full"|"long"|"medium"|"short"} [sDateStyle="short"] Date style to be used for the date pattern
		 * @param {"full"|"long"|"medium"|"short"} [sTimeStyle="medium"] Time style to be used for the time pattern
		 * @returns {Object} Format settings
		 *
		 * @static
		 * @private
		 */
		getFormatSettings: function(sDateStyle = "short", sTimeStyle = "medium") {
			const aValidStyles = ["full", "long", "medium", "short"];
			if (aValidStyles.includes(sDateStyle) === false || aValidStyles.includes(sTimeStyle) === false) {
				throw new Error(`Invalid date or time style provided. Valid styles are: ${aValidStyles.join(", ")}`);
			}

			if (!oDefaultFormatSettings) {
				const oSettings = {};
				const oLocale = new Locale(Localization.getLanguageTag());
				const oLocaleData = LocaleData.getInstance(oLocale);

				/*
				 * Load default format settings from UI5 Formatting facade
				 */
				oSettings.calendar = Formatting.getCalendarType();
				oSettings.datePattern = oLocaleData.getDatePattern(sDateStyle, oSettings.calendar);
				oSettings.timePattern = oLocaleData.getTimePattern(sTimeStyle, oSettings.calendar);
				oSettings.delimiter = !!Formatting.getNumberSymbol("group");

				/* Post processing: lower case, pattern specific replacement */
				if (typeof oSettings.datePattern === "string") {
					oSettings.datePattern = oSettings.datePattern.toLowerCase();
				}

				/*
				 * 12 hour clock period adjustment
				 * https://unicode.org/reports/tr35/tr35-dates.html#dfst-period
				 */
				if (typeof oSettings.timePattern === "string") {
					oSettings.timePattern = oSettings.timePattern.toLowerCase().replace(/\Wa/, " AM/PM");
				}

				if (oSettings.datePattern && oSettings.timePattern) {
					oSettings.dateTimePattern = oLocaleData.getCombinedDateTimePattern(sDateStyle, sTimeStyle, oSettings.calendar).toLowerCase().replace(/\Wa/, " AM/PM");
				}

				oDefaultFormatSettings = oSettings;
			}

			return oDefaultFormatSettings;
		},

		/**
		 * Returns a map of translated timezone texts where each key
		 * represents a IANA timezone id. The translated name is
		 * according to the current UI5 Locale.
		 *
		 * @returns {object} Map of timezone translations
		 *
		 * @static
		 * @private
		 */
		getTimezoneTranslations: function() {
			const oLocale = new Locale(Localization.getLanguageTag());
			const oLocaleData = LocaleData.getInstance(oLocale);

			return oLocaleData.getTimezoneTranslations();
		},

		/**
		 * Exposes the export status to the aria-live region for screenreader announcement
		 *
		 * @param {sap.ui.export.Status} sExportStatus Export Status that will be announced
		 * @param {object} [oConfig] The config parameter which contacins all settings
		 * @param {array} [oConfig.values] array of values that is needed for text translation
		 * @param {boolean} [oConfig.assertive] Indicates if annoucement is assertive or polite
		 * @static
		 * @private
		 */
		announceExportStatus: async function(sExportStatus, oConfig) {
			if (!sExportStatus) {
				throw new Error("Missing parameter");
			}

			const oInvisibleMessage = InvisibleMessage.getInstance();
			const oBundle = await Utils.getResourceBundle();

			const sMessage = oBundle.getText(`MSG_INFO_EXPORT_${sExportStatus}`, oConfig?.values);
			oInvisibleMessage.announce(sMessage, oConfig?.assertive ? MessageMode.Assertive : MessageMode.Polite);
		},

		/**
		 * Loads the desired class asynchronously
		 *
		 * @param {string} sClassName Full qualified class name
		 * @returns {Promise} Promise that resolves with Class reference
		 * @static
		 * @private
		 */
		loadClass: function(sClassName) {
			return new Promise((fnResolve) => {
				sap.ui.require([sClassName], fnResolve);
			});
		}
	};

	return Utils;

}, /* bExport= */ true);
