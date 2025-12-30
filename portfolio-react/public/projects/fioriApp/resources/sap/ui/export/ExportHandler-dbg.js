/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	"./library",
	"./ExportUtils",
	"./ExportDialog",
	"./util/PDFCapabilities",
	"sap/base/Log",
	"sap/m/MessageToast",
	"sap/ui/base/EventProvider",
	"sap/ui/model/odata/v4/ODataModel",
	"sap/ui/util/openWindow"
], function(library, ExportUtils, ExportDialog, PDFCapabilities, Log, MessageToast, EventProvider, ODataModel, openWindow) {
	"use strict";

	const Destination = library.Destination;
	const FileType = library.FileType;

	/**
	 * Any export-related functionality is encapsulated in the <code>ExportHandler</code> that also stores user settings throughout the session.
	 *
	 * @param {object} [mCapabilities={XLSX: {}}] Capabilities that define supported file types and features
	 * @param {object} [mCapabilities.XLSX] XLSX file type features; object that enables XLSX export without any feature settings
	 * @param {object} [mCapabilities.PDF] PDF file type features; see com.sap.vocabularies.PDF.v1.Features annotation for the concrete specification
	 *
	 * @class The <code>sap.ui.export.ExportHandler</code> class allows you to export table data from an SAPUI5 application.
	 *
	 * @author SAP SE
	 * @version 1.142.0
	 *
	 * @since 1.102
	 * @alias sap.ui.export.ExportHandler
	 * @extends sap.ui.base.EventProvider
	 * @public
	 */
	const ExportHandler = EventProvider.extend("sap.ui.export.ExportHandler", {
		constructor: function(mCapabilities) {
			const that = this;

			EventProvider.call(this);

			/* Apply default capabilities if nothing is provided */
			this._mCapabilities = mCapabilities instanceof Object ? mCapabilities : { XLSX: {} };

			if (this._mCapabilities.PDF) {
				const oCapabilities = this._mCapabilities.PDF;

				if (!oCapabilities?.isA?.("sap.ui.export.util.PDFCapabilities")) {
					this._mCapabilities.PDF = new PDFCapabilities(oCapabilities);
				}

				if (!this._mCapabilities.PDF.isValid()) {
					delete this._mCapabilities.PDF;
				}
			}

			/* Activate Google Sheet support */
			this._initialized = new Promise((fnResolve) => {
				this.isGoogleSheetSupported().then((bSupported) => {
					if (bSupported) {
						that._mCapabilities[FileType.GSHEET] = {};

						/* Set cloud default settings */
						that._mDialogSettings = {
							destination: Destination.REMOTE,
							fileType: FileType.GSHEET
						};
					}
				}).finally(fnResolve);
			});
		}
	});

	/**
	 * The <code>beforeExport</code> event is fired just before the export process is started.
	 * Listeners may prevent the default action of this event by calling the <code>preventDefault</code> method on the event object.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {sap.ui.base.EventProvider} oEvent.getSource
	 * @param {object} oEvent.getParameters
	 * @param {object} oEvent.getParameters.exportSettings Contains export-related configuration
	 * @param {object} oEvent.getParameters.userExportSettings User-specific settings from the Export As dialog
	 * @param {sap.ui.export.util.Filter[]} oEvent.getParameters.filterSettings Array of filter settings for the exported data
	 *
	 * @name sap.ui.export.ExportHandler#beforeExport
	 * @event
	 * @since 1.102
	 * @public
	 */

	/**
	 * Attaches event handler <code>fnFunction</code> to the {@link sap.ui.export.ExportHandler#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportHandler</code>.</br>
	 * When called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified,
	 * otherwise it will be bound to this <code>sap.ui.export.ExportHandler</code> itself.</br>
	 * This event is fired just before the export process is started.
	 *
	 * @param {object} [oData] An application-specific payload object that will be passed to the event handler along with the event object when firing the event
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object to call the event handler with; defaults to this <code>sap.ui.export.ExportHandler</code> instance itself
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.attachBeforeExport = function(oData, fnHandler, oListener) {
		return this.attachEvent("beforeExport", oData, fnHandler, oListener);
	};

	/**
	 * Detaches event handler <code>fnFunction</code> from the {@link sap.ui.export.ExportHandler#event:beforeExport}
	 * event of this <code>sap.ui.export.ExportHandler</code>.</br>
	 * The passed function and listener object must match the ones used for event registration.
	 *
	 * @param {function} fnHandler The function to be called when the event occurs
	 * @param {object} [oListener] Context object on which the given function had to be called
	 * @returns {this} Reference to <code>this</code> in order to allow method chaining
	 *
	 * @since 1.102
	 * @public
	 */
	ExportHandler.prototype.detachBeforeExport = function(fnHandler, oListener) {
		return this.detachEvent("beforeExport", fnHandler, oListener);
	};

	/**
	 * Returns a Promise that gets resolved as soon as the initialization
	 * of the <code>ExportHandler</code> has been finished.
	 *
	 * @returns {Promise} Initialization finished
	 *
	 * @private
	 */
	ExportHandler.prototype.initialized = function() {
		return this._initialized;
	};

	/**
	 * Cleans up the internal structures and removes all event handlers.
	 *
	 * The object must not be used anymore after destroy was called.
	 *
	 * @see sap.ui.base.Object#destroy
	 * @public
	 */
	ExportHandler.prototype.destroy = function() {
		EventProvider.prototype.destroy.apply(this, arguments);

		this._oExportDialog?.destroy();
		this._oFilePicker?.destroy();
		this._oFileShareBinding?.destroy();
		this._oModel?.destroy();

		this._mCapabilities = null;
		this._mDialogSettings = null;
		this._oDataSource = null;
		this._oExportDialog = null;
		this._oFilePicker = null;
		this._oFileShareBinding = null;
		this._oModel = null;

		this.bIsDestroyed = true;
	};

	/**
	 * Requests available FileShares and returns a <code>Promise</code> that
	 * resolves with their Contexts. If the underlying <code>ODataModel</code>
	 * could not be instantiated the <code>Promise</code> resolves with an
	 * empty array.
	 *
	 * @returns {Promise<sap.ui.model.odata.v4.Context[]>} <code>Promise</code> that gets resolved with the requested FileShare <code>Context</code> <code>Array</code>
	 *
	 * @async
	 * @private
	 */
	ExportHandler.prototype.getFileShareContexts = async function() {
		const oModel = await this.getFileShareModel();

		if (!oModel) {
			return Promise.resolve([]);
		}

		if (!this._oFileShareBinding) {
			this._oFileShareBinding = oModel.bindList("/FileShares");
		}

		try {
			return await this._oFileShareBinding.requestContexts(0);
		} catch (oError) {
			Log.error(oError?.message ?? oError);
			return [];
		}
	};

	/**
	 * Opens the <code>CloudFilePicker</code> control and
	 * returns a <code>Promise</code> that gets resolved
	 * when the user selected a particular location for
	 * the file that should be created.
	 *
	 * @param {string} [sFileName] Suggested name of the file including file extension
	 * @returns {Promise} Resolves with the file location selected in the <code>CloudFilePicker</code>
	 *
	 * @async
	 * @private
	 */
	ExportHandler.prototype.getRemoteFileLocation = async function(sFileName) {
		const [oResourceBundle, oModel, CloudFilePicker] = await Promise.all([
			ExportUtils.getResourceBundle(),
			this.getFileShareModel(),
			ExportUtils.loadClass("sap/suite/ui/commons/CloudFilePicker")
		]);

		const oFilePicker = this._oFilePicker = new CloudFilePicker({
			sharedModel: oModel,
			suggestedFileName: sFileName,
			enableDuplicateCheck: true,
			fileNameMandatory: true,
			confirmButtonText: oResourceBundle.getText("EXPORT_BUTTON"),
			title: oResourceBundle.getText("DESTINATION_DIALOG_TITLE")
		});

		return new Promise((fnResolve, fnReject) => {
			oFilePicker.attachSelect(function(oEvent) {
				const aSelectedFiles = oEvent.getParameter("selectedFiles");
				const oSelectedFolder = oEvent.getParameter("selectedFolder");
				const bReplaceFile = oEvent.getParameter("replaceExistingFile");

				const mCloudFileInfo = {
					FileShare: oSelectedFolder.getFileShareId(),
					FileShareItemKind: "document",
					FileShareItemName: oEvent.getParameter("selectedFileName"),
					ParentFileShareItem: oSelectedFolder.getFileShareItemId()
				};

				if (bReplaceFile && Array.isArray(aSelectedFiles) && aSelectedFiles.length > 0) {
					const oCloudFile = aSelectedFiles.shift();

					mCloudFileInfo.FileShareItem = oCloudFile.getFileShareItemId();
				}

				if (!mCloudFileInfo.FileShare) {
					fnReject(oResourceBundle.getText("DESTINATION_SELECTION_INCOMPLETE"));
				}

				fnResolve(mCloudFileInfo);
			});

			oFilePicker.open();
		});
	};

	/**
	 * Creates an export instance according to the given file type
	 * and adds default event handlers.
	 *
	 * @param {object} mExportSettings mExportSettings ExportSettings that are used for the export
	 * @param {object} mCustomSettings Additional settings that are passed into the event
	 * @param {boolean} [mCustomSettings.includeFilterSettings] Defines whether the filter settings on the binding should be included in the exported file
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} A <code>Promise</code> that resolves with the desired export instance
	 *
	 * @async
	 * @private
	 */
	ExportHandler.prototype.getExportInstance = async function(mExportSettings, mCustomSettings, mCloudFileInfo) {
		const that = this;

		const [oResourceBundle, oExportInstance] = await Promise.all([
			ExportUtils.getResourceBundle(),
			ExportUtils.getExportInstance(mExportSettings, this._mCapabilities, mCloudFileInfo)
		]);

		let aFilters = [];
		const oFilterConfig = {
			name: oResourceBundle.getText("FILTER_HEADER"),
			items: []
		};

		if (mCustomSettings?.includeFilterSettings) {
			let oContext = mExportSettings.workbook.context;

			if (!oContext) {
				oContext = mExportSettings.workbook.context = {
					metainfo: []
				};
			}

			aFilters = ExportUtils.getFilters(mExportSettings.dataSource);
			oContext.metaSheetName = oFilterConfig.name;

			oContext.metainfo.push(oFilterConfig);
		}

		oExportInstance.attachBeforeExport(function(oEvent) {
			const bExecuteDefaultAction = that.fireEvent("beforeExport", {
				exportSettings: oEvent.getParameter("exportSettings"),
				userExportSettings: mCustomSettings || {},
				filterSettings: aFilters
			}, true, false);

			if (!bExecuteDefaultAction) {
				oEvent.preventDefault();
				return;
			}

			/* Sort filterSettings and write to metainfo */
			aFilters.filter((oFilter) => {
				return oFilter?.isA?.("sap.ui.export.util.Filter");
			}).sort((firstElement, secondElement) => {
				const sFirst = firstElement.getLabel().toLowerCase();
				const sSecond = secondElement.getLabel().toLowerCase();

				if (sFirst > sSecond) {
					return 1;
				}

				if (sFirst < sSecond) {
					return -1;
				}

				return 0;
			}).forEach((oFilter) => {
				oFilterConfig.items.push({
					key: oFilter.getLabel(),
					value: oFilter.getValue()
				});
			});
		});

		if (mCloudFileInfo && typeof oExportInstance.attachBeforeSave === "function") {
			oExportInstance.attachBeforeSave(function(oEvent) {
				const aArrayBuffer = oEvent.getParameter("data");
				const oExportDialog = oEvent.getParameter("exportDialog");

				mCloudFileInfo.FileShareItemContentType = oExportInstance.getMimeType();
				mCloudFileInfo.FileShareItemConvertToMimeType = oExportInstance.getMimeType();

				/* Enforce file conversion for Google Sheet */
				if (mExportSettings.fileType === FileType.GSHEET) {
					mCloudFileInfo.FileShareItemConvertToMimeType = "application/vnd.google-apps.spreadsheet";
				}

				const uInt8Array = new Uint8Array(aArrayBuffer);
				const stringArray = new Array(uInt8Array.length);

				for (let i = 0; i < uInt8Array.length; i++) {
					stringArray[i] = String.fromCharCode(uInt8Array[i]); // often a bit faster, especially with huge files, than string concatenation
				}
				mCloudFileInfo.FileShareItemContent = btoa(stringArray.join(""));

				oExportDialog.updateStatus(oResourceBundle.getText("DESTINATION_DIALOG_STATUS"));
				oEvent.preventDefault();

				this.uploadFile(mCloudFileInfo).then(() => {
					MessageToast.show(oResourceBundle.getText("DESTINATION_TRANSFER_SUCCESS"));
				}).catch(() => {
					ExportDialog.showErrorMessage(oResourceBundle.getText("DESTINATION_TRANSFER_ERROR"));
				}).finally(() => {
					oExportDialog.finish();
				});
			}, this);
		}

		return oExportInstance;
	};

	/**
	 * Uploads the file to the FileShareSupport OData service.
	 *
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} A <code>Promise</code> that gets resolved after the generated file has been transferred to the FileShareSupport OData service
	 *
	 * @async
	 * @private
	 */
	ExportHandler.prototype.uploadFile = async function(mCloudFileInfo) {
		let sUrl;
		const oModel = await this.getFileShareModel();

		const sContentProperty = "FileShareItemContent";
		const sTypeProperty = "FileShareItemContentType";

		if (mCloudFileInfo.FileShareItem) { // Overwrite existing file
			const oContext = oModel.getKeepAliveContext(`/FileShareItems(FileShare='${mCloudFileInfo.FileShare}',FileShareItem='${mCloudFileInfo.FileShareItem}')`);

			/*
			 * We have to set the FileShareItemContentLink as well
			 * as the FileShareItemContentType property explicitly
			 * to ensure that the properties will be filled with
			 * the content of the PATCH response when updating the
			 * FileShareItemContent. Adding the <code>null</code>
			 * prevents an additional PATCH for the link. It is also
			 * important to set all properties without waiting for
			 * the <code>Promise</code> to resolve. This allows the
			 * binding to bundle multiple PATCH requests into a
			 * single $batch.
			 */
			oContext.setProperty("FileShareItemContentLink", "", null);
			oContext.setProperty(sTypeProperty, mCloudFileInfo[sTypeProperty]);
			await oContext.setProperty(sContentProperty, mCloudFileInfo[sContentProperty]);

			sUrl = oContext.getProperty("FileShareItemContentLink");

		} else { // Creating new file in specific folder or _Root
			const sPath = mCloudFileInfo.ParentFileShareItem ?
				`/FileShareItems(FileShare='${mCloudFileInfo.FileShare}',FileShareItem='${mCloudFileInfo.ParentFileShareItem}')/_Children` : `/FileShares(FileShare='${mCloudFileInfo.FileShare}')/_Root/_Children`;

			const oBinding = oModel.bindList(sPath);
			sUrl = await this._createFile(oBinding, mCloudFileInfo);
		}

		if (sUrl) {
			openWindow(sUrl);
		}
	};

	/**
	 * Creates a new file via the <code>ODataListBinding</code> based
	 * on the FileShareItem representation.
	 *
	 * @param {sap.ui.model.odata.v4.ODataListBinding} oBinding ListBinding that is bound to the desired folder
	 * @param {object} mCloudFileInfo FileShareItem representation of the file
	 * @returns {Promise} <code>Promise</code> that resolves with a Link to the created file
	 *
	 * @private
	 */
	ExportHandler.prototype._createFile = function(oBinding, mCloudFileInfo) {
		return new Promise((fnResolve, fnReject) => {
			function fnCreateCompleted(oEvent) {
				const { success: bSuccess, context: oContext } = oEvent.getParameters();

				if (bSuccess) {
					oBinding.detachCreateCompleted(fnCreateCompleted);
					fnResolve(oContext.getProperty("FileShareItemContentLink"));
				} else {
					oContext.destroy();
					fnReject();
				}
			}

			oBinding.attachCreateCompleted(fnCreateCompleted);
			oBinding.create(mCloudFileInfo, /* bSkipRefresh */ true);
		});
	};

	/**
	 * Exports the data as defined via parameter. The function
	 * returns a <code>Promise</code> that will be resolved
	 * after the export process has been finished. In case of
	 * an error, its message will be shown in a <code>Dialog</code>,
	 * and the <code>Promise</code> will be rejected.
	 *
	 * @param {object} mExportSettings Export settings that are used for the export
	 * @returns {Promise} A <code>Promise</code> that gets resolved after the export process has been finished
	 *
	 * @since 1.102
	 * @async
	 * @public
	 */
	ExportHandler.prototype.export = async function(mExportSettings) {
		if (this.bIsDestroyed) {
			throw new Error("ExportHandler must not be used after calling #destroy");
		}

		const oExportInstance = await this.getExportInstance(mExportSettings);

		try {
			await oExportInstance.build();
		} finally {
			oExportInstance.destroy();
		}
	};

	/**
	 * Exports the data as defined by the user. This function will
	 * show an export settings dialog where the user can define
	 * certain settings that influence the output of the export
	 * functionality.
	 *
	 * @param {object} oSettings General export settings containing <code>workbook</code> and <code>dataSource</code> information
	 * @param {function} [fnResolveColumnLabel] Resolves the label for a particular column that is not directly contained in the export settings
	 * @returns {Promise} A <code>Promise</code> that resolves once the data has been exported
	 *
	 * @since 1.102
	 * @async
	 * @public
	 */
	ExportHandler.prototype.exportAs = async function(oSettings, fnResolveColumnLabel) {
		if (this.bIsDestroyed) {
			throw new Error("ExportHandler must not be used after calling #destroy");
		}

		await this.initialized();

		const mExportSettings = Object.assign({}, oSettings, this._mDialogSettings);
		const aContexts = await this.getFileShareContexts();
		const mDialogSettings =
			await ExportUtils.getExportSettingsViaDialog(mExportSettings, this._mCapabilities, aContexts.length > 0, (oDialog) => { this._oExportDialog = oDialog; });

		/* Cache dialog settings */
		this._mDialogSettings = mDialogSettings;

		/* Merge export settings with user settings from the dialog */
		Object.assign(mExportSettings, mDialogSettings);

		ExportUtils.validateFileSettings(mExportSettings);

		const mUserSettings = {
			splitCells: mDialogSettings.splitCells,
			includeFilterSettings: mDialogSettings.includeFilterSettings
		};

		/* Enforce split cells option for fileType PDF without persisting the value in the settings dialog */
		if (mExportSettings.fileType === FileType.PDF || mDialogSettings.splitCells) {
			mExportSettings.workbook.columns = ExportUtils.splitColumns(mExportSettings.workbook.columns, fnResolveColumnLabel);
		}

		if (mExportSettings.includeFilterSettings) {
			const oUserConfig = await ExportUtils.parseTechnicalConfiguration();
			let oContext = mExportSettings.workbook.context;

			if (!oContext) {
				oContext = mExportSettings.workbook.context = {};
			}

			oContext.metainfo = Array.isArray(oContext.metainfo) ? oContext.metainfo.push(oUserConfig) : [oUserConfig];
		}

		let mCloudFileInfo;

		if (mExportSettings.destination === Destination.REMOTE) {
			mCloudFileInfo = await this.getRemoteFileLocation(mExportSettings.fileName);
		}

		/* Validate file name only if file does not exist */
		if (mCloudFileInfo && !mCloudFileInfo.FileShareItem) {
			mCloudFileInfo.FileShareItemName = ExportUtils.validateFileName(mCloudFileInfo.FileShareItemName, mExportSettings.fileType);
		}

		/* Verify that selected FileShare is a Google Workspace */
		if (mExportSettings.fileType === FileType.GSHEET) {
			await this.validateFileShare(mCloudFileInfo);
		}

		const oExportInstance = await this.getExportInstance(mExportSettings, mUserSettings, mCloudFileInfo);

		try {
			await oExportInstance.build();
		} catch (oError) {
			ExportDialog.showErrorMessage(oError);
			throw new Error(oError);
		} finally {
			oExportInstance.destroy();
		}
	};

	/**
	 * Ensures that the referenced FileShare is of vendor Google. This
	 * temporary function is required as long as the FileShare OData
	 * service does not provide filter capabilities via $filter.
	 *
	 * @param {object} mCloudFileInfo FileShareItem representation that contains the reference to the FileShare
	 * @returns {Promise} Returns a <code>Promise</code> that either resolves with the current CloudFileInfo or rejects with an error message
	 *
	 * @private
	 */
	 ExportHandler.prototype.validateFileShare = function(mCloudFileInfo) {
		return Promise.all([
			ExportUtils.getResourceBundle(),
			this.getFileShareContexts()
		]).then((aResolve) => {
			const [oResourceBundle, aContexts] = aResolve;
			const oFileShareContext = aContexts.find((oContext) => {
				return oContext.getProperty("FileShare") === mCloudFileInfo.FileShare;
			});

			return this.isGoogleWorkspace(oFileShareContext) ? mCloudFileInfo : Promise.reject(oResourceBundle.getText("DESTINATION_ERROR_NOT_GOOGLE"));
		});
	};

	/**
	 * Returns a <code>Promise</code> that resolves with an <code>ODataModel</code> in case
	 * the FileShareSupport is available and a DataSource can be obtained.
	 *
	 * @returns {Promise<sap.ui.model.odata.v4.ODataModel>} ODataModel for the FileShareSupport service
	 *
	 * @private
	 */
	ExportHandler.prototype.getFileShareModel = async function() {

		if (this._oModel) {
			return this._oModel;
		}

		const oDataSource = await ExportUtils.fetchDataSource();

		if (oDataSource) {
			this._oModel = new ODataModel({
				serviceUrl: oDataSource.uri,
				autoExpandSelect: true
			});
		}

		return this._oModel;
	};

	/**
	 * Evaluates whether there is any FileShare with vendor Google
	 *
	 * @returns {Promise<boolean>} Indicates whether there is a FileShare with vendor Google
	 *
	 * @private
	 */
	ExportHandler.prototype.isGoogleSheetSupported = async function() {
		const aContexts = await this.getFileShareContexts();

		return aContexts.some(this.isGoogleWorkspace);
	};

	/**
	 * Evaluates whether the given FileShare vendor is Google
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext The OData <code>Context</code> of the FileShare
	 * @returns {boolean} Indicates whether the FileShare vendor is Google
	 *
	 * @private
	 */
	ExportHandler.prototype.isGoogleWorkspace = function(oContext) {
		const sVendorType = oContext.getProperty("FileShareVendorType");
		const sDescription = oContext.getProperty("FileShareDescription");

		return sVendorType === "GOOGLE"
			|| (typeof sDescription === "string" && sDescription.indexOf("Google") > -1);
	};

	return ExportHandler;
}, /* bExports */ true);
