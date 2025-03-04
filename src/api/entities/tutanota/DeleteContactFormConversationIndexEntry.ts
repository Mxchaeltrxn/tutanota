import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const DeleteContactFormConversationIndexEntryTypeRef: TypeRef<DeleteContactFormConversationIndexEntry> = new TypeRef("tutanota", "DeleteContactFormConversationIndexEntry")
export const _TypeModel: TypeModel = {
	"name": "DeleteContactFormConversationIndexEntry",
	"since": 22,
	"type": "LIST_ELEMENT_TYPE",
	"id": 832,
	"rootId": "CHR1dGFub3RhAANA",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 836,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 834,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 837,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 835,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createDeleteContactFormConversationIndexEntry(values?: Partial<DeleteContactFormConversationIndexEntry>): DeleteContactFormConversationIndexEntry {
	return Object.assign(create(_TypeModel, DeleteContactFormConversationIndexEntryTypeRef), downcast<DeleteContactFormConversationIndexEntry>(values))
}

export type DeleteContactFormConversationIndexEntry = {
	_type: TypeRef<DeleteContactFormConversationIndexEntry>;

	_format: NumberString;
	_id: IdTuple;
	_ownerGroup: null | Id;
	_permissions: Id;
}