import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const ContactAddressTypeRef: TypeRef<ContactAddress> = new TypeRef("tutanota", "ContactAddress")
export const _TypeModel: TypeModel = {
	"name": "ContactAddress",
	"since": 1,
	"type": "AGGREGATED_TYPE",
	"id": 54,
	"rootId": "CHR1dGFub3RhADY",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 55,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"address": {
			"id": 57,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"customTypeName": {
			"id": 58,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"type": {
			"id": 56,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createContactAddress(values?: Partial<ContactAddress>): ContactAddress {
	return Object.assign(create(_TypeModel, ContactAddressTypeRef), downcast<ContactAddress>(values))
}

export type ContactAddress = {
	_type: TypeRef<ContactAddress>;

	_id: Id;
	address: string;
	customTypeName: string;
	type: NumberString;
}