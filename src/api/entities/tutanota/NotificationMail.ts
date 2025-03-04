import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"


export const NotificationMailTypeRef: TypeRef<NotificationMail> = new TypeRef("tutanota", "NotificationMail")
export const _TypeModel: TypeModel = {
	"name": "NotificationMail",
	"since": 1,
	"type": "AGGREGATED_TYPE",
	"id": 223,
	"rootId": "CHR1dGFub3RhAADf",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 224,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"bodyText": {
			"id": 226,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"mailboxLink": {
			"id": 417,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"recipientMailAddress": {
			"id": 227,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"recipientName": {
			"id": 228,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"subject": {
			"id": 225,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {},
	"app": "tutanota",
	"version": "51"
}

export function createNotificationMail(values?: Partial<NotificationMail>): NotificationMail {
	return Object.assign(create(_TypeModel, NotificationMailTypeRef), downcast<NotificationMail>(values))
}

export type NotificationMail = {
	_type: TypeRef<NotificationMail>;

	_id: Id;
	bodyText: string;
	mailboxLink: string;
	recipientMailAddress: string;
	recipientName: string;
	subject: string;
}