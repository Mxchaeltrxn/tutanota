import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {PhotosRef} from "./PhotosRef.js"

export const ContactListTypeRef: TypeRef<ContactList> = new TypeRef("tutanota", "ContactList")
export const _TypeModel: TypeModel = {
	"name": "ContactList",
	"since": 1,
	"type": "ELEMENT_TYPE",
	"id": 153,
	"rootId": "CHR1dGFub3RhAACZ",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 157,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 155,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerEncSessionKey": {
			"id": 593,
			"type": "Bytes",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 592,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 156,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		}
	},
	"associations": {
		"photos": {
			"id": 856,
			"type": "AGGREGATION",
			"cardinality": "ZeroOrOne",
			"final": false,
			"refType": "PhotosRef",
			"dependency": null
		},
		"contacts": {
			"id": 160,
			"type": "LIST_ASSOCIATION",
			"cardinality": "One",
			"final": true,
			"refType": "Contact"
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createContactList(values?: Partial<ContactList>): ContactList {
	return Object.assign(create(_TypeModel, ContactListTypeRef), downcast<ContactList>(values))
}

export type ContactList = {
	_type: TypeRef<ContactList>;
	_errors: Object;

	_format: NumberString;
	_id: Id;
	_ownerEncSessionKey: null | Uint8Array;
	_ownerGroup: null | Id;
	_permissions: Id;

	photos:  null | PhotosRef;
	contacts: Id;
}