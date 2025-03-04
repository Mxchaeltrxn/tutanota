import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const ContactMailAddressTypeRef: TypeRef<ContactMailAddress> = new TypeRef("tutanota", "ContactMailAddress")
export const _TypeModel: TypeModel = {
	"name": "ContactMailAddress",
	"since": 1,
	"type": "AGGREGATED_TYPE",
	"id": 44,
	"rootId": "CHR1dGFub3RhACw",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 45,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"address": {
			"id": 47,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"customTypeName": {
			"id": 48,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"type": {
			"id": 46,
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

export function createContactMailAddress(values?: Partial<ContactMailAddress>): ContactMailAddress {
	return Object.assign(create(_TypeModel, ContactMailAddressTypeRef), downcast<ContactMailAddress>(values))
}

export type ContactMailAddress = {
	_type: TypeRef<ContactMailAddress>;

	_id: Id;
	address: string;
	customTypeName: string;
	type: NumberString;
}