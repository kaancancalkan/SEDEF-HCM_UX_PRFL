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
	"sap/ui/model/FilterOperator"
], function(BaseController, formatter, reuseHandler, ErrorHandler, JSONModel, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.TimeRecordingBlockController", {

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
					bTimeRecordingExists: true
				});

			this.setModel(oViewModel, "TimeRecordingView");
			this.oApplicationController = oApplicationController;

			if (oApplicationController.navPropertyExists(mEntities.EMPLOYEEDETAIL, mNavProps.TIMERECORDING)) {
				oView.bindElement(mNavProps.TIMERECORDING);

			} else {
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

		onNavToMyTimesheet: function() {
			this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().TIMESHEET.target);
		},

		_bindView: function(sEmployeeNumber) {
			var oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(sEmployeeNumber),
				oView = this.getView(),
				oViewModel = this.getModel("TimeRecordingView"),
				aFilters = [new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeNumber)],
				fnSuccess = function(oData) {
					if (!oData.results || (oData.results && oData.results.length === 0)) {
						oEmployeeDataModel.setProperty("/bTimeRecordingExists", false);
					} else {
						oEmployeeDataModel.setProperty("/bTimeRecordingExists", true);

						//take the first result item and bind view
						oView.setModel(new JSONModel({
							TimeRecording: oData.results[0]
						}));
						oView.bindElement("/TimeRecording");
					}
					oViewModel.setProperty("/busy", false);
				};

			this.oApplicationController.getODataHelper().read("/TimeRecordingSet", fnSuccess, aFilters);
		}
	});
});