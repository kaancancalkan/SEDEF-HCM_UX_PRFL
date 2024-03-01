/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define([
	"sap/uxap/BlockBase",
	"sap/ui/Device"
], function(BlockBase, Device) {
	"use strict";

	return BlockBase.extend("com.sedef.hcm.ux.myprofile.blocks.PaystubsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: Device.system.phone ? "com.sedef.hcm.ux.myprofile.blocks.PaystubsBlockPhone" : "com.sedef.hcm.ux.myprofile.blocks.PaystubsBlockCollapsed",
					type: "XML"
				},
				Expanded: {
					viewName: Device.system.phone ? "com.sedef.hcm.ux.myprofile.blocks.PaystubsBlockPhone" : "com.sedef.hcm.ux.myprofile.blocks.PaystubsBlockExpanded",
					type: "XML"
				}
			},
			events: {}
		}
	});
});