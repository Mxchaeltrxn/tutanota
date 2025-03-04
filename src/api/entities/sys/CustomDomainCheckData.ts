import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const CustomDomainCheckDataTypeRef: TypeRef<CustomDomainCheckData> = new TypeRef("sys", "CustomDomainCheckData")
export const _TypeModel: TypeModel = {
	"name": "CustomDomainCheckData",
	"since": 49,
	"type": "DATA_TRANSFER_TYPE",
	"id": 1586,
	"rootId": "A3N5cwAGMg",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 1587,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"domain": {
			"id": 1588,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "sys",
	"version": "72"
}

export function createCustomDomainCheckData(values?: Partial<CustomDomainCheckData>): CustomDomainCheckData {
	return Object.assign(create(_TypeModel, CustomDomainCheckDataTypeRef), downcast<CustomDomainCheckData>(values))
}

export type CustomDomainCheckData = {
	_type: TypeRef<CustomDomainCheckData>;

	_format: NumberString;
	domain: string;
}