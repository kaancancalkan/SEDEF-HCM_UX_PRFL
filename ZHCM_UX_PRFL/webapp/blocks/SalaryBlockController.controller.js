/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"com/sedef/hcm/ux/myprofile/controller/BaseController",
	"com/sedef/hcm/ux/myprofile/utils/formatter",
	"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format",
	"sap/ui/model/json/JSONModel",
	"sap/viz/ui5/controls/common/feeds/FeedItem",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(BaseController, formatter, reuseHandler, ChartFormatter, Format, JSONModel, FeedItem, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.SalaryBlockController", {

		formatter: formatter,

		/**
		 * Called when the controller is instantiated.
		 * @public
		 */
		onInit: function() {
			var oApplicationModel = reuseHandler.getOwnerComponent().getModel("appProperties"),
				oViewModel = new JSONModel({
					busy: false
				});
			this.setModel(oViewModel, "SalaryView");
			this.oResourceBundle = reuseHandler.getOwnerComponent().getModel("i18n").getResourceBundle();
			this.oApplicationController = oApplicationModel.getProperty("/applicationController");
			this.sEmployeeNumber = oApplicationModel.getProperty("/employeeId");
			
			// register event handler for the "employeeIdChanged" event
			sap.ui.getCore().getEventBus().subscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);

			this._bindDataset(this.sEmployeeNumber);
		},

		onExit: function() {
			sap.ui.getCore().getEventBus().unsubscribe("com.sedef.hcm.ux.myprofile", "employeeIdChanged", this.onEmployeeIdChange, this);
		},

		onEmployeeIdChange: function(sChannelId, sEventId, oData) {
			this._bindDataset(oData.EmployeeId);
		},

		onDataRequested: function() {
			var oViewModel = this.getModel("SalaryView");

			this.oApplicationController.whenMetadataLoaded(function() {
				oViewModel.setProperty("/busy", true);
			});
		},

		onDataReceived: function(oData) {
			var data = oData.getParameter("data"),
				oEmployeeDataModel = this.oApplicationController.getEmployeeDataModelForEmployeeId(this.sEmployeeNumber),
				oVizFrame = this.byId("salaryVizFrame"),
				oViewModel = this.getModel("SalaryView"),
				oVizPopOver = this.getView().byId("idPopOver");

			if (!data.results || (data.results && data.results.length === 0)) {
				oEmployeeDataModel.setProperty("/bSalaryExists", false);

			} else {
				var sCurrency = data.results[0].Currency,
					iEndYear = Math.max.apply(Math, data.results.map(function(item) {
						return parseInt(item.PayYear, 10);
					})),
					iStartYear = iEndYear - 1;
				
				Format.numericFormatter(ChartFormatter.getInstance());
				
				oVizFrame.removeAllFeeds();
				oVizFrame.setVizProperties({
					plotArea: {
						dataLabel: {
							showTotal: false,
							visible: true,
							hideWhenOverlap: false,
							formatString: ChartFormatter.DefaultPattern.STANDARDFLOAT
						},
						// the following 2 rules are to display legend / data items in users language
						dataPointStyle: {
							rules: [{
								dataContext: {
									GrossSalary: "*"
								},
								properties: {
									color: "sapUiChartPaletteQualitativeHue2"
								},
								displayName: this.oResourceBundle.getText("grossSalaryMeasure"),
								dataName: {
									GrossSalary: this.oResourceBundle.getText("grossSalaryMeasure")
								}
							}
							, {
								dataContext: {
									NetSalary: "*"
								},
								properties: {
									color: "sapUiChartPaletteQualitativeHue1"
								},
								displayName: this.oResourceBundle.getText("netSalaryMeasure"),
								dataName: {
									NetSalary: this.oResourceBundle.getText("netSalaryMeasure")
								}
							}
							]
						},
						// this part is for small screen sizes (only the last 2 years are displayed + scrollbar)
						window: {
							start: {
								categoryAxis: {
									"Year": iStartYear
								}
							},
							end: {
								categoryAxis: {
									"Year": iEndYear
								}
							}
						}
					},
					valueAxis: {
						visible: true,
						label: {
							formatString: ChartFormatter.DefaultPattern.STANDARDFLOAT
						},
						title: {
							visible: false
						}
					},
					categoryAxis: {
						visible: true,
						title: {
							text: this.oResourceBundle.getText("yearDimension"),
							visible: true
						}
					},
					title: {
						text: this.oResourceBundle.getText("compensationTitle") + " " + "(" + sCurrency + ")",
						visible: true
					},
					interaction: {
						selectability: {
							mode: "exclusive",
							legendSelection: false,
							axisLabelSelection: false,
							plotLassoSelection: false,
							plotStdSelection: true
						}
					}
				});

				var feedValueAxis = new FeedItem({
						"uid": "valueAxis",
						"type": "Measure",
						"values": ["GrossSalary", "NetSalary"]
						//"values": ["Salary"]
					}),
					feedCategoryAxis = new FeedItem({
						"uid": "categoryAxis",
						"type": "Dimension",
						"values": ["Year"]
					});
				oVizFrame.addFeed(feedValueAxis);
				oVizFrame.addFeed(feedCategoryAxis);

				oVizPopOver.setFormatString(ChartFormatter.DefaultPattern.STANDARDFLOAT);
				oVizPopOver.connect(oVizFrame.getVizUid());

				oEmployeeDataModel.setProperty("/bSalaryExists", true);
			}

			oViewModel.setProperty("/busy", false);
		},

		formatNoSalaryText: function(sText) {
			var oConfig = reuseHandler.getOwnerComponent().getModel("appProperties").getProperty("/oConfigData");
			if (oConfig.SalaryDuration) {
				return jQuery.sap.formatMessage(sText, [oConfig.SalaryDuration.DurationYears]);
			}
			return this.oResourceBundle.getText("noSalaryTxt");
		},

		_bindDataset: function(sEmployeeId) {
			this.byId("dataset").bindData({
				path: "/CompensationSet",
				filters: new Filter("EmployeeNumber", FilterOperator.EQ, sEmployeeId),
				events: {
					dataRequested: this.onDataRequested.bind(this),
					dataReceived: this.onDataReceived.bind(this)
				}
			});
		}
	});
});