import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const MailboxServerPropertiesTypeRef: TypeRef<MailboxServerProperties> = new TypeRef("tutanota", "MailboxServerProperties")
export const _TypeModel: TypeModel = {
	"name": "MailboxServerProperties",
	"since": 18,
	"type": "ELEMENT_TYPE",
	"id": 677,
	"rootId": "CHR1dGFub3RhAAKl",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 681,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 679,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 682,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 680,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"whitelistProtectionEnabled": {
			"id": 683,
			"type": "Boolean",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createMailboxServerProperties(values?: Partial<MailboxServerProperties>): MailboxServerProperties {
	return Object.assign(create(_TypeModel, MailboxServerPropertiesTypeRef), downcast<MailboxServerProperties>(values))
}

export type MailboxServerProperties = {
	_type: TypeRef<MailboxServerProperties>;

	_format: NumberString;
	_id: Id;
	_ownerGroup: null | Id;
	_permissions: Id;
	whitelistProtectionEnabled: boolean;
}