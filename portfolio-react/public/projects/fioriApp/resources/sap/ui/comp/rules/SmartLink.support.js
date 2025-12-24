/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
/**
 * Defines support rules of the SmartLink control of sap.ui.comp library.
 */
sap.ui.define(["sap/base/Log", "sap/ui/support/library"], function(Log, SupportLib) {
	"use strict";

	//**********************************************************
	// Rule Definitions
	//**********************************************************

	/* eslint-disable no-lonely-if */

	const oSmartLinkRule = {
		id: "smartLinkCalculationOfSemanticAttributes",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: true,
		title: "SmartLink: calculation of semantic attributes",
		description: "This check is for information purposes only providing information which might be helpful in case of intent navigation issues",
		resolution: "See explanation for a specific semantic attribute marked with \ud83d\udd34 in the details section",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			var aPromises = [];
			var aNavigationPopoverHandlers = [];
			var aSemanticObjects = [];

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				if (aSemanticObjects.indexOf(oSmartLink.getSemanticObject()) > -1) {
					return;
				}
				aSemanticObjects.push(oSmartLink.getSemanticObject());

				var oNavigationPopoverHandler = oSmartLink.getNavigationPopoverHandler();
				aNavigationPopoverHandlers.push(oNavigationPopoverHandler);
				aPromises.push(oNavigationPopoverHandler._initModel());
			});
			Promise.all(aPromises).then(function(aValues) {
				for (var i = 0; i < aValues.length; i++) {
					var oNavigationPopoverHandler = aNavigationPopoverHandlers[i];
					var sText = oNavigationPopoverHandler._getLogFormattedText();
					if (sText) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.Low,
							details: "Below you can see detailed information regarding semantic attributes which have been calculated for one or more semantic objects defined in a SmartLink control. Semantic attributes are used to create the URL parameters.\nAdditionally you can see all links containing the URL parameters.\n" + sText,
							context: {
								id: oNavigationPopoverHandler.getId()
							}
						});
					}
				}

				Log.setLevel(iLogLevel);
				fnResolve();
			});
		}
	};

	const oDeprecatedPropEvents = {
		id: "smartLinkDeprecatedPropertiesAndEvents",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: false,
		title: "SmartLink: usage of deprecated properties, methods & event handlers",
		description: "This check is for information purposes if deprecated properties, methods or event handlers are used",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				if (oSmartLink.semanticObjectLabel) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Medium,
						details: "semanticObjectLabel - As of version 1.40.0 Title section with semanticObjectLabel has been removed due to new UI design ",
						context: {
							id: oSmartLink.getId()
						}
					});
				}
				if (oSmartLink.hasListeners("navigationTargetsObtained")) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Medium,
						details: "navigationTargetsObtained - As of version 1.126, replaced by navigationTargetsObtainedCallback property",
						context: {
							id: oSmartLink.getId()
						}
					});
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oSemanticObjectController = {
		id: "smartLinkDeprecatedSemanticObjectController",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: false,
		title: "SmartLink: usage of deprecated properties & methods SemanticObjectController",
		description: "This check is for information purposes if deprecated properties & methods of SemanticObjectController are used",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				const oSemanticObjectController = oSmartLink.getSemanticObjectController();
				if (oSemanticObjectController) {
					if (oSemanticObjectController.prefetchNavigationTargets) {

						oIssueManager.addIssue({
							severity: SupportLib.Severity.Medium,
							details: "SemanticObjectController#prefetchNavigationTargets - As of version 1.42.0. The property prefetchNavigationTargets is obsolete as navigation targets are determined automatically. The SmartLink controls are re-rendered as soon as the asynchronous determination of navigation targets has been completed.",
							context: {
								id: oSmartLink.getId()
							}
						});
					}

					if (oSemanticObjectController.hasListeners("navigationTargetsObtained")) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.Medium,
							details: "SemanticObjectController#navigationTargetsObtained - As of version 1.126, replaced by navigationTargetsObtainedCallback property",
							context: {
								id: oSmartLink.getId()
							}
						});
					}

					if (oSemanticObjectController.hasListeners("prefetchDone")) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.Medium,
							details: "SemanticObjectController#prefetchDone - As of version 1.42.0. The event prefetchDone is obsolete because it depends on the property prefetchNavigationTargets which has been deprecated.",
							context: {
								id: oSmartLink.getId()
							}
						});
					}
				}

			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oMixEventsCallbacks = {
		id: "smartLinkMixEventsCallbacks",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.126",
		async: false,
		title: "SmartLink: mixed usage of events & callbacks",
		description: "This check is for information purposes if there is usage of both events & callbacks doing the same.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {

				// if (oSmartLink.mEventRegistry.navigationTargetsObtained && oSmartLink.navigationTargetsObtainedCallback) {
				if (oSmartLink.hasListeners("navigationTargetsObtained") && oSmartLink.navigationTargetsObtainedCallback) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.High,
						details: "SmartLink - both event navigationTargetsObtained & callback navigationTargetsObtainedCallback are used. Be aware that there might be racing conditions and/or inconsistent behaviour.",
						context: {
							id: oSmartLink.getId()
						}
					});
				}


				const oSemanticObjectController = oSmartLink.getSemanticObjectController();
				if (oSemanticObjectController) {
					if (oSemanticObjectController.hasListeners("navigationTargetsObtained") && oSemanticObjectController.navigationTargetsObtainedCallback) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.Medium,
							details: "SemanticObjectController - both event navigationTargetsObtained & callback navigationTargetsObtainedCallback are used. Be aware that there might be racing conditions and/or inconsistent behaviour.",
							context: {
								id: oSmartLink.getId()
							}
						});
					}
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oDeprecatedEventsAfterRefactoring = {
		id: "smartLinkDeprecatedEventsAfterRefactoring",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.126",
		async: false,
		title: "SmartLink: usage of deprecated events",
		description: "This check is for information purposes if there is usage of deprecated events after 1.126.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {

				if (oSmartLink.hasListeners("navigationTargetsObtained") ) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.High,
						details: "SmartLink - navigationTargetsObtained event is deprecated. As of version 1.126, replaced by navigationTargetsObtainedCallback property",
						context: {
							id: oSmartLink.getId()
						}
					});
				}


				const oSemanticObjectController = oSmartLink.getSemanticObjectController();
				if (oSemanticObjectController) {
					if (oSemanticObjectController.hasListeners("navigationTargetsObtained")) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.Medium,
							details: "SemanticObjectController - navigationTargetsObtained event is deprecated. As of version 1.126, replaced by navigationTargetsObtainedCallback property",
							context: {
								id: oSmartLink.getId()
							}
						});
					}
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oNavigationLinks = {
		id: "smartLinkNavigationLinksRetrieved",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: true,
		title: "SmartLink: list of navigation targets",
		description: "This check is for information purposes if there are navigation targets retrieved.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				const oSemanticObjectController = oSmartLink.getSemanticObjectController();
				if (oSemanticObjectController) {
					oSemanticObjectController._getDistinctSemanticObjects().then(function(oSemanticObjects) {
						oSemanticObjectController._getNavigationTargetActions(oSemanticObjects).then(function(aResult) {
							if (aResult && !Object.keys(aResult).length) {
								oIssueManager.addIssue({
									severity: SupportLib.Severity.Medium,
									details: "SmartLink - no navigation targets obtained",
									context: {
										id: oSmartLink.getId()
									}
								});
								fnResolve();
								// reset log level
								Log.setLevel(iLogLevel);
							}
						});
					});
				}
			});


		}
	};

	const oIgnoreLinkRendering = {
		id: "smartLinkIgnoreLinkRendering",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: false,
		title: "SmartLink: ignoreLinkRendering is used",
		description: "This check is for information purposes if there ignoreLinkRendering is used without createControlCallback.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				if (oSmartLink.ignoreLinkRendering && !oSmartLink.hasListeners("createControlCallback")) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Medium,
						details: "SmartLink - ignoreLinkRendering is used without createControlCallback being set.",
						context: {
							id: oSmartLink.getId()
						}
					});
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oForceLinkRendering = {
		id: "smartLinkForceLinkRendering",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: false,
		title: "SmartLink: forceLinkRendering is used",
		description: "This check is for information purposes if there forceLinkRendering is used with contactAnnotationPath.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				if (oSmartLink.forceLinkRendering && oSmartLink.contactAnnotationPath) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Low,
						details: "SmartLink - forceLinkRendering is used even that contactAnnotationPath is available.",
						context: {
							id: oSmartLink.getId()
						}
					});
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};


	const oSemanticAttrObject = {
		id: "smartLinkSemanticAttributesObject",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.56",
		async: false,
		title: "SmartLink: semanticAttributes & semanticObject check",
		description: "This check is for information purposes if there are missing both semanticAttributes & semanticObject.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				if (!oSmartLink._getSemanticAttributes() && !oSmartLink.getSemanticObject()) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.Medium,
						details: "SmartLink - missing both semanticAttributes & semanticObject.",
						context: {
							id: oSmartLink.getId()
						}
					});
				}
			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};

	const oSmartLinkFieldInfoDelegate = {
		id: "smartLinkFieldInfoDelegate",
		audiences: [
			SupportLib.Audiences.Application
		],
		categories: [
			SupportLib.Categories.Usability
		],
		minversion: "1.126",
		async: true,
		title: "SmartLink: fieldInfo & delegate checks",
		description: "This check is for information purposes if there are missing both semanticAttributes & semanticObject.",
		resolution: "See explanation for a specific properties, methods and event handlers.",
		resolutionurls: [
			{
				text: "API Reference: SmartLink",
				href: "https://ui5.sap.com/#/api/sap.ui.comp.navpopover.SmartLink"
			}
		],
		check: function(oIssueManager, oCoreFacade, oScope, fnResolve) {

			var iLogLevel = Log.getLevel();
			Log.setLevel(Log.Level.INFO);

			oScope.getElementsByClassName("sap.ui.comp.navpopover.SmartLink").forEach(function(oSmartLink) {
				const oFieldInfo = oSmartLink.getFieldInfo();
				const oControlDelegate = oFieldInfo?.getControlDelegate();

				if (oFieldInfo && !oControlDelegate) {
					oIssueManager.addIssue({
						severity: SupportLib.Severity.High,
						details: "SmartLink - missing both delegate for SmartLinKFieldInfo",
						context: {
							id: oSmartLink.getId()
						}
					});
				}

				const oBindingContext = oFieldInfo._getControlBindingContext();

				const oAdditionalContentPromise = oFieldInfo.retrieveAdditionalContent();
				const oNavigationTargetsPromise = oControlDelegate.fetchNavigationTargets(oFieldInfo, oBindingContext);

				Promise.all([oNavigationTargetsPromise, oAdditionalContentPromise]).then(function(aPromiseValues) {

					const [oNavigationTargets, aAdditionalContent] = aPromiseValues;
					if (!oNavigationTargets && !aAdditionalContent.length) {
						oIssueManager.addIssue({
							severity: SupportLib.Severity.High,
							details: "SmartLink - missing navigation targets & content",
							context: {
								id: oSmartLink.getId()
							}
						});
					}

					fnResolve();
				});

			});


			// reset log level
			Log.setLevel(iLogLevel);
		}
	};


	return [
		oSmartLinkRule,
		oDeprecatedPropEvents,
		oSemanticObjectController,
		oMixEventsCallbacks,
		oDeprecatedEventsAfterRefactoring,
		oNavigationLinks,
		oIgnoreLinkRendering,
		oForceLinkRendering,
		oSemanticAttrObject,
		oSmartLinkFieldInfoDelegate
	];

}, true);
