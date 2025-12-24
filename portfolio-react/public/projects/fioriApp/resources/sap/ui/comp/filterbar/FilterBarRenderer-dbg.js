/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

sap.ui.define(["sap/ui/core/Renderer", "sap/ui/mdc/filterbar/FilterBarLayoutRenderer"],

	function(Renderer, FilterBarLayoutRenderer) {
		"use strict";

		/**
		 * FilterBarLayout renderer.
		 * @namespace
		 */
		var FilterBarRenderer = Renderer.extend(FilterBarLayoutRenderer);
		FilterBarRenderer.apiVersion = 2;

		FilterBarRenderer.addRootDivClasses = function (oRm, oFilterBar) {
			oRm.class("sapUiCompFilterBar");
			oRm.class(oFilterBar._isPhone() ? "sapUiCompFilterBarPhone" : "sapUiCompFilterBarNonPhone");
			if (oFilterBar._getUseToolbar()) {
				oRm.class("sapUiCompFilterBarWithToolbar");
			}

			if (!oFilterBar._getAdvancedMode()) {
				oRm.class("sapContrastPlus");
			}
		};

		FilterBarRenderer.renderToolbar = function(oRm, oFilterBar) {
			if (!oFilterBar._getUseToolbar()) {
				oRm.cleanupControlWithoutRendering(oFilterBar.getAggregation("_toolbar"));
				return; // Early return if no toolbar is used
			}

			oRm.renderControl(oFilterBar.getAggregation("_toolbar"));
		};

		FilterBarRenderer.renderLabel = function (oRm, oFilterBar, oFilterGroupItem) {
			oRm.renderControl(oFilterGroupItem._oLabel);
		};

		FilterBarRenderer.renderControl = function(oRm, oFilterBar, oFilterGroupItem) {
			oRm.renderControl(oFilterGroupItem._getControl());
		};

		FilterBarRenderer.setContainerWidth = function (oRm, oFilterBar) {
			const sWidth = oFilterBar.getFilterContainerWidth();
			if (sWidth !== "12rem") {
				oRm.style("flex-basis", sWidth);
				oRm.style("max-width", oFilterBar._getUseToolbar() ? sWidth : oFilterBar._getMaxItemWidth());
			}
		};

		FilterBarRenderer.renderShowAllButton = function(oRm, oFilterBar, iItemsCount) {
			if (!oFilterBar.getIsRunningInValueHelpDialog() || oFilterBar.getShowAllFilters() || iItemsCount <= oFilterBar._nMaxFiltersByDefault) {
				return; // Early return if not running in value help dialog or showAllFilters is true
			}

			oRm.openStart("div", `${oFilterBar.getId()}-showAll-container`);
			oRm.class("sapUiMdcFilterBarLayoutButtons");
			oRm.openEnd();
			oRm.renderControl(oFilterBar.getAggregation("_showAllFiltersButton"));
			oRm.close("div");
		};

		FilterBarRenderer.renderHintText = function (oRm, oFilterBar) {
			if (oFilterBar._getAdvancedMode() || oFilterBar._isPhone() || oFilterBar._hasAnyVisibleFiltersOnFB() || !oFilterBar._getUseToolbar()) {
				oRm.cleanupControlWithoutRendering(oFilterBar.getAggregation("_hintText"));
				return; // Early return if filterbar is in advanced mode, or is on phone or there any visible filters or no toolbar
			}

			oRm.renderControl(oFilterBar.getAggregation("_hintText"));
		};

		/**
		 * @deprecated As of version 1.122 together with the content aggregation
		 */
		FilterBarRenderer.renderContent = function (oRm, oFilterBar) {
			const aContent = oFilterBar.getContent();

			if (!aContent.length) {
				return;
			}

			oRm.openStart("div");
			oRm.class("sapUiCompFilterBarContent");
			oRm.openEnd();
			aContent.forEach(oRm.renderControl);
			oRm.close("div");
		};

		FilterBarRenderer.renderItems = function (oRm, oFilterBar) {
			if (oFilterBar._shouldRenderAdvancedLayout()) {
				this.renderAdvancedFilterItems(oRm, oFilterBar);
			} else {
				this.renderFilterItems(oRm, oFilterBar);
			}
		};

		FilterBarRenderer.renderAdvancedFilterItems = function (oRm, oFilterBar) {
			const aItems = oFilterBar._mAdvancedAreaFilterFlat.length ? oFilterBar._mAdvancedAreaFilterFlat : oFilterBar._getAllFilterItemsFlat(),
				mGroupsWithVisibleFilters = oFilterBar._groupsWithVisibleFilters() ?? {},
				iNumberOfGroups = Object.keys(mGroupsWithVisibleFilters).length;

			if (!aItems?.length || !oFilterBar._getFilterBarExpanded()) {
				return;
			}

			oRm.openStart("div", `${oFilterBar.getId()}-items`);
			oRm.class("sapUiCompFilterBarAdvancedItems");
			if (iNumberOfGroups <= 2) {
				oRm.class("sapUiCompFilterBarAdvancedItemsTwoGroups");
			}
			oRm.openEnd();

			if (iNumberOfGroups === 1) {
				this.renderAdvancedFilterItemsSingleGroup(oRm, oFilterBar, aItems);
			} else {
				this.renderAdvancedFilterItemsMultiGroups(oRm, oFilterBar, aItems, iNumberOfGroups);
			}

			oRm.close("div");
		};

		FilterBarRenderer.renderAdvancedFilterItemsSingleGroup = function (oRm, oFilterBar, aItems) {
			const iNumberOfItems = aItems.length;
			let aOpenGroupIndexes = [0, Math.ceil(iNumberOfItems / 2)],
				aCloseGroupIndexes = [Math.ceil(iNumberOfItems / 2) - 1, iNumberOfItems - 1];

			if (iNumberOfItems <= 2) {
				aOpenGroupIndexes = [0];
				aCloseGroupIndexes = [iNumberOfItems - 1];
			}

			for (let i = 0; i < iNumberOfItems; i++) {
				const oItem = aItems[i],
					oFilterGroupItem = oItem.filterItem;

				if (aOpenGroupIndexes.includes(i)) {
					// Render FilterGroup container
					oRm.openStart("div");
					oRm.class("sapUiCompFilterBarAdvancedGroup");
					oRm.openEnd();
				}

				if (oFilterGroupItem.getVisible() && oFilterGroupItem.getVisibleInFilterBar() && !oFilterGroupItem.getHiddenFilter()) {
					this.renderFilterItem(oRm, oFilterBar, oFilterGroupItem);
				}

				if (aCloseGroupIndexes.includes(i)) {
					// Close FilterGroup container
					oRm.close("div");
				}
			}
		};

		FilterBarRenderer.renderAdvancedFilterItemsMultiGroups = function (oRm, oFilterBar, aItems, iNumberOfGroups) {
			let sGroupName;

			for (let i = 0; i < aItems.length; i++) {
				const oItem = aItems[i],
					oNextItem = aItems[i + 1],
					sItemGroupName = oItem.group,
					sItemGroupLabel = oItem.groupLabel,
					oFilterGroupItem = oItem.filterItem;

				if (sGroupName !== sItemGroupName) {
					// Render FilterGroup container
					sGroupName = sItemGroupName;
					oRm.openStart("div");
					oRm.class("sapUiCompFilterBarAdvancedGroup");
					oRm.openEnd();
					if (sItemGroupName !== "__$INTERNAL$" && iNumberOfGroups > 1) {
						oRm.openStart("h5");
						oRm.class("sapUiCompFilterBarAdvancedGroupHeader");
						oRm.openEnd();
						oRm.text(sItemGroupLabel);
						oRm.close("h5");
					}
				}

				if (oFilterGroupItem.getVisible() && oFilterGroupItem.getVisibleInFilterBar() && !oFilterGroupItem.getHiddenFilter()) {
					this.renderFilterItem(oRm, oFilterBar, oFilterGroupItem);
				}

				if (!oNextItem || sGroupName !== oNextItem.group) {
					// Close FilterGroup container
					oRm.close("div");
				}
			}
		};

		return FilterBarRenderer;
	}, /* bExport= */ true);
