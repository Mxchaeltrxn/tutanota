import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {GroupSettings} from "./GroupSettings.js"

export const UserSettingsGroupRootTypeRef: TypeRef<UserSettingsGroupRoot> = new TypeRef("tutanota", "UserSettingsGroupRoot")
export const _TypeModel: TypeModel = {
	"name": "UserSettingsGroupRoot",
	"since": 34,
	"type": "ELEMENT_TYPE",
	"id": 972,
	"rootId": "CHR1dGFub3RhAAPM",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 976,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 974,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerEncSessionKey": {
			"id": 978,
			"type": "Bytes",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 977,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 975,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"startOfTheWeek": {
			"id": 981,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"timeFormat": {
			"id": 980,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		}
	},
	"associations": {
		"groupSettings": {
			"id": 979,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "GroupSettings",
			"dependency": null
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createUserSettingsGroupRoot(values?: Partial<UserSettingsGroupRoot>): UserSettingsGroupRoot {
	return Object.assign(create(_TypeModel, UserSettingsGroupRootTypeRef), downcast<UserSettingsGroupRoot>(values))
}

export type UserSettingsGroupRoot = {
	_type: TypeRef<UserSettingsGroupRoot>;
	_errors: Object;

	_format: NumberString;
	_id: Id;
	_ownerEncSessionKey: null | Uint8Array;
	_ownerGroup: null | Id;
	_permissions: Id;
	startOfTheWeek: NumberString;
	timeFormat: NumberString;

	groupSettings: GroupSettings[];
}