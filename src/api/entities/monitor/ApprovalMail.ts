import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const ApprovalMailTypeRef: TypeRef<ApprovalMail> = new TypeRef("monitor", "ApprovalMail")
export const _TypeModel: TypeModel = {
	"name": "ApprovalMail",
	"since": 14,
	"type": "LIST_ELEMENT_TYPE",
	"id": 221,
	"rootId": "B21vbml0b3IAAN0",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 225,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 223,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 226,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 224,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"date": {
			"id": 228,
			"type": "Date",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"range": {
			"id": 227,
			"type": "String",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"text": {
			"id": 229,
			"type": "String",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		}
	},
	"associations": {
		"customer": {
			"id": 230,
			"type": "ELEMENT_ASSOCIATION",
			"cardinality": "ZeroOrOne",
			"final": true,
			"refType": "Customer"
		}
	},
	"app": "monitor",
	"version": "19"
}

export function createApprovalMail(values?: Partial<ApprovalMail>): ApprovalMail {
	return Object.assign(create(_TypeModel, ApprovalMailTypeRef), downcast<ApprovalMail>(values))
}

export type ApprovalMail = {
	_type: TypeRef<ApprovalMail>;

	_format: NumberString;
	_id: IdTuple;
	_ownerGroup: null | Id;
	_permissions: Id;
	date: null | Date;
	range: null | string;
	text: string;

	customer:  null | Id;
}