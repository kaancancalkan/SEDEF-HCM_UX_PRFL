/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
// Helper class for centrally handling oData CRUD and function import services. The interface provides the business
// meanings for the application and can be reused in different places where the UI-specific actions after the call
// could still be different and will be handled in the corresponding controller of the view.
// Every (main) view of this app has an instance of this class as an attribute so that it can forward all explicit
// backend calls to it.
sap.ui.define([
	"sap/ui/base/Object",
	"sap/ui/model/json/JSONModel",
	"com/sedef/hcm/ux/myprofile/controller/ErrorHandler"
], function(Object, JSONModel, ErrorHandler) {
	"use strict";

	return Object.extend("com.sedef.hcm.ux.myprofile.utils.ODataHelper", {
		// Attributes of this class: 
		// _oResourceBundle, _oODataModel, _oApplicationProperties, _oApplicationController
		// are the global objects used throughout this app
		constructor: function(oComponent) {
			this._oResourceBundle = oComponent.getModel("i18n").getResourceBundle();
			this._oODataModel = oComponent.getModel();
			this._oMetaModel = this._oODataModel.getMetaModel();
			this._oApplicationProperties = oComponent.getModel("appProperties");
			this._oApplicationController = this._oApplicationProperties.getProperty("/applicationController");
		},

		// Note: This function must not be called before the metadata have been read successfully
		getObjectPath: function(sEmployeeId, sEntitySet) {
			return this._oODataModel.createKey(sEntitySet, {
				EmployeeNumber: sEmployeeId
			});
		},

		// Additional methods
		getMetaModel: function() {
			return this._oMetaModel;
		},

		read: function(sObjectPath, fnSuccess, aFilters) {
			this._oODataModel.read(sObjectPath, {
				filters: aFilters,
				success: fnSuccess
			});
		}
	});
});