/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/Lib","sap/ui/fl/initial/_internal/Loader","sap/ui/fl/initial/_internal/Settings","sap/ui/fl/Layer"],function(e,t,i,n){"use strict";return(r,a,s)=>{const u=r||"";const l=i.getInstanceOrUndef();const c=t.getCachedFlexData(s).authors||{};if(a===n.USER||u===l?.getUserId()){return e.getResourceBundleFor("sap.ui.fl").getText("VARIANT_SELF_OWNER_NAME")}if(![n.PUBLIC,n.CUSTOMER].includes(a)){return u}return c?.[u]||u}});
//# sourceMappingURL=getVariantAuthor.js.map