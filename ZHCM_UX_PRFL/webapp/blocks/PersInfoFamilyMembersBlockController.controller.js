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
		SPRTX: "LockIndicatorText",
		ITBLD: "VersionId",
		BEGDA: "ValidFrom",
		ENDDA: "ValidTo",
		FAMSA: "FamilyMemberTypeId",
		STEXT: "FamilyMemberTypeText",
		FANAM: "LastName",
		FGBNA: "NameAtBirth",
		FAVOR: "FirstName",
		FINIT: "Initials",
		FNMZU: "NameAffix",
		KNZNM: "NameFormatIndicatorId",
		KNZNMTEXT: "NameFormatIndicatorText",
		FVRSW: "NamePrefixFirst",
		FVRS2: "NamePrefixSecond",
		FGBDT: "DateOfBirth",
		FGBOT: "CityOfBirth",
		FGBLD: "CountryOfBirthId",
		FGBLD_TEXT: "CountryOfBirthText",
		FANAT: "NationalityId",
		NATTX: "NationalityText",
		FANA2: "SecondNationalityId",
		NA2TX: "SecondNationalityText",
		FANA3: "ThirdNationalityId",
		NA3TX: "ThirdNationalityText",
		FASEX: "GenderId",
		SETXT: "GenderTExt",
		FORMATTED_NAME: "FormattedName"
	};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoFamilyMembersBlockController", {

		reuseHandler: reuseHandler,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oApplicationController = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");
			this.oODataModel = reuseHandler.getOwnerComponent().getModel();
		},

		onNavToFamilyMembersPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYFAMILYMEMBERS.target);
		},

		getVisibility: function(sFieldName, aFieldMetaData, sFieldValue) {
			if (!aFieldMetaData) {
				return true;
			}
			return reuseHandler.getPersInfoFieldVisibility(sFieldName, aFieldMetaData, mFieldMapping, sFieldValue);
		},

		getPersinfoLabel: function(sPropertyName, aFieldMetaData, sFallbackText) {
			return reuseHandler.getPersinfoLabel(sPropertyName, aFieldMetaData, mFieldMapping, sFallbackText);
		}
	});
});