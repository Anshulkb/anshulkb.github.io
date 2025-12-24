/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

// --------------------------------------------------------------------------------
// Utility class to provide DateRangeType related functions
// --------------------------------------------------------------------------------
sap.ui.define(["sap/ui/comp/config/condition/DateRangeType"], function (DateRangeType) {
	"use strict";

	/**
	 * Utility class to provide DateRangeType related functions
	 *
	 * @private
	 */
	var DateRangeTypeUtils = {
		_calculateDateRangeValues: function ({ columnKey, dateFormatSettings, conditionTypeInfo, fieldViewMetadata }) {
			const oFieldViewMetadata = Object.assign({}, fieldViewMetadata, { ui5Type: fieldViewMetadata.modelType });
			if (!conditionTypeInfo) {
				return null;
			}

			const oFakeFilterProvider = {
					_oDateFormatSettings: dateFormatSettings || { UTC: true },
					_getType: () => { return oFieldViewMetadata.ui5Type; },
					_createFilterControlId: () => { return "fakeFilterControlId"; }
				},
				oDateRangeType = new DateRangeType(columnKey, oFakeFilterProvider, oFieldViewMetadata);

			oDateRangeType.getControls = () => {};
			oDateRangeType.initialize({ items: [], value: null });
			oDateRangeType.setCondition(conditionTypeInfo);

			const aRanges = oDateRangeType.getFilterRanges();

			if (aRanges && aRanges.length > 0) {
				return {
					oValue1: aRanges[0].value1,
					oValue2: aRanges[0].value2
				};
			}

			oDateRangeType?.destroy?.();
			return null;
		}
	};

	return DateRangeTypeUtils;
});
