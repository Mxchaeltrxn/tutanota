import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {MailAddress} from "./MailAddress.js"

export const GroupInvitationPostReturnTypeRef: TypeRef<GroupInvitationPostReturn> = new TypeRef("tutanota", "GroupInvitationPostReturn")
export const _TypeModel: TypeModel = {
	"name": "GroupInvitationPostReturn",
	"since": 38,
	"type": "DATA_TRANSFER_TYPE",
	"id": 1006,
	"rootId": "CHR1dGFub3RhAAPu",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"id": 1007,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"existingMailAddresses": {
			"id": 1008,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "MailAddress",
			"dependency": null
		},
		"invalidMailAddresses": {
			"id": 1009,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "MailAddress",
			"dependency": null
		},
		"invitedMailAddresses": {
			"id": 1010,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "MailAddress",
			"dependency": null
		}
	},
	"app": "tutanota",
	"version": "51"
}

export function createGroupInvitationPostReturn(values?: Partial<GroupInvitationPostReturn>): GroupInvitationPostReturn {
	return Object.assign(create(_TypeModel, GroupInvitationPostReturnTypeRef), downcast<GroupInvitationPostReturn>(values))
}

export type GroupInvitationPostReturn = {
	_type: TypeRef<GroupInvitationPostReturn>;

	_format: NumberString;

	existingMailAddresses: MailAddress[];
	invalidMailAddresses: MailAddress[];
	invitedMailAddresses: MailAddress[];
}