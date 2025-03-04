import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const WriteCounterDataTypeRef: TypeRef<WriteCounterData> = new TypeRef("monitor", "WriteCounterData")
export const _TypeModel: TypeModel = {
	"name": "WriteCounterData",
	"since": 4,
	"type": "DATA_TRANSFER_TYPE",
	"id": 49,
	"rootId": "B21vbml0b3IAMQ",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 50,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"counterType": {
			"id": 215,
			"type": "Number",
			"cardinality": "ZeroOrOne",
			"final": false,
			"encrypted": false
		},
		"row": {
			"id": 51,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"column": {
			"id": 52,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"value": {
			"id": 53,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "monitor",
	"version": "19"
}

export function createWriteCounterData(values?: Partial<WriteCounterData>): WriteCounterData {
	return Object.assign(create(_TypeModel, WriteCounterDataTypeRef), downcast<WriteCounterData>(values))
}

export type WriteCounterData = {
	_type: TypeRef<WriteCounterData>;

	_format: NumberString;
	counterType: null | NumberString;
	row: string;
	column: Id;
	value: NumberString;
}