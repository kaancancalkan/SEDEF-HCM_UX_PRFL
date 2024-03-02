/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
	[
		"com/sedef/hcm/ux/myprofile/controller/BaseController",
		"com/sedef/hcm/ux/myprofile/controller/ErrorHandler",
		"sap/ui/model/json/JSONModel",
		"sap/m/GroupHeaderListItem",
		"hcm/fab/lib/common/util/CommonModelManager",
		"com/sedef/hcm/ux/myprofile/utils/formatter",
		"com/sedef/hcm/ux/myprofile/utils/reuseHandler",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator"
	],
	function (
		BaseController,
		ErrorHandler,
		JSONModel,
		GroupHeaderListItem,
		CommonModelManager,
		formatter,
		reuseHandler,
		Filter,
		FilterOperator
	) {
		"use strict";

		return BaseController.extend(
			"com.sedef.hcm.ux.myprofile.controller.ProfileOverview", {
				formatter: formatter,
				reuseHandler: reuseHandler,
				extHookAdjustObjectPageHeader: null,

				/* =========================================================== */
				/* lifecycle methods                                           */
				/* =========================================================== */

				/**
				 * Called when the worklist controller is instantiated.
				 * @public
				 */
				onInit: function () {
					var oObjectPageHeader = this.getView().byId("pageHeader"),
						//as of SAPUI5-version 1.48.* sap.m.ObjectAttribute only renders the text property as link
						currentUI5Version = new sap.ui.core.Configuration().getVersion(),
						oViewModel = new JSONModel({
							showOnlyObjAttrRepTo: currentUI5Version.compareTo(1, 48) < 0 ? false : true,
						}),
						oConfigModel = new JSONModel({
							showTimeSection: false,
							showSkillsProgress: false,
							showTalentSection: false,
							showQualifications: false,
							showTrainings: false,
							showPerformanceRatings: false,
							showCareerProgress: false,
							showCompensationSection: false,
							showPaystubs: false,
							showSalary: false,
							showPersInfoSection: false,
							showEmployeeSkills: true,
							showPersonalData: false,
							showAddressData: false,
							showBankData: false,
							showFamilyMembersData: false,
							showCommunicationData: false,
							showEducationData: false,
							showWorkExperienceData: true,
							showForeignLanguageData: true,
							showCourseData: true,
							showCertificateData: true,
							showInternalData: false,
							sPersonalDataSubSectionTitle: null,
							sAddressSubSectionTitle: null,
							sBankDetailsSubSectionTitle: null,
							sFamilyMembersSubSectionTitle: null,
							sCommunicationDataSubSectionTitle: null,
							sInternalDataSubSectionTitle: null,
							sEducationSubSectionTitle: null,
							otherEmployeeProfiles: false,
							bAuthEditAddress: false,
							bAuthEditWorkExperince: false,
							bAuthEditForeignLanguage: false,
							bAuthEditCourse: false,
							bAuthEditCertificate: false,
						});

					this.oOwnerComponent = this.getOwnerComponent();

					this.setModel(oViewModel, "ProfileView");
					this.oViewModel = oViewModel;

					this.setModel(oConfigModel, "ConfigView");
					this.oConfigModel = oConfigModel;

					this.oApplicationModel =
						this.oOwnerComponent.getModel("appProperties");
					this.oApplicationController = this.oApplicationModel.getProperty(
						"/applicationController"
					);
					this.oMetaModel = this.oApplicationController
						.getODataHelper()
						.getMetaModel();

					this._oManagerQuickView = null;
					this._oOfficeInfoQuickView = null;

					this.oObjectPageLayout = this.byId("profileOverviewLayout");

					this.getRouter()
						.getRoute("profileOverview")
						.attachPatternMatched(this._onObjectMatched, this);

					/**
					 * @ControllerHook	Allows you to adjust the ProfileOverview ObjectPageHeader
					 *					The hook gets called at the end of the onInit lifecycle method
					 * @callback com.sedef.hcm.ux.myprofile.controller.ProfileOverview~extHookAdjustObjectPageHeader
					 * @param {sap.uxap.ObjectPageHeader}
					 *		   oObjectPageHeader
					 * @return {void}
					 */
					if (this.extHookAdjustObjectPageHeader) {
						this.extHookAdjustObjectPageHeader(oObjectPageHeader);
					}
				},

				/* =========================================================== */
				/* event handlers                                              */
				/* =========================================================== */
				onAssignmentChange: function (oEvent) {
					var sChosenEmployeeID = oEvent.getParameter("selectedAssignment");
					this.oApplicationModel.setProperty("/employeeId", sChosenEmployeeID);

					this._processEmployeeId(sChosenEmployeeID);

					sap.ui
						.getCore()
						.getEventBus()
						.publish("com.sedef.hcm.ux.myprofile", "employeeIdChanged", {
							EmployeeId: sChosenEmployeeID,
						});
				},

				onManagerPress: function (oEvent) {
					var oQuickview = this._getManagerQuickView();
					oQuickview.openBy(oEvent.getSource());
				},

				onOfficeInfoPress: function (oEvent) {
					var oQuickview = this._getOfficeInfoQuickView();
					oQuickview.openBy(oEvent.getSource());
				},

				onTitleSelectorPress: function (oEvent) {
					var oPopover = this._getColleaguesPopover();
					//var oPopover = this._getDirectReportsPopover();
					oPopover.openBy(oEvent.getParameter("domRef"));
				},

				onNavToEmployeeLookup: function (oEvent) {
					this.oApplicationController.navToExternal(
						this.oApplicationController.getCrossAppNavIntends().EMPLOYEELOOKUP
						.target,
						this.oApplicationModel.getProperty("/employeeId")
					);
				},

				onColleaguesPress: function (oEvent) {
					// this.oApplicationController.navToExternal(
					//   this.oApplicationController.getCrossAppNavIntends().EMPLOYEEPROFILE
					//     .target,
					//   oEvent.getSource().getBindingContext().getProperty("EmployeeNumber")
					// );
					this._oColleaguesPopover.close();
					var sChosenEmployeeID = oEvent
						.getSource()
						.getBindingContext()
						.getProperty("EmployeeNumber");

					this.oApplicationModel.setProperty("/employeeId", sChosenEmployeeID);

					this._processEmployeeId(sChosenEmployeeID);

					sap.ui
						.getCore()
						.getEventBus()
						.publish("com.sedef.hcm.ux.myprofile", "employeeIdChanged", {
							EmployeeId: sChosenEmployeeID,
						});
				},

				onNavBack: function () {
					this.oApplicationController.navBack("", true);
				},

				onPhoneClick: function (oEvent) {
					sap.m.URLHelper.triggerTel(oEvent.getSource().getText());
				},

				onEmailClick: function (oEvent) {
					sap.m.URLHelper.triggerEmail(oEvent.getSource().getText());
				},

				onEmployeeSuggestionSelected: function (oEvent) {},
				onSuggestEmployee: function (oEvent) {
					var value = oEvent.getParameter("suggestValue");
					var oSource = oEvent.getSource();
					var filters = [];
					if (value) {
						filters = [new Filter("Query", FilterOperator.EQ, value)];
					}
					var oBinding = oSource.getBinding("suggestionItems");
					oBinding.filter(filters);
					oBinding.attachEventOnce("dataReceived", function () {
						oSource.suggest();
					});
				},

				onSearchEmployee: function (oEvent) {
					var item = oEvent.getParameter("suggestionItem");
					if (item) {
						var sChosenEmployeeID = item.getKey();
						this.oApplicationModel.setProperty(
							"/employeeId",
							sChosenEmployeeID
						);

						this._processEmployeeId(sChosenEmployeeID);

						sap.ui
							.getCore()
							.getEventBus()
							.publish("com.sedef.hcm.ux.myprofile", "employeeIdChanged", {
								EmployeeId: sChosenEmployeeID,
							});
					} else {
						this.oApplicationController.whenMetadataLoaded(
							function () {
								// Load default assignment
								CommonModelManager.getDefaultAssignment().then(
									function (defaultAssignment) {
										// register current employee number
										this.oApplicationModel.setProperty(
											"/employeeId",
											defaultAssignment.EmployeeId
										);
										// keep default version id
										this.oApplicationModel.setProperty(
											"/defaultVersionId",
											defaultAssignment.DefaultVersionId
										);

										this.oApplicationController.loadEmployeeDataModelForEmployeeId(
											defaultAssignment.EmployeeId
										);

										// process the current employee Id
										this._processEmployeeId(defaultAssignment.EmployeeId);

										sap.ui
											.getCore()
											.getEventBus()
											.publish("com.sedef.hcm.ux.myprofile", "employeeIdChanged", {
												EmployeeId: defaultAssignment.EmployeeId,
											});
									}.bind(this)
								);
							}.bind(this)
						);
					}
				},

				/* =========================================================== */
				/* internal methods                                            */
				/* =========================================================== */
				/**
				 * Binds the view to the object path.
				 * @function
				 * @param {sap.ui.base.Event} oEvent pattern match event in route 'profileOverview'
				 * @private
				 */
				_onObjectMatched: function (oEvent) {
					//wait until the apps model metadata is loaded
					this.oApplicationController.whenMetadataLoaded(
						function () {
							// Load default assignment
							CommonModelManager.getDefaultAssignment().then(
								function (defaultAssignment) {
									// register current employee number
									this.oApplicationModel.setProperty(
										"/employeeId",
										defaultAssignment.EmployeeId
									);

									// register default employee number
									this.oApplicationModel.setProperty(
										"/defaultEmployeeId",
										defaultAssignment.EmployeeId
									);
									// keep default version id
									this.oApplicationModel.setProperty(
										"/defaultVersionId",
										defaultAssignment.DefaultVersionId
									);

									this.oApplicationController.loadEmployeeDataModelForEmployeeId(
										defaultAssignment.EmployeeId
									);

									// process the current employee Id
									this._processEmployeeId(defaultAssignment.EmployeeId);
								}.bind(this)
							);
						}.bind(this)
					);
				},
				_processEmployeeId: function (sEmployeeNumber) {
					// read backend config
					var oDataHelpder = this.oApplicationController.getODataHelper(),
						sObjectPath =
						"/" +
						oDataHelpder.getObjectPath(sEmployeeNumber, "ConfigurationSet"),
						fnSuccess = function (oConfigData) {
							this.oApplicationModel.setProperty("/oConfigData", oConfigData);

							this._updateModelsFromConfig(sEmployeeNumber, oConfigData);

							// adjust UI layout as per backend config
							this._adjustSectionsFromConfig(oConfigData);

							// bind the view in accordance to backend config
							this._bindView(sEmployeeNumber, oConfigData);
						}.bind(this);

					oDataHelpder.read(sObjectPath, fnSuccess);
				},

				_updateModelsFromConfig: function (sEmployeeNumber, oConfigData) {
					// update config model to steer section / subsection visibility
					this._updateConfigModel(oConfigData);

					// update application model (e.g. data existence properties)
					this._updateApplicationModel(sEmployeeNumber, oConfigData);
				},

				_updateConfigModel: function (oConfigData) {
					// set Time Section visibility
					this.oConfigModel.setProperty(
						"/showTimeSection",
						oConfigData.ShowTimebalance ||
						oConfigData.ShowTimerecording ||
						oConfigData.ShowAbsence
					);

					// set Talent Section visibility
					this.oConfigModel.setProperty(
						"/showTalentSection",
						oConfigData.ShowTrainings ||
						oConfigData.ShowQualifications ||
						oConfigData.ShowPerformanceRatings ||
						oConfigData.ShowCareerProgress
					);

					// set Compensation Section visibility
					this.oConfigModel.setProperty(
						"/showCompensationSection",
						oConfigData.ShowSalary || oConfigData.ShowPaystubs
					);

					// set Personal Information Section visibility
					this.oConfigModel.setProperty(
						"/showPersInfoSection",
						oConfigData.ShowAddressData ||
						oConfigData.ShowPersonalData ||
						oConfigData.ShowBankData ||
						oConfigData.ShowFamilymembersData ||
						oConfigData.ShowCommunicationData ||
						oConfigData.ShowInternalData ||
						oConfigData.ShowEducationData
					);

					// set the subsections visibility
					this.oConfigModel.setProperty(
						"/otherEmployeeProfiles",
						oConfigData.OtherEmployeeProfiles
					);
					this.oConfigModel.setProperty(
						"/showTrainings",
						oConfigData.ShowTrainings
					);
					this.oConfigModel.setProperty(
						"/showQualifications",
						oConfigData.ShowQualifications
					);
					this.oConfigModel.setProperty(
						"/showPerformanceRatings",
						oConfigData.ShowPerformanceRatings
					);
					this.oConfigModel.setProperty(
						"/showCareerProgress",
						oConfigData.ShowCareerProgress
					);
					this.oConfigModel.setProperty(
						"/showPaystubs",
						oConfigData.ShowPaystubs
					);
					this.oConfigModel.setProperty("/showSalary", oConfigData.ShowSalary);
					this.oConfigModel.setProperty(
						"/showPersonalData",
						oConfigData.ShowPersonalData
					);
					this.oConfigModel.setProperty(
						"/showBankData",
						oConfigData.ShowBankData
					);
					this.oConfigModel.setProperty(
						"/showAddressData",
						oConfigData.ShowAddressData
					);
					this.oConfigModel.setProperty(
						"/showFamilyMembersData",
						oConfigData.ShowFamilymembersData
					);
					this.oConfigModel.setProperty(
						"/showCommunicationData",
						oConfigData.ShowCommunicationData
					);
					this.oConfigModel.setProperty(
						"/showInternalData",
						oConfigData.ShowInternalData
					);
					this.oConfigModel.setProperty(
						"/showEducationData",
						oConfigData.ShowEducationData
					);

					this.oConfigModel.setProperty(
						"/sPersonalDataSubSectionTitle",
						oConfigData.PersonalDataSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sAddressSubSectionTitle",
						oConfigData.AddressSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sBankDetailsSubSectionTitle",
						oConfigData.BankdetailsSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sFamilyMembersSubSectionTitle",
						oConfigData.FamilymembersSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sInternalDataSubSectionTitle",
						oConfigData.InternaldataSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sCommunicationDataSubSectionTitle",
						oConfigData.CommunicationSubsectionTitle
					);
					this.oConfigModel.setProperty(
						"/sEducationSubSectionTitle",
						oConfigData.EducationSubsectionTitle
					);
					// console.dir(oConfigData);
					this.oConfigModel.setProperty(
						"/bAuthEditAddress",
						oConfigData.AuthEditAddress
					);
					this.oApplicationModel.setProperty(
						"/bAuthEditAddress",
						oConfigData.AuthEditAddress
					);
					this.oConfigModel.setProperty(
						"/bAuthEditWorkExperience",
						oConfigData.AuthEditWorkExperience
					);
					this.oConfigModel.setProperty(
						"/bAuthEditForeignLanguage",
						oConfigData.AuthEditForeignLanguage
					);

					this.oConfigModel.setProperty(
						"/bAuthEditCourse",
						oConfigData.AuthEditCourse
					);
					this.oConfigModel.setProperty(
						"/bAuthEditCertificate",
						oConfigData.AuthEditCertificate
					);
				},

				_updateApplicationModel: function (sEmployeeNumber, oConfigData) {
					this.oApplicationController.loadEmployeeDataModelForEmployeeId(
						sEmployeeNumber
					);
				},

				_createId: function (sId) {
					if (sId) {
						return this.oView.getId() + "--" + sId;
					}
					return this.oView.getId();
				},

				_adjustSectionsFromConfig: function (oConfigData) {
					var aSections = this._getSections();

					this.oObjectPageLayout.removeAllSections();
					aSections.forEach(
						function (oSection) {
							if (this._isSectionVisible(oSection)) {
								var sSectionId = oSection.getId();
								if (sSectionId === this._createId("timeSection")) {
									this._removeUnusedTimeBlocks(oSection, oConfigData);
								}
								if (
									sSectionId === this._createId("personalInformationSection")
								) {
									this._removeUnusedPersInfoSubSections(oSection, oConfigData);
								}
								this.oObjectPageLayout.addSection(oSection);
							} else {
								this.oObjectPageLayout.addDependent(oSection);
							}
						}.bind(this)
					);
				},

				_getSections: function () {
					if (!this._aSections) {
						this._aSections = sap.ui.xmlfragment(
							this._createId(),
							"com.sedef.hcm.ux.myprofile.view.fragment.ObjectPageSections",
							this
						);
					}
					return this._aSections;
				},

				_isSectionVisible: function (oSection) {
					var sSectionId = oSection.getId();
					if (sSectionId === this._createId("timeSection")) {
						return this.oConfigModel.getProperty("/showTimeSection");
					}
					if (sSectionId === this._createId("talentSection")) {
						return this.oConfigModel.getProperty("/showTalentSection");
					}
					if (sSectionId === this._createId("personalInformationSection")) {
						return this.oConfigModel.getProperty("/showPersInfoSection");
					}
					if (sSectionId === this._createId("compensationSection")) {
						return this.oConfigModel.getProperty("/showCompensationSection");
					}

					// customer-own sections are visible per default
					return true;
				},

				_removeUnusedTimeBlocks: function (oSection, oConfigData) {
					if (this.oConfigModel.getProperty("/showTimeSection")) {
						var oTimeSubSection = oSection.getSubSections()[0];

						// remove invisible blocks and destroy the removed block
						if (!oConfigData.ShowTimerecording) {
							try {
								oTimeSubSection
									.removeBlock(this._createId("timeRecordingBlock"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowTimebalance) {
							try {
								oTimeSubSection
									.removeBlock(this._createId("timeBalanceBlock"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowAbsence) {
							try {
								oTimeSubSection
									.removeBlock(this._createId("absenceBlock"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
					}
				},

				_removeUnusedPersInfoSubSections: function (
					oPersInfoSection,
					oConfigData
				) {
					if (this.oConfigModel.getProperty("/showPersInfoSection")) {
						if (!oConfigData.ShowPersonalData) {
							try {
								oPersInfoSection
									.removeSubSection(this._createId("personalDataSubSection"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowAddressData) {
							try {
								oPersInfoSection
									.removeSubSection(this._createId("addressesSubSection"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowBankData) {
							try {
								oPersInfoSection
									.removeSubSection(this._createId("bankSubSection"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowFamilymembersData) {
							try {
								oPersInfoSection
									.removeSubSection(this._createId("familyMembersSubSection"))
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						if (!oConfigData.ShowCommunicationData) {
							try {
								oPersInfoSection
									.removeSubSection(
										this._createId("communicationDataSubSection")
									)
									.destroy();
							} catch (e) {
								//No catcher
							}
						}
						//if (!oConfigData.ShowInternalData) {
						//	oPersInfoSection.removeSubSection(this._createId("internalDataSubSection")).destroy();
						//}
					}
				},

				/**
				 * Binds the view to the object path.
				 * @function
				 * @param {string} sEmployeeNumber path to the object to be bound
				 * @param {object} oConfigData backend configuration object
				 * @private
				 */
				_bindView: function (sEmployeeNumber, oConfigData) {
					var sObjectPath =
						"/" +
						this.oApplicationController
						.getODataHelper()
						.getObjectPath(sEmployeeNumber, "EmployeeDetailSet"),
						mNavProps = this.oApplicationController.getAppNavProperties(),
						sExpand = this._buildExpandStringForEmployeeDetails(oConfigData);

					this.oApplicationModel.setProperty("/viewObjectPath", sObjectPath);
					this.oApplicationModel.setProperty("/viewExpandParameters", sExpand);

					reuseHandler.setView(this.getView());

					this.oApplicationController.whenMetadataLoaded(
						function () {
							this.getView().bindElement({
								path: sObjectPath,
								parameters: {
									expand: sExpand,
								},
								events: {
									dataRequested: function () {
										this.oApplicationModel.setProperty("/isAppBusy", true);
									}.bind(this),

									dataReceived: function (oResult) {
										var data = oResult.getParameter("data"),
											oEmployeeDataModel =
											this.oApplicationController.getEmployeeDataModelForEmployeeId(
												sEmployeeNumber
											);

										try {
											this.oApplicationModel.setProperty(
												"/addressInfoMetaData",
												data["toAddresses"][0].toPersInfoMetaData
											);
										} catch (e) {
											jQuery.sap.log.error("No metadata for address");
										}

										oEmployeeDataModel.setProperty(
											"/bCareerProgressExist",
											this._dataSetExists(data, mNavProps.CAREERPROGRESS)
										);
										oEmployeeDataModel.setProperty(
											"/bQualificationsExist",
											this._dataSetExists(data, mNavProps.QUALIFICATIONS)
										);
										oEmployeeDataModel.setProperty(
											"/bTrainingsExist",
											this._dataSetExists(data, mNavProps.TRAININGS)
										);
										oEmployeeDataModel.setProperty(
											"/bPaystubsExist",
											this._dataSetExists(data, mNavProps.PAYSTUBS)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoPersonalDataExists",
											this._dataSetExists(data, mNavProps.PERSONALDATA)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoBankDataExists",
											this._dataSetExists(data, mNavProps.BANKDETAIL)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoAddressExists",
											this._dataSetExists(data, mNavProps.ADDRESSES)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoFamilyMembersExists",
											this._dataSetExists(data, mNavProps.FAMILYMEMBERS)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoCommunicationDataExists",
											this._dataSetExists(data, mNavProps.COMMUNICATION)
										);
										oEmployeeDataModel.setProperty(
											"/bPersInfoInternalDataExists",
											this._dataSetExists(data, mNavProps.INTERNALDATA)
										);
										oEmployeeDataModel.setProperty(
											"/bEducationExist",
											this._dataSetExists(data, mNavProps.EDUCATION)
										);
										oEmployeeDataModel.setProperty(
											"/bPerformanceExist",
											this._dataSetExists(data, mNavProps.PERFORMANCE)
										);
										oEmployeeDataModel.setProperty(
											"bMultipleSkillsExist",
											this._dataSetExists(data, mNavProps.EMPLOYEESKILL)
										);
										oEmployeeDataModel.setProperty(
											"/bWorkExperienceExist",
											this._dataSetExists(data, mNavProps.WORKEXPERIENCE)
										);
										oEmployeeDataModel.setProperty(
											"/bForeignLanguageExist",
											this._dataSetExists(data, mNavProps.FOREIGNLANGUAGE)
										);
										oEmployeeDataModel.setProperty(
											"/bCourseExist",
											this._dataSetExists(data, mNavProps.COURSE)
										);
										oEmployeeDataModel.setProperty(
											"/bCertificateExist",
											this._dataSetExists(data, mNavProps.CERTIFICATE)
										);

										this.oApplicationModel.setProperty("/isAppBusy", false);
									}.bind(this),
								},
							});
						}.bind(this)
					);
				},

				_buildExpandStringForEmployeeDetails: function (oConfig) {
					var mNavProps = this.oApplicationController.getAppNavProperties(),
						sFixExpand =
						mNavProps.COLLEAGUES +
						"," +
						mNavProps.COLLEAGUES +
						"/" +
						mNavProps.EMPLOYEEPICTURE +
						"," +
						mNavProps.EMPLOYEEPICTURE +
						"," +
						mNavProps.MANAGERDETAIL +
						"/" +
						mNavProps.EMPLOYEEPICTURE,
						sDynamicExpand = "",
						sServiceNamespace =
						this.oApplicationModel.getProperty("/schemaNamespace");

					//check for the new navigation property existence
					var oEntityType = this.oMetaModel.getODataEntityType(
						sServiceNamespace + ".EmployeeDetail"
					);
					oEntityType.navigationProperty.forEach(function (oNavigation) {
						if (
							oNavigation.name !== mNavProps.COLLEAGUES &&
							oNavigation.name !== mNavProps.EMPLOYEEPICTURE &&
							oNavigation.name !== mNavProps.MANAGERDETAIL &&
							((oNavigation.name === mNavProps.ABSENCE &&
									oConfig.ShowAbsence) ||
								(oNavigation.name === mNavProps.TIMEBALANCE &&
									oConfig.ShowTimebalance) ||
								(oNavigation.name === mNavProps.TIMERECORDING &&
									oConfig.ShowTimerecording) ||
								(oNavigation.name === mNavProps.TRAININGS &&
									oConfig.ShowTrainings) ||
								(oNavigation.name === mNavProps.CAREERPROGRESS &&
									oConfig.ShowCareerProgress) ||
								(oNavigation.name === mNavProps.QUALIFICATIONS &&
									oConfig.ShowQualifications) ||
								(oNavigation.name === mNavProps.PAYSTUBS &&
									oConfig.ShowPaystubs) ||
								(oNavigation.name === mNavProps.ADDRESSES &&
									oConfig.ShowAddressData) ||
								(oNavigation.name === mNavProps.PERSONALDATA &&
									oConfig.ShowPersonalData) ||
								(oNavigation.name === mNavProps.BANKDETAIL &&
									oConfig.ShowBankData) ||
								(oNavigation.name === mNavProps.FAMILYMEMBERS &&
									oConfig.ShowFamilymembersData) ||
								(oNavigation.name === mNavProps.COMMUNICATION &&
									oConfig.ShowCommunicationData) ||
								(oNavigation.name === mNavProps.INTERNALDATA &&
									oConfig.ShowInternalData) ||
								(oNavigation.name === mNavProps.EDUCATION &&
									oConfig.ShowEducationData) ||
								oNavigation.name === mNavProps.WORKEXPERIENCE ||
								oNavigation.name === mNavProps.FOREIGNLANGUAGE ||
								oNavigation.name === mNavProps.COURSE ||
								oNavigation.name === mNavProps.PERFORMANCE ||
								oNavigation.name === mNavProps.EMPLOYEESKILL ||
								oNavigation.name === mNavProps.CERTIFICATE)
						) {
							if (
								oNavigation.name === mNavProps.PERSONALDATA ||
								oNavigation.name === mNavProps.BANKDETAIL ||
								oNavigation.name === mNavProps.FAMILYMEMBERS ||
								oNavigation.name === mNavProps.ADDRESSES ||
								oNavigation.name === mNavProps.COMMUNICATION ||
								oNavigation.name === mNavProps.INTERNALDATA ||
								oNavigation.name === mNavProps.EDUCATION
							) {
								// add expand to fieldMetaData for the persInfo entities
								sDynamicExpand =
									sDynamicExpand.toString() +
									"," +
									oNavigation.name +
									"/toPersInfoMetaData";

								//--Add change request and attachment details for addresses
								if (oNavigation.name === mNavProps.ADDRESSES) {
									// add expand to fieldMetaData for the persInfo entities
									sDynamicExpand =
										sDynamicExpand.toString() +
										"," +
										oNavigation.name +
										"/toAddressChangeRequest";
									sDynamicExpand =
										sDynamicExpand.toString() +
										"," +
										oNavigation.name +
										"/toAddressChangeRequest/toAttachments";
								}
							} else {
								sDynamicExpand =
									sDynamicExpand.toString() + "," + oNavigation.name;
							}
						}
					});
					return sFixExpand + sDynamicExpand;
				},

				_dataSetExists: function (oData, sPropertyName) {
					if (
						oData[sPropertyName] &&
						oData[sPropertyName] instanceof Array &&
						oData[sPropertyName].length !== 0
					) {
						return true;
					}
					return false;
				},

				_getManagerQuickView: function () {
					if (!this._oManagerQuickView) {
						var oView = this.getView();
						this._oManagerQuickView = sap.ui.xmlfragment(
							"com.sedef.hcm.ux.myprofile.view.fragment.ManagerQuickview",
							this
						);
						jQuery.sap.syncStyleClass(
							this.getOwnerComponent().getContentDensityClass(),
							oView,
							this._oManagerQuickView
						);
						oView.addDependent(this._oManagerQuickView);
					}
					return this._oManagerQuickView;
				},

				_getColleaguesPopover: function () {
					if (!this._oColleaguesPopover) {
						var oView = this.getView();
						this._oColleaguesPopover = sap.ui.xmlfragment(
							"com.sedef.hcm.ux.myprofile.view.fragment.ColleaguesList",
							this
						);
						jQuery.sap.syncStyleClass(
							this.getOwnerComponent().getContentDensityClass(),
							oView,
							this._oColleaguesPopover
						);
						oView.addDependent(this._oColleaguesPopover);
					} else {
						var oList = sap.ui.getCore().byId("colleaguesList");

						oList.getBinding("items").refresh();
					}

					return this._oColleaguesPopover;
				},

				_getDirectReportsPopover: function () {
					if (!this._oDirectReportsPopover) {
						var oView = this.getView();
						this._oDirectReportsPopover = sap.ui.xmlfragment(
							"com.sedef.hcm.ux.myprofile.view.fragment.DirectReportsList",
							this
						);
						jQuery.sap.syncStyleClass(
							this.getOwnerComponent().getContentDensityClass(),
							oView,
							this._oDirectReportsPopover
						);
						oView.addDependent(this._oDirectReportsPopover);
					}
					return this._oDirectReportsPopover;
				},

				_groupByEmployeeCategory: function (oContext) {
					return oContext.getProperty("EmployeeCategory");
				},

				_getGroupHeader: function (oGroup) {
					var sGroupTitle = "";
					switch (oGroup.key) {
					case "BOSS":
						sGroupTitle = this.getResourceBundle().getText(
							"colleagueListGroupTitleManager"
						);
						break;
					case "COLLEAGUE":
						sGroupTitle = this.getResourceBundle().getText(
							"colleagueListGroupTitleColleague"
						);
						break;
					case "DIRECTREPORT":
						sGroupTitle = this.getResourceBundle().getText(
							"colleagueListGroupTitleDirectReport"
						);
						break;
					}

					return new GroupHeaderListItem({
						title: sGroupTitle,
						upperCase: false,
					});
				},

				_getOfficeInfoQuickView: function () {
					if (!this._oOfficeInfoQuickView) {
						var oView = this.getView();
						this._oOfficeInfoQuickView = sap.ui.xmlfragment(
							"com.sedef.hcm.ux.myprofile.view.fragment.OfficeInfoQuickview",
							this
						);
						jQuery.sap.syncStyleClass(
							this.getOwnerComponent().getContentDensityClass(),
							oView,
							this._oOfficeInfoQuickView
						);
						this.getView().addDependent(this._oOfficeInfoQuickView);
					}
					return this._oOfficeInfoQuickView;
				},

				onCloseAddressDialog: function (oEvent) {
					oEvent.getSource().getParent().close();
				},
				onNewWorkExperience: function (oEvent) {
					var oEventBus = sap.ui.getCore().getEventBus();
					var that = this;
					that
						.getModel()
						.metadataLoaded()
						.then(function () {
							that.oApplicationController.whenMetadataLoaded(function () {
								oEventBus.publish("WorkExperience", "Create", null);
							});
						});
				},
				onNewForeignLanguage: function (oEvent) {
					var oEventBus = sap.ui.getCore().getEventBus();
					var that = this;
					that
						.getModel()
						.metadataLoaded()
						.then(function () {
							that.oApplicationController.whenMetadataLoaded(function () {
								oEventBus.publish("ForeignLanguage", "Create", null);
							});
						});
				},
				onNewCourse: function (oEvent) {
					var oEventBus = sap.ui.getCore().getEventBus();
					var that = this;
					that
						.getModel()
						.metadataLoaded()
						.then(function () {
							that.oApplicationController.whenMetadataLoaded(function () {
								oEventBus.publish("Course", "Create", null);
							});
						});
				},
				onNewCertificate: function (oEvent) {
					var oEventBus = sap.ui.getCore().getEventBus();
					var that = this;
					that
						.getModel()
						.metadataLoaded()
						.then(function () {
							that.oApplicationController.whenMetadataLoaded(function () {
								oEventBus.publish("Certificate", "Create", null);
							});
						});
				},
			}
		);
	}
);