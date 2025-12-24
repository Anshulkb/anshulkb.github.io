
/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	"sap/m/library"
], function(
	library
) {
	"use strict";
	/**
	 * @private
	 * @ui5-restricted sap.ui.comp.P13nOperationsHelper
	 * @since 1.136
	 * @alias sap.ui.comp.p13n.P13nOperationsHelperBase
	 * @class
	 */
	var P13nOperationsHelperBase = function () {
		this.init();
	};
	var Operation = library.P13nConditionOperation;
	P13nOperationsHelperBase.prototype.oIncludeOperations = {
		"default": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"string": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.StartsWith,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"date": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"time": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"datetime": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numeric": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numc": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"boolean": [
			Operation.EQ
		]
	};
	P13nOperationsHelperBase.prototype.oExcludeOperationsDefault = {
		"default": [
				Operation.EQ
			]
	};
	P13nOperationsHelperBase.prototype.oExcludeOperationsExtended = {
		"default": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"string": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.StartsWith,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"date": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"time": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"datetime": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numeric": [
			Operation.EQ,
			Operation.BT,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"numc": [
			Operation.Contains,
			Operation.EQ,
			Operation.BT,
			Operation.EndsWith,
			Operation.LT,
			Operation.LE,
			Operation.GT,
			Operation.GE
		],
		"boolean": [
			Operation.EQ
		]
	};
	P13nOperationsHelperBase.prototype.init = function () {
		this.oExcludeOperations = this.oExcludeOperationsDefault;
	};
	P13nOperationsHelperBase.prototype.setUseExcludeOperationsExtended = function () {
		this.oExcludeOperations = this.oExcludeOperationsExtended;
	};
	P13nOperationsHelperBase.prototype.getIncludeOperationsByType = function (sType) {
		if (!sType) {
			sType = "default";
		}
		// Return a copy of the operations list so it could be modified later per field
		return this.oIncludeOperations[sType].map(function (sOperation) {return sOperation;});
	};
	P13nOperationsHelperBase.prototype.getExcludeOperationsByType = function (sType) {
		if (!sType) {
			sType = "default";
		}
		// Return a copy of the operations list so it could be modified later per field
		return this.oExcludeOperations[sType].map(function (sOperation) {return sOperation;});
	};
	P13nOperationsHelperBase.prototype.getIncludeTypes = function () {
		return Object.keys(this.oIncludeOperations);
	};
	P13nOperationsHelperBase.prototype.getExcludeTypes = function () {
		return Object.keys(this.oExcludeOperations);
	};
	return P13nOperationsHelperBase;
});
