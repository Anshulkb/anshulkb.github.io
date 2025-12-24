/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/UI2Personalization/UI2PersonalizationState","sap/ui/fl/apply/_internal/flexState/FlexState","sap/ui/fl/initial/_internal/ManifestUtils","sap/ui/fl/apply/_internal/init"],function(e,t,n){"use strict";var a={async load(a){a.reference=n.getFlexReferenceForSelector(a.selector);if(!a.reference||!a.containerKey){throw new Error("not all mandatory properties were provided for the loading of the personalization")}await t.initialize({componentId:a.selector.getId()});return e.getPersonalization(a.reference,a.containerKey,a.itemName)}};return a});
//# sourceMappingURL=UI2PersonalizationApplyAPI.js.map