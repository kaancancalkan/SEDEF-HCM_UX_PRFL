/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/uxap/BlockBase",
	"sap/ui/Device"
], function(BlockBase, Device) {
	"use strict";

	return BlockBase.extend("com.sedef.hcm.ux.myprofile.blocks.QualificationsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: Device.system.phone ? "com.sedef.hcm.ux.myprofile.blocks.QualificationsBlockPhone" : "com.sedef.hcm.ux.myprofile.blocks.QualificationsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sedef.hcm.ux.myprofile.blocks.QualificationsBlock",
					type: "XML"
				}
			},
			events: {}
		}
	});
});