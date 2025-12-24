/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/DelegateMediator","sap/ui/fl/changeHandler/ChangeAnnotation","sap/ui/fl/initial/_internal/changeHandlers/ChangeHandlerRegistration"],function(e,a,t){"use strict";t.registerPredefinedChangeHandlers();t.getChangeHandlersOfLoadedLibsAndRegisterOnNewLoadedLibs();t.registerAnnotationChangeHandler({changeHandler:a,isDefaultChangeHandler:true});e.registerReadDelegate({modelType:"sap.ui.model.odata.v4.ODataModel",delegate:"sap/ui/fl/write/_internal/delegates/ODataV4ReadDelegate"});e.registerReadDelegate({modelType:"sap.ui.model.odata.v2.ODataModel",delegate:"sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"});e.registerReadDelegate({modelType:"sap.ui.model.odata.ODataModel",delegate:"sap/ui/fl/write/_internal/delegates/ODataV2ReadDelegate"})});
//# sourceMappingURL=init.js.map