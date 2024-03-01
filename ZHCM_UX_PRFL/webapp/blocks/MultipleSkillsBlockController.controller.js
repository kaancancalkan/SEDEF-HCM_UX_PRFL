/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"com/sedef/hcm/ux/myprofile/utils/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator", "sap/ui/core/format/NumberFormat",
    'sap/m/Button',
		'sap/m/Dialog',
		'sap/m/List',
		'sap/m/StandardListItem',
		'sap/m/ButtonType',
        'sap/m/Popover'
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, NumberFormat, Button, Dialog, List, StandardListItem, ButtonType, Popover) {
	"use strict";
	return BaseController.extend("com.sedef.hcm.ux.myprofile.blocks.MultipleSkillsBlockController", {
		formatter: formatter,
		onInit: function () {
			var oViewModel = new JSONModel();
			this.setModel(oViewModel, "multipleSkillModel");
			this._initiateModel();
		},
		onAfterRendering: function () {
			var sYear = new Date().getFullYear();
			sYear = '' + sYear;
		},
		_initiateModel: function () {
			var oViewModel = this.getModel("multipleSkillModel");

			oViewModel.setData({
				busy: false,
				selectedYear: new Date().getFullYear(),
				yearList: (function () {
					var sToday = new Date().getFullYear();
					var aDates = [];
					while (sToday > 2021) {
						var oDate = {
							"Year": sToday
						};
						aDates.push(oDate);
						sToday--;
					}
					return aDates;
				})(),
				evaluationList: [{
					Key: "0",
					Text: "Bilgi/Tecrübe/Uzmanlık Sahibi Değil",
					Icon: "sap-icon://customfont/circle_0"
				}, {
					Key: "1",
					Text: "Bilir,Uygulamaz",
					Icon: "sap-icon://customfont/circle_90"
				}, {
					Key: "2",
					Text: "Bilir ve Gözetim Altında Uygulayabilir",
					Icon: "sap-icon://customfont/circle_180"
				}, {
					Key: "3",
					Text: "Bilir ve Uygulayabilir",
					Icon: "sap-icon://customfont/circle_270"
				}, {
					Key: "4",
					Text: "Bilir,Uygulayabilir ve Eğitebilir",
					Icon: "sap-icon://customfont/circle_360"
				}]
			});
		},
		onDataRequested: function (oEvent) {},
		onDataReceived: function (oEvent) {},
		_isFiltered: false,
		onChange: function () {
			var aFilter = [];
			// var sSearch = new Date().getFullYear();
			var oViewModel = this.getModel("multipleSkillModel");
			var sSearch = oViewModel.getProperty("/selectedYear");
			sSearch = '' + sSearch;

			if (!this._isFiltered) {
				this._isFiltered = true;
				var oBinding = this.byId("skillsContainer").getBinding("items");
				aFilter.push(new Filter("Evprd", FilterOperator.EQ, sSearch));
				oBinding.filter(aFilter);
				return;
			}

			var oViewModel = this.getModel("multipleSkillModel");
			var aAllItems = this.byId("skillsContainer").getBinding("items").aAllKeys;

			var oAllItems = _.filter(aAllItems, function (sItem) {
				return sItem.indexOf(sSearch) > -1;
			});

			var sumAvlbl = 0,
				sumTrget = 0,
				sumRealz = 0;
			for (var i = 0, len = oAllItems.length; i < len; i++) {
				this.getModel().getProperty(oAllItems[i]);
				var oItems = this.getModel().getProperty('/' + oAllItems[i]);
				if (oItems) {
					sumAvlbl = parseInt(sumAvlbl, 10) + parseInt(oItems.Avlbl, 10);
					sumRealz = parseInt(sumRealz, 10) + parseInt(oItems.Realz, 10);
					sumTrget = parseInt(sumTrget, 10) + parseInt(oItems.Trget, 10);
				}
			}
			var avrAvlbl = sumAvlbl / oAllItems.length;
			if (isNaN(avrAvlbl)) {
				avrAvlbl = 0;
			}
			oViewModel.setProperty("/avgAvlbl", avrAvlbl);
			var avrRealz = sumRealz / oAllItems.length;
			if (isNaN(avrRealz)) {
				avrRealz = 0;
			}
			oViewModel.setProperty("/avgRealz", avrRealz);
			var avrTrget = sumTrget / oAllItems.length;
			if (isNaN(avrTrget)) {
				avrTrget = 0;
			}
			oViewModel.setProperty("/avgTrget", avrTrget);
		},

		onYearChanged: function (oEvent) {
			var oViewModel = this.getModel("multipleSkillModel");
			var sYear = oViewModel.getProperty("/selectedYear");
			var aFilter = []
			aFilter.push(new Filter("Evprd", FilterOperator.EQ, sYear));
			this.byId("skillsContainer").getBinding("items").filter(aFilter);
			this.onChange(oEvent);
		},
        handlePopoverPress: function (oEvent){
            var oViewModel = this.getModel("multipleSkillModel");
            var oButton = oEvent.getSource();
            var that = this
            var sText = that.getModel().getProperty(oEvent.getSource().getParent().getBindingContext().getPath()).Dpexp

            // var multipleSkillModel = this.getView().getModel("multipleSkillModel")
             if (!this.pressDialog) {
                
				this.pressDialog = new Popover({
					title: '{i18n>Dpexp}',
					placement: 'Left',
                    width: '25%',
                    id : 'oDialog',
                    content: new sap.m.Label({
                     textAlign:'Center',
                     wrapping:true,
                     text: sText
					}).addStyleClass("sapUiMediumMargin") 
				
				});

				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
            //    this.pressDialog.setContentWidth("700px")
			}else{
            this.pressDialog.getAggregation("content")[0].setProperty("text", sText)
            }

			this.pressDialog.openBy(oButton);
            
           // this.pressDialog.fireAfterClose(this._destroyPopover())
        },
        _destroyPopover:function(){
         this.pressDialog.destroy(true)   
        }
        	});
});