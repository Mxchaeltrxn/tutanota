import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const MailAddressTypeRef: TypeRef<MailAddress> = new TypeRef("tutanota", "MailAddress")
export const _TypeModel: TypeModel = {
	"name": "MailAddress",
	"since": 1,
	"type": "AGGREGATED_TYPE",
	"id": 92,
	"rootId": "CHR1dGFub3RhAFw",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 93,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"address": {
			"id": 95,
			"type": "String",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"name": {
			"id": 94,
			"type": "String",
			"cardinality": "One",
			"final": true,
			"encrypted": true
		}
	},
	"associations": {
		"contact": {
			"id": 96,
			"type": "LIST_ELEMENT_ASSOCIATION",
			"cardinality": "ZeroOrOne",
			"final": false,
			"refType": "Contact"
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createMailAddress(values?: Partial<MailAddress>): MailAddress {
	return Object.assign(create(_TypeModel, MailAddressTypeRef), downcast<MailAddress>(values))
}

export type MailAddress = {
	_type: TypeRef<MailAddress>;

	_id: Id;
	address: string;
	name: string;

	contact:  null | IdTuple;
}