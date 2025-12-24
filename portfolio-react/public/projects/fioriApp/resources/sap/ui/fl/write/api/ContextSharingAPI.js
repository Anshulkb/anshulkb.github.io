/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Component","sap/ui/core/ComponentContainer","sap/ui/fl/initial/_internal/ManifestUtils","sap/ui/fl/initial/_internal/Settings","sap/ui/fl/write/api/ContextBasedAdaptationsAPI","sap/ui/fl/Layer","sap/ui/fl/write/_internal/init"],function(e,t,n,a,i,r){"use strict";let o=Promise.resolve();var s={async isContextSharingEnabled(e){if(e.layer!==r.CUSTOMER){return false}const t=n.getFlexReferenceForControl(e.variantManagementControl);const o=await a.getInstance();const s=o.getIsContextSharingEnabled()&&!i.adaptationExists({reference:t,layer:r.CUSTOMER});return s},async createComponent(n){if(await this.isContextSharingEnabled(n)){o=o.then(async n=>{if(n&&!n.isDestroyed()){return n}const a=await e.create({name:"sap.ui.fl.variants.context",id:"contextSharing"});a.showMessageStrip(true);a.setSelectedContexts({role:[]});n=new t("contextSharingContainer",{component:a});await a.getRootControl().oAsyncState.promise;return n});return o}return undefined}};return s});
//# sourceMappingURL=ContextSharingAPI.js.map