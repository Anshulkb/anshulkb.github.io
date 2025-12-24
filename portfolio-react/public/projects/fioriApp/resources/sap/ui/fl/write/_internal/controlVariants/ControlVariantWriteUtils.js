/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/controlVariants/VariantManagementState","sap/ui/fl/initial/_internal/Settings","sap/ui/fl/write/_internal/flexState/FlexObjectManager"],function(e,n,t){"use strict";const a={};a.deleteVariant=function(a,r,i){if(!n.getInstanceOrUndef()?.getIsCondensingEnabled()){return[]}const s={reference:a,vmReference:r,vReference:i};const c=e.getVariantManagementChanges(s);const l=e.getControlChangesForVariant({...s,includeReferencedChanges:false});const f=e.getVariant(s).instance;const o=e.getVariantChangesForVariant(s);const g=[f,...c,...o,...l];t.deleteFlexObjects({reference:a,flexObjects:g});return g};return a});
//# sourceMappingURL=ControlVariantWriteUtils.js.map