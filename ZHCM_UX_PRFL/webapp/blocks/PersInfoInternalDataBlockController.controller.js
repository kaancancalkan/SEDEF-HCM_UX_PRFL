/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler"
], function(BaseController, reuseHandler) {
	"use strict";

	// mapping between Attribute Names and technical filednames in metadata
	var mFieldMapping = {
		AEDTM: "ChangedOn",
		UNAME: "ChangedBy",
		SPRTX: "LockIndiactorText",
		ITBLD: "VersionId",
		PNALT: "PreviousPersonnelNumber",
		WAUSW: "CompanyId",
		PKWRG: "CarRegulation",
		MOLGA: "CountryGrouping",
		PKWWR: "CarValue",
		WAERS: "Currency",
		KFZKZ: "LicensePlateNumber",
		BUKRS: "CompanyCode",
		ANLNR: "AssetNumber",
		MAINNO: "Asset",
		SUBNO: "InternalDataTypeId",
		TEXT: "InternalDataTypeText",
		GEBNR: "BuildingNumber",
		ZIMNR: "RoomNumber",
		TEL01: "InhouseTelephoneNumber1",
		TEL_DUMMY: "TelDummy",
		TEL02: "InhouseTelephoneNumber2"
	};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoInternalDataBlockController", {

		reuseHandler: reuseHandler,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oApplicationController = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");
			this.oODataModel = reuseHandler.getOwnerComponent().getModel();
		},

		onNavToInternalDataPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYINTERNALDATA.target);
		},

		getVisibility: function(sFieldName, aFieldMetaData, sFieldValue) {
			if (!aFieldMetaData) {
				return true;
			}

			return reuseHandler.getPersInfoFieldVisibility(sFieldName, aFieldMetaData, mFieldMapping, sFieldValue);
		}
	});
});