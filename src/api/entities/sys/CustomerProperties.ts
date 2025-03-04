import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {File} from "./File.js"
import type {NotificationMailTemplate} from "./NotificationMailTemplate.js"

export const CustomerPropertiesTypeRef: TypeRef<CustomerProperties> = new TypeRef("sys", "CustomerProperties")
export const _TypeModel: TypeModel = {
	"name": "CustomerProperties",
	"since": 6,
	"type": "ELEMENT_TYPE",
	"id": 656,
	"rootId": "A3N5cwACkA",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 660,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 658,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 985,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 659,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"externalUserWelcomeMessage": {
			"id": 661,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"lastUpgradeReminder": {
			"id": 975,
			"type": "Date",
			"cardinality": "ZeroOrOne",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"bigLogo": {
			"id": 923,
			"type": "AGGREGATION",
			"cardinality": "ZeroOrOne",
			"final": false,
			"refType": "File",
			"dependency": null
		},
		"notificationMailTemplates": {
			"id": 1522,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "NotificationMailTemplate",
			"dependency": null
		},
		"smallLogo": {
			"id": 922,
			"type": "AGGREGATION",
			"cardinality": "ZeroOrOne",
			"final": false,
			"refType": "File",
			"dependency": null
		}
	},
	"app": "sys",
	"version": "72"
}

export function createCustomerProperties(values?: Partial<CustomerProperties>): CustomerProperties {
	return Object.assign(create(_TypeModel, CustomerPropertiesTypeRef), downcast<CustomerProperties>(values))
}

export type CustomerProperties = {
	_type: TypeRef<CustomerProperties>;

	_format: NumberString;
	_id: Id;
	_ownerGroup: null | Id;
	_permissions: Id;
	externalUserWelcomeMessage: string;
	lastUpgradeReminder: null | Date;

	bigLogo:  null | File;
	notificationMailTemplates: NotificationMailTemplate[];
	smallLogo:  null | File;
}