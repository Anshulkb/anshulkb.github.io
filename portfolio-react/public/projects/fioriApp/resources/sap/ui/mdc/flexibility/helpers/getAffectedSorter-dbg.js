/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"./addKeyOrName"
], (addKeyOrName) => {
	"use strict";

	/**
	 * Returns the ID of the sorter affected by the change.
	 *
	 * @param {object} oChangeContent content of the change
	 * @returns {string} ID of the affected control
	 *
	 * @private
	 */
	const getAffectedSorter = (oChangeContent) => {
		const sSortOrder = oChangeContent.descending ? "desc" : "asc";
		return `${addKeyOrName(oChangeContent).key}-${sSortOrder}`;
	};

	return getAffectedSorter;
});
