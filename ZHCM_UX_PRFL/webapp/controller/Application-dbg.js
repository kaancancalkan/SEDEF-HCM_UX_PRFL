/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(
  [
    "sap/ui/base/Object",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "com/sedef/hcm/ux/myprofile/utils/ODataHelper",
    "com/sedef/hcm/ux/myprofile/utils/reuseHandler",
    "sap/ui/core/routing/History",
  ],
  function (Object, JSONModel, ODataModel, ODataHelper, reuseHandler, History) {
    "use strict";

    var mCrossAppNavIntends = {
        EMPLOYEEPROFILE: {
          target: {
            semanticObject: "ZHCMUXSEM002",
            action: "monitor",
          },
        },
        EMPLOYEELOOKUP: {
          target: {
            semanticObject: "ZHCMUXSEM004",
            action: "lookup",
          },
        },
        PAYSTUBS: {
          target: {
            semanticObject: "ZHCMUXSEM001",
            action: "monitor",
          },
        },
        LEAVEREQUEST: {
          target: {
            semanticObject: "LeaveRequest",
            action: "manage",
          },
        },
        TIMEEVENTS: {
          target: {
            semanticObject: "TimeEntry",
            action: "change",
          },
        },
        TIMESHEET: {
          target: {
            semanticObject: "TimeEntry",
            action: "manageTimesheet",
          },
        },
        MYADDRESSES: {
          target: {
            semanticObject: "Employee",
            action: "manageAddressData",
          },
        },
        MYPERSONALDATA: {
          target: {
            semanticObject: "Employee",
            action: "managePersonalData",
          },
        },
        MYBANKDETAILS: {
          target: {
            semanticObject: "Employee",
            action: "manageBankData",
          },
        },
        MYFAMILYMEMBERS: {
          target: {
            semanticObject: "Employee",
            action: "manageFamilyMembers",
          },
        },
        MYCOMMUNICATIONDATA: {
          target: {
            semanticObject: "Employee",
            action: "manageCommunicationData",
          },
        },
        MYINTERNALDATA: {
          target: {
            semanticObject: "Employee",
            action: "manageInternalData",
          },
        },
      },
      mEntities = {
        ABSENCE: "Absence",
        CAREERPROGRESS: "CareerProgress",
        COLLEAGUE: "Colleague",
        COMPENSATION: "Compensation",
        CONFIGURATION: "Configuration",
        EMPLOYEEDETAIL: "EmployeeDetail",
        EMPLOYEEPICTURE: "EmployeePicture",
        PAYSTUB: "Paystub",
        PERFORMANCE: "Performance",
        QUALIFICATION: "Qualification",
        SCALEPROFICIENCY: "ScaleProficiency",
        TIMEBALANCE: "TimeBalance",
        TIMERECORDING: "TimeRecording",
        TRAINING: "Training",
        ADDRESS: "Address",
        BANKDETAIL: "BankDetail",
        PERSONALDATA: "PersonalData",
        COMMUNICATION: "Communication",
        FAMILYMEMBERS: "FamilyMember",
        INTERNALDATA: "InternalData",
        EDUCATION: "Education",
        WORKEXPERIENCE: "WorkExperience",
        FOREIGNLANGUAGE: "ForeignLanguage",
        COURSE: "Course",
        CERTIFICATE: "Certificate",
        EMPLOYEESKILL: "EmployeeSkill"
      },
      mNavProperties = {
        COLLEAGUES: "toColleagues",
        EMPLOYEEPICTURE: "toEmployeePicture",
        MANAGERDETAIL: "toManagerDetail",
        ABSENCE: "toAbsence",
        TIMERECORDING: "toTimeRecording",
        TIMEBALANCE: "toTimeBalance",
        TRAININGS: "toTrainings",
        PERFORMANCE: "toPerformance",
        QUALIFICATIONS: "toQualifications",
        CAREERPROGRESS: "toCareerProgress",
        PAYSTUBS: "toPaystubs",
        SALARY: "toCompensation",
        ADDRESSES: "toAddresses",
        BANKDETAIL: "toBankDetails",
        PERSONALDATA: "toPersonalData",
        FAMILYMEMBERS: "toFamilyMember",
        COMMUNICATION: "toCommunication",
        INTERNALDATA: "toInternalData",
        EDUCATION: "toEducations",
        WORKEXPERIENCE: "toWorkExperiences",
        FOREIGNLANGUAGE: "toForeignLanguages",
        COURSE: "toCourses",
        CERTIFICATE: "toCertificates",
        EMPLOYEESKILL: "toEmployeeSkills"
      };

    return Object.extend(
      "nw.epm.refapps.ext.prod.manage.controller.Application",
      {
        reuseHandler: reuseHandler,
        // This class serves as controller for the whole App. It is a singleton object which is initialized by the Component.
        // Since the Component exposes a reference to this singleton object all controllers have access to it and can use its public methods.

        // --- the following attributes are initialized during startup and not changed afterwards
        // _oComponent: the Component (nw.epm.refapps.ext.prod.manage.Component)
        // _oResourceBundle: the resource bundle used by this app
        // _oModel: the OData model used by this App
        // _oDataHelper: instance of nw.epm.refapps.ext.prod.manage.model.Products used to perform explicit backend calls
        // _oApplicationProperties: a JSON model used to share global state between the classes used in this App
        // it possesses the following attributes:
        // applicationController - this instance
        // metaDataLoadState     - 0: meta data loading, 1: meta data loading was successful, -1 metadata loading failed
        // isAppBusy             - information whether the app as a whole is busy.
        // busyIndicatorDelay	 - busy delay for the app view. It is either 0 (no delay) or null (default delay)
        // employeeId            - if this attribute is truthy it contains the id of the employee currently displayed

        // --- Lifecycle methods

        // - Methods called during application startup. Note that the methods will be called in the following
        //   order: constructor, init, onMetadataLoaded.

        constructor: function (oComponent) {
          this._oComponent = oComponent;

          this._oOnMetaData = {
            onSuccess: [],
            onFailure: [],
          };

          this.oEmployeeDataMap = {};

          this._oApplicationModel = new JSONModel({
            applicationController: this,
            schemaNamespace: null,
            metaDataLoadState: 0,
            oConfigData: {},
            isAppBusy: true,
            busyIndicatorDelay: 0,
            defaultEmployeeId: null,
            employeeId: null,
            defaultVersionId: null,
            isEmployeeLookupAvailable: false,
            isMyLeaveRequestAvailable: false,
            isMyTimeEventsAvailable: false,
            isMyTimesheetAvailable: false,
            isMyPaystubsAvailable: false,
            isMyAdressesAvailable: false,
            isMyBankDetailsAvailable: false,
            isMyPersonalDataAvailable: false,
            isMyFamilyMembersAvailable: false,
            isMyInternalDataAvailable: false,
            isMyCommunicationDataAvailable: false,
            addressInfoMetaData: [],
            bAuthEditAddress: false,
          });

          this._oComponent.setModel(this._oApplicationModel, "appProperties");

          var oDataModel = this._oComponent.getModel();
          // check if metadata is already loaded
          if (oDataModel.getServiceMetadata()) {
            this.onMetadataLoaded();
          } else {
            // register for event
            oDataModel.attachMetadataLoaded(this.onMetadataLoaded, this);
            oDataModel.attachMetadataFailed(this.onMetadataFailed, this);
          }

          this._oDataHelper = new ODataHelper(this._oComponent);

          this._oRouter = this._oComponent.getRouter();

          reuseHandler.setOwnerComponent(this._oComponent);

          this.oCrossAppNavigator =
            sap.ushell &&
            sap.ushell.Container &&
            sap.ushell.Container.getService("CrossApplicationNavigation");
          this._initCrossAppNavigationSettings();
        },

        onMetadataLoaded: function () {
          // In normal scenarios this method is called at the end of the startup process. However, in cases that initial loading of
          // metadata fails, this method may be called later. It is registered in init().
          this._oApplicationModel.setProperty("/metaDataLoadState", 1);
          for (var i = 0; i < this._oOnMetaData.onSuccess.length; i++) {
            this._oOnMetaData.onSuccess[i]();
          }
          this._oOnMetaData = null;

          this._oApplicationModel.setProperty(
            "/schemaNamespace",
            this._oComponent.getModel().getServiceMetadata().dataServices
              .schema[0].namespace
          );
        },

        onMetadataFailed: function () {
          this._oApplicationModel.setProperty("/metaDataLoadState", -1);
          for (var i = 0; i < this._oOnMetaData.onFailure.length; i++) {
            this._oOnMetaData.onFailure[i]();
          }
          this._oOnMetaData = {
            onSuccess: [],
            onFailure: [],
          };
        },

        // - Navigation methods

        // Handler for navigating back.
        //if there is a history entry or an previous app-to-app navigation we go one step back in the browser history
        //If not, we navigate back to the Fiori Launchpad.
        navBack: function () {
          var sPreviousHash = History.getInstance().getPreviousHash();
          if (
            sPreviousHash !== undefined ||
            !this.oCrossAppNavigator.isInitialNavigation()
          ) {
            this.oCrossAppNavigator.historyBack(1);
          } else {
            // Navigate back to FLP home
            this.navToExternal();
          }
        },

        navToExternal: function (oTarget, sEmployeeNumber) {
          var sHash = "";
          if (sEmployeeNumber) {
            sHash =
              this.oCrossAppNavigator &&
              this.oCrossAppNavigator.hrefForExternal({
                target: {
                  semanticObject: oTarget.semanticObject,
                  action: oTarget.action,
                },
                params: {
                  EmployeeNumber: [sEmployeeNumber],
                },
              });
          } else if (oTarget) {
            sHash =
              this.oCrossAppNavigator &&
              this.oCrossAppNavigator.hrefForExternal({
                target: {
                  semanticObject: oTarget.semanticObject,
                  action: oTarget.action,
                },
              });
          } else {
            sHash =
              this.oCrossAppNavigator &&
              this.oCrossAppNavigator.hrefForExternal({
                target: {
                  shellHash: "#",
                },
              });
          }

          this.oCrossAppNavigator.toExternal({
            target: {
              shellHash: sHash,
            },
          });
        },

        // --- Methods to be called by the controllers

        getODataHelper: function () {
          // Returns the (singleton) helper for handling oData operations in this application
          return this._oDataHelper;
        },

        getComponent: function () {
          return this._oComponent;
        },

        getAppNavProperties: function () {
          return mNavProperties;
        },

        getAppEntities: function () {
          return mEntities;
        },

        getCrossAppNavIntends: function () {
          return mCrossAppNavIntends;
        },

        navPropertyExists: function (sEntityName, sNavPropertyName) {
          var sQualifiedEntityName =
              this._oApplicationModel.getProperty("/schemaNamespace") +
              "." +
              sEntityName,
            oEntityType = this._oDataHelper
              .getMetaModel()
              .getODataEntityType(sQualifiedEntityName);

          if (oEntityType.navigationProperty) {
            return oEntityType.navigationProperty.some(function (oProperty) {
              return oProperty.name === sNavPropertyName;
            });
          }
          return false;
        },

        getEmployeeDataModelForEmployeeId: function (sEmployeeId) {
          if (!this.oEmployeeDataMap[sEmployeeId]) {
            this.setEmployeeDataModelForEmployeeId(
              sEmployeeId,
              this._getNewEmployeeDataJSONModel()
            );
          }
          return this.oEmployeeDataMap[sEmployeeId];
        },

        setEmployeeDataModelForEmployeeId: function (sEmployeeId, oModel) {
          this.oEmployeeDataMap[sEmployeeId] = oModel;
        },

        loadEmployeeDataModelForEmployeeId: function (sEmployeeId) {
          this._oComponent.setModel(
            this.getEmployeeDataModelForEmployeeId(sEmployeeId),
            "appEmployeeData"
          );
        },

        // This method can be called when another action depends on the fact that the metadata have been loaded successfully.
        // More precisely the contract of this method is as follows:
        // - when the metadata have already been loaded successfully fnMetadataLoaded is executed immediately.
        //   Moreover in this case the check for lost draft would be triggered once more if it has failed before
        // - In case the metadata have not yet been loaded successfully, it is once more tried to load the metadata.
        //   fnMetadataLoaded will be called when the metadata have been loaded succesfully, whereas fnNoMetadata will
        //   be called when the metadata loading has failed.
        // - When the method is called while the metadata are still loading, fnMetaDataLoaded and fnNoMetadata will override
        //   functions which jhave been provided by previous calls. However, this cannot happen, since the App is busy
        //   while metadata are loading.
        whenMetadataLoaded: function (fnMetadataLoaded, fnNoMetadata) {
          var iMetadataLoadState =
            this._oApplicationModel.getProperty("/metaDataLoadState");
          if (iMetadataLoadState === 1) {
            if (fnMetadataLoaded) {
              fnMetadataLoaded();
            }
          } else {
            if (fnMetadataLoaded) {
              this._oOnMetaData.onSuccess.push(fnMetadataLoaded);
            }
            if (fnNoMetadata) {
              this._oOnMetaData.onFailure.push(fnNoMetadata);
            }
            if (iMetadataLoadState === -1) {
              this._oApplicationModel.setProperty("/metaDataLoadState", 0);
              this._oComponent.getModel().refreshMetadata();
            }
          }
        },

        // --- internal Methods

        _initCrossAppNavigationSettings: function () {
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.LEAVEREQUEST],
            this._oApplicationModel,
            "isMyLeaveRequestAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.EMPLOYEELOOKUP],
            this._oApplicationModel,
            "isEmployeeLookupAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.TIMEEVENTS],
            this._oApplicationModel,
            "isMyTimeEventsAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.PAYSTUBS],
            this._oApplicationModel,
            "isMyPaystubsAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.TIMESHEET],
            this._oApplicationModel,
            "isMyTimesheetAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYADDRESSES],
            this._oApplicationModel,
            "isMyAddressesAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYBANKDETAILS],
            this._oApplicationModel,
            "isMyBankDetailsAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYFAMILYMEMBERS],
            this._oApplicationModel,
            "isMyFamilyMembersAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYPERSONALDATA],
            this._oApplicationModel,
            "isMyPersonalDataAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYINTERNALDATA],
            this._oApplicationModel,
            "isMyInternalDataAvailable"
          );
          this._checkNavIntendSupported(
            [mCrossAppNavIntends.MYCOMMUNICATIONDATA],
            this._oApplicationModel,
            "isMyCommunicationDataAvailable"
          );
        },

        _checkNavIntendSupported: function (
          aCrossAppNavIntend,
          oModel,
          sPropertyName
        ) {
          oModel.setProperty("/" + sPropertyName, false);

          // this.oCrossAppNavigator.isNavigationSupported(aCrossAppNavIntend)
          // 	.done(function(aResponses) {
          // 		oModel.setProperty("/" + sPropertyName, aResponses[0].supported);
          // 	}).fail(function() {
          // 		oModel.setProperty("/" + sPropertyName, false);
          // 	});
        },

        _getNewEmployeeDataJSONModel: function () {
          return new JSONModel({
            bCareerProgressExist: true,
            bEducationExist: true,
            bPerformanceExist: true,
            bMultipleSkillsExist: true,
            bQualificationsExist: true,
            bSalaryExists: true,
            bPaystubsExist: true,
            bTrainingsExist: true,
            bAbsenceExists: true,
            bTimeRecordingExists: true,
            bTimeBalanceExists: true,
            bPersInfoAddressExists: true,
            bPersInfoBankDataExists: true,
            bPersInfoFamilyMembersExists: true,
            bPersInfoPersonalDataExists: true,
            bPersInfoInternalDataExists: true,
            bPersInfoCommunicationDataExists: true,
            bWorkExperienceExist: true,
            bForeignLanguageExist: true,
            bCourseExist: true,
            bCertificateExist: true
          });
        }
      }
    );
  }
);