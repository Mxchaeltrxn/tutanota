import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const FileDataDataGetTypeRef: TypeRef<FileDataDataGet> = new TypeRef("tutanota", "FileDataDataGet")
export const _TypeModel: TypeModel = {
	"name": "FileDataDataGet",
	"since": 1,
	"type": "DATA_TRANSFER_TYPE",
	"id": 331,
	"rootId": "CHR1dGFub3RhAAFL",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 332,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"base64": {
			"id": 333,
			"type": "Boolean",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"file": {
			"id": 334,
			"type": "LIST_ELEMENT_ASSOCIATION",
			"cardinality": "One",
			"final": false,
			"refType": "File"
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createFileDataDataGet(values?: Partial<FileDataDataGet>): FileDataDataGet {
	return Object.assign(create(_TypeModel, FileDataDataGetTypeRef), downcast<FileDataDataGet>(values))
}

export type FileDataDataGet = {
	_type: TypeRef<FileDataDataGet>;
	_errors: Object;

	_format: NumberString;
	base64: boolean;

	file: IdTuple;
}