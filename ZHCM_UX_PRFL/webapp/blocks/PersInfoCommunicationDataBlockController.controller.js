/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler"
], function(BaseController, reuseHandler) {
	"use strict";

	var mFieldMapping = {
		UNAME: "ChangedBy",
		SPRTX: "LockIndicatorText",
		ITBLD: "VersionId",
		USRTY: "CommunicationTypeId",
		STEXT: "CommunicationTypeText",
		USRID: "UserId",
		USRID_LONG: "UserIdLong",
		TEL_NUMBER: "TelephoneNumber",
		TEL_EXTENS: "TelephoneExtension",
		LISTFIELD: "Listfield"
	};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoCommunicationDataBlockController", {

		reuseHandler: reuseHandler,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oApplicationController = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");
			this.oODataModel = reuseHandler.getOwnerComponent().getModel();
		},

		onNavToCommunicationDataPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYCOMMUNICATIONDATA.target);
		},

		getVisibility: function(sFieldName, aFieldMetaData, sFieldValue) {
			if (!aFieldMetaData) {
				return true;
			}

			return reuseHandler.getPersInfoFieldVisibility(sFieldName, aFieldMetaData, mFieldMapping, sFieldValue);
		}
	});
});