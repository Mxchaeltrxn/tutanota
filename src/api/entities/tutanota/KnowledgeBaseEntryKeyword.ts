import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const KnowledgeBaseEntryKeywordTypeRef: TypeRef<KnowledgeBaseEntryKeyword> = new TypeRef("tutanota", "KnowledgeBaseEntryKeyword")
export const _TypeModel: TypeModel = {
	"name": "KnowledgeBaseEntryKeyword",
	"since": 45,
	"type": "AGGREGATED_TYPE",
	"id": 1168,
	"rootId": "CHR1dGFub3RhAASQ",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 1169,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"keyword": {
			"id": 1170,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": true
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createKnowledgeBaseEntryKeyword(values?: Partial<KnowledgeBaseEntryKeyword>): KnowledgeBaseEntryKeyword {
	return Object.assign(create(_TypeModel, KnowledgeBaseEntryKeywordTypeRef), downcast<KnowledgeBaseEntryKeyword>(values))
}

export type KnowledgeBaseEntryKeyword = {
	_type: TypeRef<KnowledgeBaseEntryKeyword>;

	_id: Id;
	keyword: string;
}