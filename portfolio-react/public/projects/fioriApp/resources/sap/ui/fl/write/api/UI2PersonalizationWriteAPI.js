/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/initial/_internal/ManifestUtils","sap/ui/fl/write/_internal/flexState/UI2Personalization/UI2PersonalizationState","sap/base/util/restricted/_omit","sap/ui/fl/write/_internal/init"],function(e,t,r){"use strict";var n={async create(n){n.reference=e.getFlexReferenceForSelector(n.selector);if(!n.reference||!n.containerKey||!n.itemName||!n.content||!n.category||!n.containerCategory){throw new Error("not all mandatory properties were provided for the storage of the personalization")}await t.setPersonalization(r(n,["selector"]))},async deletePersonalization(r){r.reference=e.getFlexReferenceForSelector(r.selector);if(!r.reference||!r.containerKey||!r.itemName){throw new Error("not all mandatory properties were provided for the deletion of the personalization")}await t.deletePersonalization(r.reference,r.containerKey,r.itemName)}};return n});
//# sourceMappingURL=UI2PersonalizationWriteAPI.js.map