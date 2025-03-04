import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const MailBodyTypeRef: TypeRef<MailBody> = new TypeRef("tutanota", "MailBody")
export const _TypeModel: TypeModel = {
	"name": "MailBody",
	"since": 1,
	"type": "ELEMENT_TYPE",
	"id": 36,
	"rootId": "CHR1dGFub3RhACQ",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_area": {
			"id": 42,
			"type": "Number",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_format": {
			"id": 40,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 38,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_owner": {
			"id": 41,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerEncSessionKey": {
			"id": 584,
			"type": "Bytes",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 583,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 39,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"compressedText": {
			"id": 989,
			"type": "CompressedString",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": true
		},
		"text": {
			"id": 43,
			"type": "String",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": true
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createMailBody(values?: Partial<MailBody>): MailBody {
	return Object.assign(create(_TypeModel, MailBodyTypeRef), downcast<MailBody>(values))
}

export type MailBody = {
	_type: TypeRef<MailBody>;
	_errors: Object;

	_area: NumberString;
	_format: NumberString;
	_id: Id;
	_owner: Id;
	_ownerEncSessionKey: null | Uint8Array;
	_ownerGroup: null | Id;
	_permissions: Id;
	compressedText: null | string;
	text: null | string;
}