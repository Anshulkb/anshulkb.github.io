/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/compVariants/CompVariantManagementState","sap/ui/fl/apply/_internal/flexState/compVariants/Utils","sap/ui/fl/apply/_internal/flexState/FlexState","sap/ui/fl/initial/_internal/ManifestUtils","sap/ui/fl/Utils","sap/ui/fl/apply/_internal/init"],function(t,a,e,n,i){"use strict";var r={async loadVariants(r){const s=r.control;const l=n.getFlexReferenceForControl(s);const o=a.getPersistencyKey(s);const p=Object.assign({reference:l,persistencyKey:o,componentId:i.getAppComponentForControl(s).getId()},r);await e.initialize({componentId:p.componentId});e.addSVMControl(l,s);t.addExternalVariants(p);const c=t.assembleVariantList(p);const f=t.getDefaultVariantId({persistencyKey:o,reference:l,variants:c});const d=[];let u;c.forEach(t=>{if(t.getStandardVariant()){u=t}else{d.push(t)}if(t.getVariantId()===f){t.setFavorite(true)}});return{defaultVariantId:f,variants:d,standardVariant:u}}};return r});
//# sourceMappingURL=SmartVariantManagementApplyAPI.js.map