/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([],
	function() {
		"use strict";

		var _oOwnerComponent = null;
		var _oView = null;

		return {

			setOwnerComponent: function(oComponent) {
				_oOwnerComponent = oComponent;
			},

			getOwnerComponent: function() {
				return _oOwnerComponent;
			},
			
			setView: function(oView){
				_oView = oView;
			},
			getView: function(){
				return _oView;	
			},

			calculateDateFromDuration: function(oDuration, sCalcSign) {
				var oToday = new Date();
				if (sCalcSign === "+") {
					return new Date(oToday.setFullYear(oToday.getFullYear() + parseInt(oDuration.DurationYears, 10), oToday.getMonth() + parseInt(
						oDuration.DurationMonths, 10), oToday.getDate() + parseInt(oDuration.DurationDays, 10)));
				} else {
					return new Date(oToday.setFullYear(oToday.getFullYear() - parseInt(oDuration.DurationYears, 10), oToday.getMonth() - parseInt(
						oDuration.DurationMonths, 10), oToday.getDate() - parseInt(oDuration.DurationDays, 10)));
				}
			},

			getPersInfoFieldVisibility: function(sPropertyName, aFieldMetaData, oFieldMapping, sFieldValue) {

				if (!sFieldValue) {
					return false;
				}

				var sFieldMetaDataPath = this._getFieldMetaDataPath(aFieldMetaData, sPropertyName, oFieldMapping);
				if (sFieldMetaDataPath) {

					var bIsVisible = sFieldMetaDataPath.hasOwnProperty("IsVisible") ? sFieldMetaDataPath["IsVisible"] : _oOwnerComponent.getModel().getProperty(
						"/" + sFieldMetaDataPath).IsVisible;

					return bIsVisible;
				}
				// fields without metadata info are not visible (e.g. field not in country-specific UI-structure)
				return false;
			},

			getStreetHouseNoLabel: function(sPlaceholderText, sStreetLabel, sHouseNoLabel, sCountryVersionId) {
				switch (sCountryVersionId) {
					case "07": //Canada
					case "08": //Great-Britain
					case "10": //USA
					case "14": //Malaysia
					case "34": //Indonesia
					case "43": //New Zealand
					case "UN": //United Nations (NPO)
						return jQuery.sap.formatMessage(sPlaceholderText, [sHouseNoLabel, sStreetLabel]);
					default:
						return jQuery.sap.formatMessage(sStreetLabel);
				}
			},

			getPostalCodeCityLabel: function(sPlaceholderText, sEntityTypeName, sPostalCodePropertyName, sCityPropertyName, aFieldMetaData,
				oFieldMapping) {
				var sPostalCodeLabel, sCityLabel,
					oODataModel = _oOwnerComponent.getModel(),
					sFieldMetaDataPostalCodePath = this._getFieldMetaDataPath(aFieldMetaData, sPostalCodePropertyName, oFieldMapping),
					sFieldMetaDataCityPath = this._getFieldMetaDataPath(aFieldMetaData, sCityPropertyName, oFieldMapping);

				// determine correct country-specific labels (either from corresponding FieldMetadata entity or from service metadata document)
				if (sFieldMetaDataPostalCodePath) { //Postal Code
					sPostalCodeLabel = this._getBackendLabelFromModel(sFieldMetaDataPostalCodePath);
				}
				if (!sPostalCodeLabel) {
					sPostalCodeLabel = oODataModel.getMetaModel().getODataProperty(oODataModel.getMetaModel().getODataEntityType(_oOwnerComponent.getModel(
						"appProperties").getProperty("/schemaNamespace") + "." + sEntityTypeName), sPostalCodePropertyName)["sap:label"];
				}

				if (sFieldMetaDataCityPath) { //City
					sCityLabel = this._getBackendLabelFromModel(sFieldMetaDataCityPath);
				}
				if (!sCityLabel) {
					sCityLabel = oODataModel.getMetaModel().getODataProperty(oODataModel.getMetaModel().getODataEntityType(_oOwnerComponent.getModel(
						"appProperties").getProperty("/schemaNamespace") + "." + sEntityTypeName), sCityPropertyName)["sap:label"];
				}

				return jQuery.sap.formatMessage(sPlaceholderText, [sPostalCodeLabel, sCityLabel]);
			},

			getPersinfoLabel: function(sPropertyName, aFieldMetaData, oFieldMapping, sFallback) {
				var sFieldMetaDataPath = this._getFieldMetaDataPath(aFieldMetaData, sPropertyName, oFieldMapping);
				if (sFieldMetaDataPath) {
					var sLabel = this._getBackendLabelFromModel(sFieldMetaDataPath);
					if (sLabel) {
						return sLabel;
					}
				}
				return sFallback;
			},

			_getFieldMetaDataPath: function(aFieldMetaData, sPropertyName, oFieldMapping) {
				var sAttrName,
					oODataModel = _oOwnerComponent.getModel(),
					aResult = aFieldMetaData.filter(function(oSingleFieldMetaData) {
						if (oSingleFieldMetaData.hasOwnProperty("FieldName")) {
							sAttrName = oFieldMapping[oSingleFieldMetaData.FieldName];
						} else {
							sAttrName = oFieldMapping[oODataModel.getProperty("/" + oSingleFieldMetaData).FieldName];
						}
						return sAttrName === sPropertyName;
					});
				return aResult[0];
			},

			_getBackendLabelFromModel: function(sFieldMetaDataPath) {
				var sLabel = sFieldMetaDataPath.hasOwnProperty("BackendLabel") ? sFieldMetaDataPath["BackendLabel"] : _oOwnerComponent.getModel().getProperty(
					"/" + sFieldMetaDataPath).BackendLabel;
				return sLabel;
			}
		};
	});