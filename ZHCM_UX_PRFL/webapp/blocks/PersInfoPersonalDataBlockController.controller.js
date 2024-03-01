/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"com/sedef/hcm/ux/myprofile/utils/formatter"
], function(BaseController, reuseHandler, formatter) {
	"use strict";

	// mapping between Attribute Names and technical filednames in metadata
	var mFieldMapping = {
		AEDTM: "ChangedOn",
		UNAME: "ChangedBy",
		SPRTX: "LockIndicatorText",
		ITBLD: "VersionId",
		BEGDA: "ValidFrom",
		ENDDA: "ValidTo",
		ANRED: "FormOfAdressId",
		ANREX: "FormOfAdressText",
		KNZNM: "NameFormatIndicator",
		KNZNMTEXT: "NameFormatIndicatorText",
		NACHN: "LastName",
		NAME2: "NameAtBirth",
		VORNA: "FirstName",
		INITS: "Initials",
		VORSW: "NamePrefix",
		VORS2: "NameAtBirthNamePrefix",
		TITEL: "AcademicTitle",
		TITL2: "SecondTitle",
		NAMZU: "OtherTitle",
		NAMZ2: "NameAtBirthNameAffix",
		RUFNM: "Nickname",
		GBDAT: "DateOfBirth",
		SPRSL: "CommunicationLanguageId",
		SPTXT: "CommunicationLanguageText",
		GBORT: "CityOfBirth",
		FAMST: "MaritalStatusId",
		FATXT: "MaritalStatusText",
		GBLND: "CountryOfBirthId",
		LANDX: "CountryOfBirthText",
		FAMDT: "MaritalStatusBeginDate",
		GBDEP: "StateOfBirthId",
		BEZEI: "StateOfBirthText",
		ANZKD: "NumberOfChildren",
		NATIO: "NationalityId",
		NATTX: "NationalityText",
		KONFE: "ReligiousDenominationId",
		KITXT: "ReligiousDenominationText",
		NATI2: "SecondNationalityId",
		NA2TX: "SecondNationalityText",
		NATI3: "ThirdNationalityId",
		NA3TX: "ThirdNationalityText",
		FORMATTED_NAME: "FormattedName"
	};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoPersonalDataBlockController", {

		formatter: formatter,
		reuseHandler: reuseHandler,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			this.oApplicationController = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");
			this.oODataModel = reuseHandler.getOwnerComponent().getModel();
		},

		onNavToPersonalDataPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYPERSONALDATA.target);
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