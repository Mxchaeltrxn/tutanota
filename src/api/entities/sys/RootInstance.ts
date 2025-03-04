import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const RootInstanceTypeRef: TypeRef<RootInstance> = new TypeRef("sys", "RootInstance")
export const _TypeModel: TypeModel = {
	"name": "RootInstance",
	"since": 1,
	"type": "LIST_ELEMENT_TYPE",
	"id": 231,
	"rootId": "A3N5cwAA5w",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 235,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 233,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 1022,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 234,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"reference": {
			"id": 236,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "sys",
	"version": "72"
}

export function createRootInstance(values?: Partial<RootInstance>): RootInstance {
	return Object.assign(create(_TypeModel, RootInstanceTypeRef), downcast<RootInstance>(values))
}

export type RootInstance = {
	_type: TypeRef<RootInstance>;

	_format: NumberString;
	_id: IdTuple;
	_ownerGroup: null | Id;
	_permissions: Id;
	reference: Id;
}