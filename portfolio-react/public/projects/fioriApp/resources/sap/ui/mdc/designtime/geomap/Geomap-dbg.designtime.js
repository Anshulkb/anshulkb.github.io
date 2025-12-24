/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
    "sap/ui/mdc/Geomap", "../Util"
], (Geomap, Util) => {
    "use strict";

    const oDesignTime = {
        actions: {
        },
        aggregations: {
        }
    };

    const aAllowedAggregations = ["items"],
        aAllowedProperties = ["header", "zoom"];

    return Util.getDesignTime(Geomap, aAllowedProperties, aAllowedAggregations, oDesignTime);

});