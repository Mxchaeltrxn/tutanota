import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const MailAddressAliasServiceReturnTypeRef: TypeRef<MailAddressAliasServiceReturn> = new TypeRef("sys", "MailAddressAliasServiceReturn")
export const _TypeModel: TypeModel = {
	"name": "MailAddressAliasServiceReturn",
	"since": 8,
	"type": "DATA_TRANSFER_TYPE",
	"id": 692,
	"rootId": "A3N5cwACtA",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 693,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"enabledAliases": {
			"id": 1071,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"nbrOfFreeAliases": {
			"id": 694,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"totalAliases": {
			"id": 1069,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"usedAliases": {
			"id": 1070,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "sys",
	"version": "72"
}

export function createMailAddressAliasServiceReturn(values?: Partial<MailAddressAliasServiceReturn>): MailAddressAliasServiceReturn {
	return Object.assign(create(_TypeModel, MailAddressAliasServiceReturnTypeRef), downcast<MailAddressAliasServiceReturn>(values))
}

export type MailAddressAliasServiceReturn = {
	_type: TypeRef<MailAddressAliasServiceReturn>;

	_format: NumberString;
	enabledAliases: NumberString;
	nbrOfFreeAliases: NumberString;
	totalAliases: NumberString;
	usedAliases: NumberString;
}