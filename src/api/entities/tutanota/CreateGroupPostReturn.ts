import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const CreateGroupPostReturnTypeRef: TypeRef<CreateGroupPostReturn> = new TypeRef("tutanota", "CreateGroupPostReturn")
export const _TypeModel: TypeModel = {
	"name": "CreateGroupPostReturn",
	"since": 34,
	"type": "DATA_TRANSFER_TYPE",
	"id": 985,
	"rootId": "CHR1dGFub3RhAAPZ",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 986,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"group": {
			"id": 987,
			"type": "ELEMENT_ASSOCIATION",
			"cardinality": "One",
			"final": true,
			"refType": "Group"
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createCreateGroupPostReturn(values?: Partial<CreateGroupPostReturn>): CreateGroupPostReturn {
	return Object.assign(create(_TypeModel, CreateGroupPostReturnTypeRef), downcast<CreateGroupPostReturn>(values))
}

export type CreateGroupPostReturn = {
	_type: TypeRef<CreateGroupPostReturn>;
	_errors: Object;

	_format: NumberString;

	group: Id;
}