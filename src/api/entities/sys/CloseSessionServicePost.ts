import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const CloseSessionServicePostTypeRef: TypeRef<CloseSessionServicePost> = new TypeRef("sys", "CloseSessionServicePost")
export const _TypeModel: TypeModel = {
	"name": "CloseSessionServicePost",
	"since": 50,
	"type": "DATA_TRANSFER_TYPE",
	"id": 1595,
	"rootId": "A3N5cwAGOw",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 1596,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"accessToken": {
			"id": 1597,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"sessionId": {
			"id": 1598,
			"type": "LIST_ELEMENT_ASSOCIATION",
			"cardinality": "One",
			"final": false,
			"refType": "Session"
		}
	},
	"app": "sys",
	"version": "72"
}

export function createCloseSessionServicePost(values?: Partial<CloseSessionServicePost>): CloseSessionServicePost {
	return Object.assign(create(_TypeModel, CloseSessionServicePostTypeRef), downcast<CloseSessionServicePost>(values))
}

export type CloseSessionServicePost = {
	_type: TypeRef<CloseSessionServicePost>;

	_format: NumberString;
	accessToken: string;

	sessionId: IdTuple;
}