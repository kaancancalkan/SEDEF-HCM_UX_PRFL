/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["com/sedef/hcm/ux/myprofile/controller/BaseController","com/sedef/hcm/ux/myprofile/utils/reuseHandler"],function(e,t){"use strict";var i={AEDTM:"ChangedOn",UNAME:"ChangedBy",SPRTX:"LockIndicatorText",ITBLD:"VersionId",BEGDA:"ValidFrom",ENDDA:"ValidTo",FAMSA:"FamilyMemberTypeId",STEXT:"FamilyMemberTypeText",FANAM:"LastName",FGBNA:"NameAtBirth",FAVOR:"FirstName",FINIT:"Initials",FNMZU:"NameAffix",KNZNM:"NameFormatIndicatorId",KNZNMTEXT:"NameFormatIndicatorText",FVRSW:"NamePrefixFirst",FVRS2:"NamePrefixSecond",FGBDT:"DateOfBirth",FGBOT:"CityOfBirth",FGBLD:"CountryOfBirthId",FGBLD_TEXT:"CountryOfBirthText",FANAT:"NationalityId",NATTX:"NationalityText",FANA2:"SecondNationalityId",NA2TX:"SecondNationalityText",FANA3:"ThirdNationalityId",NA3TX:"ThirdNationalityText",FASEX:"GenderId",SETXT:"GenderTExt",FORMATTED_NAME:"FormattedName"};return e.extend("com.sedef.hcm.ux.myprofile.blocks.PersInfoFamilyMembersBlockController",{reuseHandler:t,onInit:function(){this.oApplicationController=t.getOwnerComponent().getModel("appProperties").getProperty("/applicationController");this.oODataModel=t.getOwnerComponent().getModel()},onNavToFamilyMembersPress:function(){this.oApplicationController.navToExternal(this.oApplicationController.getCrossAppNavIntends().MYFAMILYMEMBERS.target)},getVisibility:function(e,o,r){if(!o){return true}return t.getPersInfoFieldVisibility(e,o,i,r)},getPersinfoLabel:function(e,o,r){return t.getPersinfoLabel(e,o,i,r)}})});
//# sourceMappingURL=PersInfoFamilyMembersBlockController.controller.js.map