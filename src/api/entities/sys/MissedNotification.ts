import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {AlarmNotification} from "./AlarmNotification.js"
import type {NotificationInfo} from "./NotificationInfo.js"

export const MissedNotificationTypeRef: TypeRef<MissedNotification> = new TypeRef("sys", "MissedNotification")
export const _TypeModel: TypeModel = {
	"name": "MissedNotification",
	"since": 53,
	"type": "ELEMENT_TYPE",
	"id": 1693,
	"rootId": "A3N5cwAGnQ",
	"versioned": false,
	"encrypted": true,
	"values": {
		"_format": {
			"id": 1697,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"_id": {
			"id": 1695,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"_ownerEncSessionKey": {
			"id": 1699,
			"type": "Bytes",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_ownerGroup": {
			"id": 1698,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		},
		"_permissions": {
			"id": 1696,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"changeTime": {
			"id": 1701,
			"type": "Date",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"confirmationId": {
			"id": 1700,
			"type": "GeneratedId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"lastProcessedNotificationId": {
			"id": 1722,
			"type": "GeneratedId",
			"cardinality": "ZeroOrOne",
			"final": true,
			"encrypted": false
		}
	},
	"associations": {
		"alarmNotifications": {
			"id": 1703,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "AlarmNotification",
			"dependency": null
		},
		"notificationInfos": {
			"id": 1702,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "NotificationInfo",
			"dependency": null
		}
	},
	"app": "sys",
	"version": "72"
}

export function createMissedNotification(values?: Partial<MissedNotification>): MissedNotification {
	return Object.assign(create(_TypeModel, MissedNotificationTypeRef), downcast<MissedNotification>(values))
}

export type MissedNotification = {
	_type: TypeRef<MissedNotification>;
	_errors: Object;

	_format: NumberString;
	_id: Id;
	_ownerEncSessionKey: null | Uint8Array;
	_ownerGroup: null | Id;
	_permissions: Id;
	changeTime: Date;
	confirmationId: Id;
	lastProcessedNotificationId: null | Id;

	alarmNotifications: AlarmNotification[];
	notificationInfos: NotificationInfo[];
}