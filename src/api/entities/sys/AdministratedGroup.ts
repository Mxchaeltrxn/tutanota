import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const AdministratedGroupTypeRef: TypeRef<AdministratedGroup> = new TypeRef("sys", "AdministratedGroup")
export const _TypeModel: TypeModel = {
	"name": "AdministratedGroup",
	"since": 27,
	"type": "LIST_ELEMENT_TYPE",
	"id": 1294,
	"rootId": "A3N5cwAFDg",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 1298,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 1296,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 1299,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 1297,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"groupType": {
			"id": 1300,
			"type": "Number",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		}
	},
	"associations": {
		"groupInfo": {
			"id": 1301,
			"type": "LIST_ELEMENT_ASSOCIATION",
			"cardinality": "One",
			"final": false,
			"refType": "GroupInfo"
		},
		"localAdminGroup": {
			"id": 1302,
			"type": "ELEMENT_ASSOCIATION",
			"cardinality": "One",
			"final": false,
			"refType": "Group"
		}
	},
	"app": "sys",
	"version": "72"
}

export function createAdministratedGroup(values?: Partial<AdministratedGroup>): AdministratedGroup {
	return Object.assign(create(_TypeModel, AdministratedGroupTypeRef), downcast<AdministratedGroup>(values))
}

export type AdministratedGroup = {
	_type: TypeRef<AdministratedGroup>;

	_format: NumberString;
	_id: IdTuple;
	_ownerGroup: null | Id;
	_permissions: Id;
	groupType: NumberString;

	groupInfo: IdTuple;
	localAdminGroup: Id;
}