/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

(function(fClass) {
	"use strict";

	if (typeof globalThis.sap?.ui?.define === "function") {
		globalThis.sap.ui.define([], fClass, /* bExport */ true);
	} else {
		globalThis.DataProviderBase = fClass();
	}
})(function() {
	"use strict";

	// eslint-disable-next-line
	/* global URL */

	/**
	 *	Default DataProviderBase implementation that is capable to handle
	 *	OData V2 as well as OData V4.
	 *
	 * @param {object} mSettings Data service related part of the export configuration
	 *
	 * @author SAP SE
	 * @version 1.142.0
	 *
	 * @constructor
	 * @class DataProviderBase
	 * @alias sap.ui.export.provider.DataProviderBase
	 * @since 1.77
	 * @private
	 */
	const DataProviderBase = function(mSettings) {

		this.mSettings = mSettings;
		this.bCanceled = false;
		this.iAvailableRows = 0;
		this.mRequest = null;
		this.iCount = Math.min(mSettings.dataSource.count || DataProviderBase.MAX_ROWS, DataProviderBase.MAX_ROWS);
		this.iTotalRows = mSettings.dataSource.downloadLimit ?? DataProviderBase.MAX_ROWS;
		this.iBatchSize = Math.min(mSettings.dataSource.sizeLimit || DataProviderBase.MAX_ROWS, this.iTotalRows);
		this.fnConvertData = DataProviderBase.getDataConverter(mSettings);

		this._prepareDataUrl();
	};

	DataProviderBase.MAX_ROWS = 1048575; // Spreadsheet limit minus 1 for the header row: 1,048,575
	DataProviderBase.HTTP_ERROR_MSG = "HTTP connection error";
	DataProviderBase.HTTP_WRONG_RESPONSE_MSG = "Unexpected server response:\n";

	/**
	 * Creates a pseudo random GUID. This algorithm is not suitable for
	 * cryptographic purposes and should not be used for such.
	 *
	 * @returns {string} Generated GUID
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._createGuid = function() {
		if (globalThis.crypto?.randomUUID) {
			return globalThis.crypto.randomUUID();
		}

		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
			const r = Math.random() * 16 | 0, // Bitwise OR is equivalent to Math.floor() but faster
				v = c === "x" ? r : ((r & 0x3) | 0x8); // In case of c != "x", the value is always between 0x8 and 0xB

			return v.toString(16);
		});
	};

	/**
	 * The function returns array of columns that need special conversion for values.
	 * E.g. handling data from association/navigationProperty
	 *
	 * @param {Array} aColumns Configuration object
	 * @returns {Array} Collection of columns that need special conversion for their values
	 *
	 * @static
	 * @private
	 */
	DataProviderBase.getColumnsToConvert = function(aColumns) {
		return aColumns.reduce(function(result, col) {

			// Handle aggregated properties and single properties
			const properties = col.property instanceof Array ? col.property : [col.property];
			// Handle unitProperty which too could be from an association
			if (col.unitProperty) {
				properties.push(col.unitProperty);
			}

			properties.forEach(function(property) {

				// Convert navigation property and date fields
				const aKeys = property.split("/");

				if (aKeys.length > 1) {
					result.push({
						property: property,
						keys: aKeys
					});
				}
			});

			return result;
		}, []);
	};

	/**
	 * The function returns a conversion function for raw data.
	 *
	 * @param {object} mSettings Export settings that are used to create the the converter function
	 * @returns {function} Conversion function
	 *
	 * @static
	 * @since 1.77
	 * @public
	 */
	DataProviderBase.getDataConverter = function(mSettings) {
		let aColumns = mSettings.workbook.columns;

		/* Add hierarachyLevel as virtual column for NavigationProperty conversion */
		if (mSettings.workbook.hierarchyLevel) {
			aColumns = aColumns.concat([{
				property: mSettings.workbook.hierarchyLevel
			}]);
		}

		const aColumnsToConvert = this.getColumnsToConvert(aColumns);

		return function(aRows) {
			return DataProviderBase._convertData(aRows, aColumnsToConvert);
		};
	};

	/**
	 * Function to process the JSON result array from a ODataService.
	 *
	 * @param {Array} aRows Data array that contains the received data
	 * @param {Array} aCols Columns that need to be converted
	 * @returns {Array} An array of rows
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._convertData = function(aRows, aCols) {
		aCols.forEach(function(col) {
			aRows.forEach(function(row) {
				row[col.property] = DataProviderBase._getValue(row, col);
			});
		});

		return aRows;
	};

	/**
	 * Gets converted property value from raw data.
	 * Navigation properties are parsed.
	 *
	 * @param {object} oRow Raw data row
	 * @param {object} oCol Column information
	 * @param {Array} oCol.keys Property name or key path for navigation properties
	 * @returns {number|string|boolean} The converted property value
	 *
	 * @static
	 * @private
	 */
	DataProviderBase._getValue = function(oRow, oCol) {

		// Get property value
		const value = oCol.keys.reduce(function(obj, key) {
			return obj && obj[key];
		}, oRow);

		return value;
	};

	/**
	 * The function requests several chunks of data until the maximum
	 * amount of data is fetched.
	 *
	 * @param {function} fnProcessCallback Callback function that is triggered when data is received
	 * @returns {object} Object reference that allows to cancel the current processing
	 *
	 * @since 1.77
	 * @public
	 */
	DataProviderBase.prototype.requestData = function(fnProcessCallback) {
		const mDataSource = this.mSettings.dataSource;

		this.fnProcessCallback = fnProcessCallback;

		// Execution
		this.mRequest = {
			serviceUrl: this._cleanUrl(mDataSource.serviceUrl),
			dataUrl: this._getUrl(0, this.iBatchSize),
			useBatch: mDataSource.useBatch,
			headers: mDataSource.headers
		};

		this.sendRequest(this.mRequest)
			.then(this.fnOnDataReceived.bind(this))
			.catch(this.fnOnError.bind(this));

		return {
			cancel: function() {
				this.bCanceled = true;

				if (this._oPendingRequest instanceof AbortController) {
					this._oPendingRequest.abort();
				}
			}.bind(this)
		};
	};

	/**
	 * Inner function that processes the received data. Processing
	 * the data before executing the callback function allows to
	 * apply transformations to the data.
	 *
	 * @param {Response} oResponse The <code>Response</code> object that was received
	 *
	 * @async
	 * @private
	 */
	DataProviderBase.prototype.fnOnDataReceived = async function(oResponse) {
		this._oPendingRequest = null;

		if (this.bCanceled) {
			return; // Cancelled by the application
		}

		const {data: aData, nextUrl: sNextUrl} = await DataProviderBase.getHarmonizedBodyFrom(oResponse);
		const bWasServerSidePaging = this.mRequest?.dataUrl.includes("$skiptoken");
		const iFetchedRows = aData.length;

		this.iAvailableRows += iFetchedRows;

		const iRemainingRows = this.iTotalRows - this.iAvailableRows;
		const mCallbackParams = {};

		mCallbackParams.finished = this._isFinished(iFetchedRows, sNextUrl, iRemainingRows, bWasServerSidePaging);
		mCallbackParams.progress = this.iTotalRows;
		mCallbackParams.total = this.iTotalRows < this.iCount ? this.iTotalRows : this.iCount;
		mCallbackParams.fetched = this.iAvailableRows;

		if (!mCallbackParams.finished) {
			// Trigger next page request before processing received data. Fetch only configured/max limit rows
			this.mRequest.dataUrl = this._getUrl(this.iAvailableRows, Math.min(this.iBatchSize, iRemainingRows), sNextUrl);
			this.sendRequest(this.mRequest)
				.then(this.fnOnDataReceived.bind(this))
				.catch(this.fnOnError.bind(this));
		}

		if (iFetchedRows < this.iBatchSize && sNextUrl) {
			this.iBatchSize = iFetchedRows;
		}
		mCallbackParams.rows = this.fnConvertData(aData); // Normalize data
		this.fnProcessCallback(mCallbackParams); // Return result
	};

	/**
	 * The function checks if the finish condition is met. This depends on
	 * multiple parameters like the amount of fetched rows, the next URL,
	 * the remaining rows and if server side paging was used.
	 *
	 * If the request was fulfilled, the function returns <code>false</code>
	 * to allow fetching additional data. If no data was fetched, the function
	 * returns <code>true</code>. If the remaining rows are less or equal to
	 * zero, the function returns <code>true</code>. If next URL is provided
	 * or server side paging was used while less data than expected was
	 * returned, the function returns <code>false</code>.
	 *
	 * If none of the beforementioned conditions are met, the function returns
	 * <code>true</code>.
	 *
	 * @param {number} iFetchedRows Number of rows fetched
	 * @param {string} sNextUrl Next url to fetch data
	 * @param {number} iRemainingRows Remaining rows to fetch
	 * @param {boolean} bWasServerSidePaging Flag if server side paging was used
	 *
	 * @returns {boolean} True if the finish condition is met
	 * @private
	 */
	DataProviderBase.prototype._isFinished = function(iFetchedRows, sNextUrl, iRemainingRows, bWasServerSidePaging) {

		if (iFetchedRows === 0 || iRemainingRows <= 0) {
			return true;
		}

		if (iFetchedRows === this.iBatchSize) {
			return false;
		}

		if (sNextUrl) {
			return false;
		}

		// If server side paging was used, the data chunks can be smaller than the batch size
		if (iFetchedRows < this.iBatchSize && bWasServerSidePaging) {
			return false;
		}

		return true;
	};

	/**
	 * Inner function that processes request handler exceptions.
	 *
	 * @param {string} sMessage Error message.
	 *
	 * @private
	 */
	DataProviderBase.prototype.fnOnError = function(sMessage) {
		this.fnProcessCallback({
			error: sMessage
		});
	};

	/**
	 * Nested function to remove not used information from the URL
	 *
	 * @param {string} sUrl A URL that may contain a path, hash and request parameters
	 *
	 * @returns {string} A clean URL
	 * @private
	 */
	DataProviderBase.prototype._cleanUrl = function(sUrl) {
		if (!sUrl) {
			return "";
		}

		const oURL = new URL(sUrl);

		oURL.hash = oURL.search = "";
		oURL.pathname += oURL.pathname.endsWith("/") ? "" : "/";

		return oURL.toString();
	};

	/**
	 * The function processes the dataURL and adds any missing $skip or $top before initial use.
	 *
	 * @private
	 */
	DataProviderBase.prototype._prepareDataUrl = function() {
		const mDataSource = this.mSettings.dataSource;
		const reSkip = /\$skip\=[0-9]+/, reTop = /\$top\=[0-9]+/;

		if (!mDataSource.dataUrl) {
			throw "Unable to load data - no URL provided.";
		}

		const mDataUrl = new URL(mDataSource.dataUrl);

		mDataUrl.search = mDataUrl.search || "";

		// Add missing $skip if needed
		if (!reSkip.test(mDataUrl.search)) {
			// Apply $skip with some numeric dummy value that matches the regexp in DataProviderBase#_getUrl
			mDataUrl.search += (mDataUrl.search.length ? "&$skip=" : "$skip=") + 0;
		}
		// Add missing $top if needed
		if (!reTop.test(mDataUrl.search)) {
			// Apply $top with some numeric dummy value that matches the regexp in DataProviderBase#_getUrl
			mDataUrl.search += "&$top=" + 0;
		}

		this.mSettings.dataSource.dataUrl = mDataUrl.toString();
	};

	/**
	 * Creates the download URL for the next query.
	 *
	 * @param {number} iSkip The amount of items that are already present and will be skipped
	 * @param {number} iTop The amount of items that should be requested with this query
	 * @param {string} [sNextUrl] A reference to the next bulk of data that was returned by the previous request
	 *
	 * @returns {string} The URL for the next query
	 * @private
	 */
	DataProviderBase.prototype._getUrl = function(iSkip, iTop, sNextUrl) {
		const oDataUrl = new URL(this.mSettings.dataSource.dataUrl);

		/*
		 * Use $skiptoken from response to query the next items.
		 * OData V4 returns a relative path, while OData V2 returns
		 * an absolute path. Therefore we need to use the original
		 * URL to keep possible proxy settings and avoid any issues
		 * between OData V4 and V2
		 */
		if (sNextUrl) {
			// sNextUrl can be relative, therefore we need to apply a base even though it is not used
			const oNextUrl = new URL(sNextUrl, oDataUrl.origin);

			oDataUrl.search = oNextUrl.search;
		} else { // Use $skip and $top
			oDataUrl.search = (oDataUrl.search || "")
				.replace(/\$skip\=[0-9]+/g, "$skip=" + iSkip)
				.replace(/\$top\=[0-9]+/g, "$top=" + iTop);
		}

		return oDataUrl.toString();
	};

	/**
	 * This method creates a fetch Request from the provided configuration and
	 * requests the data from the backend. If the data is requested via $batch
	 * the corresponding Reponse is unwrapped and returned. This allows direct
	 * access to the result of the inner request and provides a harmonized API
	 * for consuming the data.
	 *
	 * @param {object} mSettings Request configuration object
	 * @param {string} mSettings.useBatch Defines if the data is requested via GET or $batch request
	 * @param {string} mSettings.dataUrl References the resource URL that gets invoked
	 * @param {string} mSettings.serviceUrl References the service URL that gets invoked
	 *
	 * @return {Promise} Returns a Promise that will be resolve once the requested data was fetched
	 * @async
	 * @private
	 */
	DataProviderBase.prototype.sendRequest = async function(mSettings) {
		if (typeof mSettings !== "object" || mSettings === null || typeof mSettings.dataUrl !== "string") {
			throw new Error("Unable to send request - Mandatory parameters missing.");
		}

		const bBatchRequest = mSettings.useBatch && mSettings.serviceUrl;
		const oAbortController = new AbortController();
		const oRequest = bBatchRequest ?
			DataProviderBase.createBatchRequest(mSettings, oAbortController) : DataProviderBase.createGetRequest(mSettings, oAbortController);
		let oResponse;

		try {
			this._oPendingRequest = oAbortController;
			oResponse = await fetch(oRequest);
		} catch (oError) {
			this._oPendingRequest = null;

			if (oError.name === "AbortError") {
				throw null; // Explicitly reject the Promise without an error to indicate user cancellation
			} else {
				throw oError; // Technical request error
			}
		}

		oResponse = bBatchRequest ? await DataProviderBase.getBatchResponse(oResponse) : oResponse;

		if (!oResponse.ok) {
			const sMessage = await oResponse.text();
			throw new Error(DataProviderBase.HTTP_WRONG_RESPONSE_MSG + sMessage);
		}

		return oResponse;
	};

	/**
	 * Creates a <code>Request</code> object for an OData GET request.
	 *
	 * @param {object} mSettings Request configuration
	 * @param {string} mSettings.dataUrl References the resource URL that gets invoked
	 * @param {AbortController} oAbortController AbortController instance to cancel the request
	 *
	 * @returns {Request} The request object
	 * @static
	 * @private
	 */
	DataProviderBase.createGetRequest = function(mSettings, oAbortController) {
		const oHeaders = new Headers(mSettings.headers);

		oHeaders.set("Accept", "application/json");

		return new Request(mSettings.dataUrl, {
			cache: "no-store",
			headers: oHeaders,
			signal: oAbortController.signal
		});
	};

	/**
	 * Creates a <code>Request</code> object for an OData $batch request.
	 *
	 * @param {object} mSettings Request configuration
	 * @param {string} mSettings.dataUrl References the resource URL that gets invoked
	 * @param {string} mSettings.serviceUrl References the service URL that gets invoked
	 * @param {AbortController} oAbortController AbortController instance to cancel the request
	 *
	 * @returns {Request} The request object
	 * @static
	 * @private
	 */
	DataProviderBase.createBatchRequest = function(mSettings, oAbortController) {
		const sUrl = mSettings.dataUrl.split(mSettings.serviceUrl)[1];
		const sBoundary = "batch_" + DataProviderBase._createGuid();
		const oHeaders = new Headers(mSettings.headers);
		const sBody = DataProviderBase.createRequestBody(sUrl, sBoundary, oHeaders);

		oHeaders.set("Accept", "multipart/mixed");
		oHeaders.set("Content-Type", "multipart/mixed;boundary=" + sBoundary);

		return new Request(mSettings.serviceUrl + "$batch", {
			body: sBody,
			cache: "no-store",
			headers: oHeaders,
			method: "POST",
			signal: oAbortController.signal
		});
	};

	/**
	 * Creates the request body for a $batch request.
	 *
	 * @param {string} sUrl The URL that is requested
	 * @param {string} sBoundary The boundary id for the inner request
	 * @param {Headers} oHeaders The headers that are sent with the request
	 *
	 * @returns {string} The request body
	 * @static
	 * @private
	 */
	DataProviderBase.createRequestBody = function(sUrl, sBoundary, oHeaders) {
		const aBody = [];

		aBody.push("--" + sBoundary);
		aBody.push("Content-Type: application/http");
		aBody.push("Content-Transfer-Encoding: binary");
		aBody.push("");
		aBody.push(`GET ${sUrl} HTTP/1.1`);

		/* Set header information */
		aBody.push("Accept:application/json");

		for (const [sKey, sValue] of oHeaders.entries()) {

			if (sKey != "accept") {
				aBody.push(sKey + ":" + sValue);
			}
		}

		aBody.push("");
		aBody.push("");
		aBody.push("--" + sBoundary + "--");
		aBody.push("");

		return aBody.join("\r\n");
	};

	/**
	 * Extracts the response body from a $batch request and returns
	 * it as <code>Response</code> object.
	 *
	 * @param {Response} oResponse The response object that contains the $batch response
	 *
	 * @returns {Response} The response object for the inner request
	 * @static
	 * @async
	 * @private
	 */
	DataProviderBase.getBatchResponse = async function(oResponse) {
		const sResponseBody = await oResponse.text();

		if (!oResponse.ok) {
			throw new Error(DataProviderBase.HTTP_WRONG_RESPONSE_MSG + sResponseBody);
		}

		const aLines = sResponseBody.split("\r\n");

		// Remove all lines prior to HTTP status
		aLines.splice(0, aLines.findIndex((sLine) => /^HTTP\/1\.[0|1] ([1-9][0-9]{2})/.test(sLine)));

		const [, iStatusCode, sStatusText] = aLines[0].match(/^HTTP\/1\.[0|1] ([1-9][0-9]{2}) ?([\w ]*)$/);
		const sBody = aLines.find((sLine) => sLine.startsWith("{") && sLine.endsWith("}"));

		const reHeaders = /^([\w\-]+): ?([\d\w\./]+)/;
		const oHeaders = aLines
			.filter((sLine) => reHeaders.test(sLine))
			.reduce((oAccumulator, sLine) => {
				const [, sKey, sValue] = sLine.match(reHeaders);

				oAccumulator.set(sKey, sValue);

				return oAccumulator;
			}, new Headers());

		return new Response(sBody, {
			status: iStatusCode,
			statusText: sStatusText,
			headers: oHeaders
		});
	};

	/**
	 * Extracts the JSON data from the <code>Response</code> object and returns a harmonized result.
	 * It evaluates the result in the following order:
	 * 1. OData V4
	 * 2. OData V2
	 * 3. Default
	 *
	 * If the result is not an array, an empty array is returned.
	 *
	 * @param {Response} oResponse The response body that contains the data
	 *
	 * @returns {Array} The response data as Array
	 * @static
	 * @async
	 * @private
	 */
	DataProviderBase.getHarmonizedBodyFrom = async function(oResponse) {
		const oResult = {
			data: []
		};

		if (!oResponse) {
			return oResult;
		}

		const oBody = await oResponse.json();

		if (!oBody) {
			return oResult;
		}

		const aData = oBody.value || oBody.d?.results || oBody.d || oBody;

		oResult.nextUrl = oBody["@odata.nextLink"] ??  oBody.d?.__next;

		if (Array.isArray(aData)) {
			oResult.data = aData;
		}

		return oResult;
	};

	return DataProviderBase;
});
