import {create} from "../../common/utils/EntityUtils.js"
import {TypeRef, downcast} from "@tutao/tutanota-utils"
import type {TypeModel} from "../../common/EntityTypes.js"

import type {UsageTestMetric} from "./UsageTestMetric.js"

export const UsageTestStageTypeRef: TypeRef<UsageTestStage> = new TypeRef("sys", "UsageTestStage")
export const _TypeModel: TypeModel = {
	"name": "UsageTestStage",
	"since": 72,
	"type": "AGGREGATED_TYPE",
	"id": 1935,
	"rootId": "A3N5cwAHjw",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_id": {
			"id": 1936,
			"type": "CustomId",
			"cardinality": "One",
			"final": true,
			"encrypted": false
		},
		"name": {
			"id": 1937,
			"type": "String",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"metricTypes": {
			"id": 1938,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"final": false,
			"refType": "UsageTestMetric",
			"dependency": null
		}
	},
	"app": "sys",
	"version": "72"
}

export function createUsageTestStage(values?: Partial<UsageTestStage>): UsageTestStage {
	return Object.assign(create(_TypeModel, UsageTestStageTypeRef), downcast<UsageTestStage>(values))
}

export type UsageTestStage = {
	_type: TypeRef<UsageTestStage>;

	_id: Id;
	name: string;

	metricTypes: UsageTestMetric[];
}