/*
 * Copyright (C) 2009-2018 SAP SE or an SAP affiliate company. All rights reserved.
 */
sap.ui.define(["sap/uxap/BlockBase"], function(e) {
	"use strict";
	return e.extend("com.sedef.hcm.ux.myprofile.blocks.MultipleSkillsBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "com.sedef.hcm.ux.myprofile.blocks.MultipleSkillsBlock",
					type: "XML"
				},
				Expanded: {
					viewName: "com.sedef.hcm.ux.myprofile.blocks.MultipleSkillsBlock",
					type: "XML"
				}
			},
			events: {}
		}
	})
});
