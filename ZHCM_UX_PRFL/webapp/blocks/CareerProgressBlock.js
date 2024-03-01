/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/formatter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"com/sedef/hcm/ux/myprofile/controller/ErrorHandler",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/format/DateFormat"
], function(BaseController, formatter, reuseHandler, ErrorHandler, JSONModel, Filter, FilterOperator, DateFormat) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.AbsenceBlockController", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oView = this.getView(),
				oOwnerComponent = reuseHandler.getOwnerComponent(),
				oApplicationModel = oOwnerComponent.getModel("appProperties"),
				sEmployeeNumber = oApplicationModel.getProperty("/employeeId"),
				oApplicationController = oApplicationModel.getProperty("/applicationController"),
				mNavProps = oApplicationController.getAppNavProperties(),
				mEntities = oApplicationController.getAppEntities(),
				oViewModel = new JSONModel({
					busy: false,
					sDateRangeStyle: "long",
					sDateRangeFormat: "yMMMMd" // only relevant as of SAPUI5 1.48
				});

			this.setModel(oViewModel, "AbsenceView");
			this.oApplicationController = oApplicationController;
			this.oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();

			if (oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.ABSENCE)) {
				oView.bindElement(mNavProps.ABSENCE);

			} else {
				// register event handler for the "employeeIdChanged" event
				sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

				oApplicationController.whenMetadataLoaded(function() {
					oViewModel.setProperty("/busy", true);

					this._bindView(sEmployeeNumber);
				}.bind(this));
			}
		},

		onExit: function() {
			sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
		},

		onEmployeeIdChange: function(sChannelId, sEventId, oData) {
			this._bindView(oData.EmployeeId);
		},

		onNavToMyLeave: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().LEAVEREQUEST.target);
		},

		formatAbsenceDateRangeSecondStat: function(sAbsenceType, oStart, oEnd, sText) {
			if (!sAbsenceType) {
				var oConfig = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/oConfigData");
				if (oConfig.AbsenceDuration) {
					var oDateFormat = DateFormat.getDateInstance({
							style: "long"
						}),
						oDate = reuseHandler.calculateDateFromDuration(oConfig.AbsenceDuration, "+");
					return jQuery.sap.formatMessage(sText, [oDateFormat.format(oDate)]);
				}
				return "";
			} else {
				var oViewModel = this.getModel("AbsenceView");
				return formatter.formatDateRange(oStart, oEnd, oViewModel.getProperty("/sDateRangeStyle"), oViewModel.getProperty(
					"/sDateRangeFormat"));
			}
		},

		_bindView: function(sEmployeeNumber) {
			var oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(sEmployeeNumber),
				oView = this.getView(),
				oViewModel = this.getModel("AbsenceView"),
				aFilters = [new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeNumber)],
				fnSuccess = function(oData) {
					if (!oData.results || (oData.results && oData.results.length === 0)) {
						oEmployeeDataModel.setProperty("/bAbsenceExists", false);
					} else {
						oEmployeeDataModel.setProperty("/bAbsenceExists", true);

						//take the first result item and bind view
						oView.setModel(new JSONModel({
							AbsenceData: oData.results[0]
						}));
						oView.bindElement("/AbsenceData");
					}
					oViewModel.setProperty("/busy", false);
				};
				
			this.oApplicationController.getODataHelper().read("/AbsenceSet", fnSuccess, aFilters);
		}
	});
});