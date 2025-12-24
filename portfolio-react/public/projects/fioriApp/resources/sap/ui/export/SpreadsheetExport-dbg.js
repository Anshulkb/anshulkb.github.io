/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

/**
 * Spreadsheet export utility
 * @private
 */
sap.ui.define(['sap/base/Log', 'sap/ui/export/ExportUtils'], function(Log, ExportUtils) {
	'use strict';

	// eslint-disable-next-line
	/* global Blob, URL, Worker, MessageEvent */

	var LIB_PROVIDER = 'sap/ui/export/provider/DataProviderBase',
		LIB_BUILDER = 'sap/ui/export/js/XLSXBuilder',
		LIB_JSZIP3 = 'sap/ui/export/js/libs/JSZip3';

	/**
	 * Utility class to perform spreadsheet export.
	 *
	 * @author SAP SE
	 * @version 1.142.0
	 *
	 * @alias sap.ui.export.SpreadsheetExport
	 * @private
	 * @since 1.50.0
	 */
	var SpreadsheetExport = {

		execute: function(mParams, fnCallback) {

			function postMessage(oMessage) {

				// Harmonize message handling between worker and in process export
				if (oMessage instanceof MessageEvent && oMessage.data) {
					oMessage = oMessage.data;
				}

				if (typeof fnCallback === 'function') {
					fnCallback(oMessage);
				}
			}

			function onProgress(iFetched, iTotal) {
				postMessage({
					progress: true,
					fetched: iFetched || 0,
					total: iTotal || 0
				});
			}

			function onError(oError) {
				postMessage({ error: oError.message || oError });
			}

			function onFinish(oArrayBuffer) {
				postMessage({ finished: true, spreadsheet: oArrayBuffer });
			}

			// Export directly from an array in memory.
			// TBD: convert dates as in exportUtils
			function exportArray() {
				let oSpreadsheet;
				let fnConvertData;

				function start(DataProvider, XLSXBuilder) {
					fnConvertData = DataProvider.getDataConverter(mParams);
					oSpreadsheet =
						new XLSXBuilder(mParams.workbook.columns, mParams.workbook.context, mParams.workbook.hierarchyLevel, mParams.customizing);

					var aData = mParams.dataSource.data || [];
					var iCount = aData.length;
					var aRows = fnConvertData(aData.slice());
					oSpreadsheet.append(aRows);
					onProgress(iCount, iCount);
					oSpreadsheet.build().then(onFinish);
				}

				// Load libraries and start export
				sap.ui.require([LIB_PROVIDER, LIB_BUILDER, LIB_JSZIP3], start);

				return {cancel: onFinish};
			}

			function exportInProcess() {
				let oSpreadsheet, oRequest;

				function start(DataProvider, XLSXBuilder) {
					var provider = new DataProvider(mParams);

					oSpreadsheet =
						new XLSXBuilder(mParams.workbook.columns, mParams.workbook.context, mParams.workbook.hierarchyLevel, mParams.customizing);
					oRequest = provider.requestData(processCallback);
				}

				function processCallback(oMessage) {

					if (oMessage.error || typeof oMessage.error === 'string') {
						onError(oMessage.error);
						return;
					}

					oSpreadsheet.append(oMessage.rows);
					onProgress(oMessage.fetched, oMessage.total);

					if (oMessage.finished) {
						oSpreadsheet.build().then(onFinish);
					}
				}

				function cancel() {
					oRequest.cancel();
					onFinish();
				}

				// Load libraries and start export
				sap.ui.require([LIB_PROVIDER, LIB_BUILDER, LIB_JSZIP3], start);

				return {cancel: cancel};
			}

			function exportInWorker() {
				let oSpreadsheetWorker;
				const mWorkerParams = {};

				var fnCancel = function() {
					oSpreadsheetWorker.postMessage({ cancel: true });
					onFinish();
				};

				function createWorker(sUrl) {
					const {promise: oPromise, resolve: fnResolve, reject: fnReject} = Promise.withResolvers();
					const oWorker = new Worker(sUrl);
					const errorHandler = (oEvent) => {
						oWorker.terminate();
						fnReject(oEvent);
					};
					const messageHandler = (oEvent) => {
						if (oEvent.data.initialized) {
							oWorker.removeEventListener("message", messageHandler);
							oWorker.removeEventListener("error", errorHandler);

							oWorker.addEventListener("message", postMessage);
							oWorker.addEventListener("error", onError);
							fnResolve(oWorker);
						}
					};

					oWorker.addEventListener("message", messageHandler);
					oWorker.addEventListener("error", errorHandler);

					return oPromise;
				}

				function createBlobWorker() {
					Log.warning('Direct worker is not allowed. Load the worker via Blob.');

					const sBlobCode = `self.origin = "${mWorkerParams.base}"; importScripts("${mWorkerParams.src}");`;
					const oBlobURL = window.URL.createObjectURL(new Blob([sBlobCode]));

					return createWorker(oBlobURL);
				}

				/**
				 * Returns a worker instance. First tries to create a direct worker, if this fails, e.g. due to
				 * cross-origin or CSP restrictions, a blob worker is created. When no worker can be created, the
				 * Promise is rejected.
				 *
				 * @returns {Promise<Worker>} Worker instance
				 */
				async function getWorker() {
					let oWorker;

					try {
						oWorker =  await createWorker(mWorkerParams.src);
					} catch (oError) {
						oWorker = await createBlobWorker();
					}

					return oWorker;
				}

				function noWorker() {
					Log.warning('Blob worker is not allowed. Use in-process export.');
					fnCancel = exportInProcess(mParams).cancel;
				}

				async function start() {
					try {
						oSpreadsheetWorker = await getWorker();
						oSpreadsheetWorker.postMessage(mParams);
					} catch (oError) {
						noWorker();
					}
				}

				// worker settings
				mWorkerParams.base = ExportUtils.normalizeUrl(sap.ui.require.toUrl('sap/ui/export/js/'));
				mWorkerParams.src = `${mWorkerParams.base}SpreadsheetWorker.js`;

				start();

				// fnCancel may be overwritten asynchronously after return, therefore it should be wrapped into a closure
				return {cancel: () => { fnCancel(); }};
			}

			if (mParams.dataSource.type === 'array') {
				return exportArray();
			} else if (mParams.worker === false) {
				return exportInProcess();
			} else {
				return exportInWorker();
			}
		}
	};

	return SpreadsheetExport;

}, /* bExport= */ true);
