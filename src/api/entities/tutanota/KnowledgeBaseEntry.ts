import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {KnowledgeBaseEntryKeyword} from "./KnowledgeBaseEntryKeyword.js"

export const KnowledgeBaseEntryTypeRef: TypeRef<KnowledgeBaseEntry> = new TypeRef("tutanota", "KnowledgeBaseEntry")
export const _TypeModel: TypeModel = {
	"name": "KnowledgeBaseEntry",
	"since": 45,
	"type": "LIST_ELEMENT_TYPE",
	"id": 1171,
	"rootId": "CHR1dGFub3RhAAST",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 1175,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 1173,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerEncSessionKey": {
			"id": 1177,
			"type": "Bytes",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 1176,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 1174,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"description": {
			"id": 1179,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		},
		"title": {
			"id": 1178,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		}
	},
	"associations": {
		"keywords": {
			"id": 1180,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "KnowledgeBaseEntryKeyword",
			"dependency": null
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createKnowledgeBaseEntry(values?: Partial<KnowledgeBaseEntry>): KnowledgeBaseEntry {
	return Object.assign(create(_TypeModel, KnowledgeBaseEntryTypeRef), downcast<KnowledgeBaseEntry>(values))
}

export type KnowledgeBaseEntry = {
	_type: TypeRef<KnowledgeBaseEntry>;
	_errors: Object;

	_format: NumberString;
	_id: IdTuple;
	_ownerEncSessionKey: null | Uint8Array;
	_ownerGroup: null | Id;
	_permissions: Id;
	description: string;
	title: string;

	keywords: KnowledgeBaseEntryKeyword[];
}