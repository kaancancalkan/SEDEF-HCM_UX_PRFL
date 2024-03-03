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
			BNKSA: "BankDetailsTypeId",
			BNKSA_TEXT: "BankDetailsTypeText",
			EMFTX: "PayeeName",
			STRAS: "PayeeStreet",
			BKPLZ: "PayeePostalCode",
			BKORT: "PayeeCity",
			STATE: "PayeeStateId",
			BEZEI: "PayeeStateText",
			ADRS_BANKS: "PayeeCountryId",
			ADRS_LANDX: "PayeeCountryText",
			BANKS: "BankCountryId",
			LANDX: "BankCountryText",
			BANKL: "BankId",
			BANKA: "BankText",
			BANKN: "BankAccountNumber",
			BKONT: "BankControlKey",
			BKREF: "BankReferenceDetails",
			ZLSCH: "PaymentMethodId",
			TEXT1: "PaymentMethodText",
			ZWECK: "BankTransferPurpose",
			WAERS: "PaymentCurrency",
			LTEXT: "PaymentCurrencyText",
			BTTYP: "PBSTransferTypeId",
			BTEXT: "PBSTransferTypeText",
			BETRG: "TransferValue",
			WAERS01: "CurrencyId",
			ANZHL: "PercentageAmount",
			PRCNT: "TransferPercentage",
			OCRSN: "ReasonForOffCyclePayrollId",
			OCRTX: "ReasonForOffCyclePayrollText",
			PAYTY: "PayrollType",
			PAYID: "PayidPayrollIdentifier",
			BONDT: "OffCyclePayrollPaymentDate",
			IBAN01: "IbanPart1",
			IBAN02: "IbanPart2",
			IBAN03: "IbanPart3",
			IBAN04: "IbanPart4",
			IBAN05: "IbanPart5",
			IBAN06: "IbanPart6",
			IBAN07: "IbanPart7",
			IBAN08: "IbanPart8",
			IBAN09: "IbanPart9",
			IBAN_VALFR: "IbanValidityBeginDate",
			SWIFT: "SwiftCode",
			IBAN00: "Iban"
		};

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoBankBlockController", {

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

		onNavToBankDetailsPress: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYBANKDETAILS.target);
		},

		getVisibility: function(sFieldName, aFieldMetaData, sFieldValue) {
			if (!aFieldMetaData) {
				return true;
			}
			return reuseHandler.getPersInfoFieldVisibility(sFieldName, aFieldMetaData, mFieldMapping, sFieldValue);
		},

		formatPostalCodeCityLabel: function(sPlaceholderText, sPostalCodePropertyName, sCityPropertyName, aFieldMetaData) {
			return reuseHandler.getPostalCodeCityLabel(sPlaceholderText, this.oApplicationController.getAppEntities().BANKDETAIL, sPostalCodePropertyName, sCityPropertyName,
				aFieldMetaData, mFieldMapping);
		},
		
		getPersinfoLabel: function(sPropertyName, aFieldMetaData, sFallbackText) {
			return reuseHandler.getPersinfoLabel(sPropertyName, aFieldMetaData, mFieldMapping, sFallbackText);
		}
	});
});