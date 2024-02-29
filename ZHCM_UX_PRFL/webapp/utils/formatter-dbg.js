/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/core/LocaleData",
	"sap/ui/core/ValueState",
	"sap/viz/ui5/format/ChartFormatter",
	"sap/viz/ui5/api/env/Format"
], function (DateFormat, NumberFormat, LocaleData, ValueState, ChartFormatter, Format) {
	"use strict";
	/*global document*/

	return {

		FIORI_LABEL_PERCENTAGEFORMAT: "__Fiori_MyProfile_Percent",

		/**
		 * extracts the service path from the given absolute URL
		 * @public
		 * @param {string} sMediaSrc absolute URL
		 * @returns {string} service path
		 */
		formatImageURL: function (sMediaSrc) {
			var sUrl = "";
			if (sMediaSrc && typeof sMediaSrc === "string") {
				var oLink = document.createElement("a");
				oLink.href = sMediaSrc;
				sUrl = (oLink.pathname.charAt(0) === "/") ? oLink.pathname : "/" + oLink.pathname;
			}
			return sUrl;
		},

		formatObjectTextWithBrackets: function (sText, sTextInBrackets) {
			if (sTextInBrackets) {
				return sText + " (" + sTextInBrackets + ")";
			}
			return sText;
		},

		formatObjectTitle: function (sName, sEmployeeID) {
			if (sap.ui.Device.system.desktop && sEmployeeID) {
				return sName + " (" + sEmployeeID + ")";
			}
			return sName;
		},

		formatMultipleSkillsTableTitle: function (sTitle) {
			// var sEvYear = new Date().getFullYear();
			// if (sap.ui.Device.system.desktop && sEvYear ) {
			// 	return sTitle + " (" + sEvYear + ")";
			// }
			return sTitle;
		},

		formatManagerLink: function (sManagerID) {
			var oApplicationModel = this.getModel("appProperties");
			if (sManagerID && oApplicationModel.getProperty("/isEmployeeLookupAvailable")) {
				var oCrossAppNavigator = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService("CrossApplicationNavigation");
				return oCrossAppNavigator.hrefForExternal({
					target: {
						semanticObject: "Employee",
						action: "lookup"
					},
					params: {
						"EmployeeNumber": [sManagerID]
					}
				});
			}

			return null;
		},

		formatDateRange: function (oStart, oEnd, sStyle, sFormat, oConfig) {
			if (!oStart || !oEnd) {
				return "";
			}

			var bUseDateFormatInterval = (new sap.ui.core.Configuration()).getVersion().compareTo(1, 48) < 0 ? false : true,
				sDateRange = "";

			if (bUseDateFormatInterval) {
				var dateFormatInterval = DateFormat.getDateInstance({
					format: sFormat,
					interval: true,
					UTC: true
				});
				sDateRange = dateFormatInterval.format([oStart, oEnd]);
			} else {
				var sFormatLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
					sDateRangePattern = LocaleData.getInstance(sFormatLocale).getIntervalPattern("d - d"),
					dateFormat = DateFormat.getDateInstance({
						style: sStyle,
						UTC: true
					}),
					sFormattedStart = dateFormat.format(oStart),
					sFormattedEnd = dateFormat.format(oEnd);

				if (sFormattedStart === sFormattedEnd) {
					sDateRange = sFormattedStart;
				} else {
					sDateRangePattern = sDateRangePattern.replace("{0}", sFormattedStart);
					sDateRangePattern = sDateRangePattern.replace("{1}", sFormattedEnd);
					sDateRange = sDateRangePattern;
				}
			}
			return sDateRange;
		},

		formatPeriod: function (oBegin, oEnd) {
			var sFormatLocale = sap.ui.getCore().getConfiguration().getFormatSettings().getFormatLocale(),
				sDateRange = LocaleData.getInstance(sFormatLocale).getIntervalPattern("d - d"),
				oDateFormat = DateFormat.getDateInstance({
					pattern: "MMMM",
					UTC: true
				}),
				sBeginMonth = oDateFormat.format(oBegin),
				sEndMonth = oDateFormat.format(oEnd),
				beginYear = oBegin.getUTCFullYear(),
				endYear = oEnd.getUTCFullYear();

			if (beginYear === endYear) { // period within in 1 calendar year
				if (oBegin.getUTCMonth() === 0 && oBegin.getUTCDate() === 1 && //period from 1st Jan
					oEnd.getUTCMonth() === 11 && oEnd.getUTCDate() === 31) { //to 31st Dec
					return beginYear;

				} else { //period not covering the full year e.g. "January - June 2017"
					sDateRange = sDateRange.replace("{0}", sBeginMonth);
					sDateRange = sDateRange.replace("{1}", sEndMonth);
					return sDateRange + " " + beginYear;
				}
			} else { // period covering more than 1 full year
				var sBeginPart = sBeginMonth + " " + beginYear,
					sEndPart = sEndMonth + " " + endYear;
				sDateRange = sDateRange.replace("{0}", sBeginPart);
				sDateRange = sDateRange.replace("{1}", sEndPart);
				return sDateRange;
			}

		},

		formatOfficeLocation: function (building, room) {
			if (building && room) {
				return building + ", " + room;
			} else if (building && !room) {
				return building;
			} else if (!building && room) {
				return room;
			} else {
				return null;
			}
		},

		formatVizFeedItemValues: function (a, b) {
			if (a && b) {
				return [a + "," + b];
			} else if (a) {
				return [a];
			}
			return null;
		},

		formatListItemState: function (sState) {
			switch (sState) {
			case "POSTED":
			case "APPROVED":
				return ValueState.Success;
			case "SENT":
				return ValueState.Warning;
			case "REJECTED":
				return ValueState.Error;
			default: //fallback (should not happen)
				return ValueState.None;
			}
		},

		formatTimeRecStatusText: function (iIncompleteDays, sIncomplete, sComplete) {
			var sText = "";
			if (!(typeof iIncompleteDays === "number")) {
				return sText;
			}
			sText = parseInt(iIncompleteDays, 10) > 0 ? sIncomplete : sComplete;
			return sText;
		},

		formatObjectNumber: function (fRawValue) {
			if (fRawValue && parseFloat(fRawValue) !== 0) {
				//either format fRawValue with or without decimals:
				//'3.67' formatted as FLOAT, '3.00' formatted as INTEGER
				var oNumberFormat = (parseFloat(fRawValue) % 1 !== 0) ? NumberFormat.getFloatInstance() : NumberFormat.getIntegerInstance();
				return oNumberFormat.format(fRawValue);
			}
			return null;
		},

		formatObjectNumberUnitDays: function (fRawValue, sDaysPlural, sDaySingular) {
			if (fRawValue) {
				return (parseFloat(fRawValue) === 1) ? sDaySingular : sDaysPlural;
			}
			return null;
		},

		registerCustomVizFormat: function () {
			var chartFormatter = ChartFormatter.getInstance();
			chartFormatter.registerCustomFormatter(this.FIORI_LABEL_PERCENTAGEFORMAT, function (value) {
				var percentFormat = NumberFormat.getPercentInstance({
					style: "standard",
					minFractionDigits: 0,
					maxFractionDigits: 2
				});
				return percentFormat.format(value / 100);
			});
			Format.numericFormatter(chartFormatter);
		},

		formatIBAN: function (ibanPart1, ibanPart2, ibanPart3, ibanPart4, ibanPart5, ibanPart6, ibanPart7, ibanPart8, ibanPart9) {
			return [ibanPart1, ibanPart2, ibanPart3, ibanPart4, ibanPart5, ibanPart6, ibanPart7, ibanPart8, ibanPart9].join(" ");
		},

		formatMaritalStatus: function (sMaritalStatusI18n, sMaritalStatusText, oMaritalStatusBeginDate) {
			if (!oMaritalStatusBeginDate) {
				return sMaritalStatusText;
			}

			var sText = sMaritalStatusI18n.replace("{0}", sMaritalStatusText);
			sText = sText.replace("{1}", oMaritalStatusBeginDate);

			return sText;
		},

		formatPersInfoSubSectionTitle: function (sODATATitle, sLocalTitle) {
			return sODATATitle ? sODATATitle : sLocalTitle;
		},

		crossAppResolver: function (sManagerId) {
			var oViewModel = this.getModel("appProperties");
			if (sManagerId && oViewModel.getProperty("/isEmployeeLookupAvailable")) {
				var oNavConfig = {
					target: {
						semanticObject: "ZHCMUXSEM004",
						action: "lookup"
					},
					params: {
						"EmployeeNumber": sManagerId
					}
				};
				return function () {
					return oNavConfig;
				};
			}
			return null;
		},

		formatDate: function (sDateString) {

			var oDateFormat = DateFormat.getDateInstance({
				pattern: "dd.MM.yyyy",
				UTC: true
			});

			return oDateFormat.format(sDateString);
		}
	};
});