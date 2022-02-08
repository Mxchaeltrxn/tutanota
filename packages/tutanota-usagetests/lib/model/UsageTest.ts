import {StageAlreadyRegisteredError, StageCompletionError} from "../errors.js"
import {VariantRenderer, VariantsIndex} from "../view/VariantRenderer.js"
import {Stage} from "./Stage.js"
import {PingAdapter} from "../storage/PingAdapter.js"

const NO_PARTICIPATION_VARIANT = -1

export class UsageTest {
	readonly testId: string
	readonly _stages: Map<number, Stage> = new Map<number, Stage>()
	pingAdapter?: PingAdapter
	readonly variant: number
	participationId?: string

	constructor(testId: string, variant: number) {
		this.testId = testId
		this.variant = variant
	}

	getStage(stageNum: number): Stage | undefined {
		return this._stages.get(stageNum)
	}

	addStage(stage: Stage): Stage {
		if (this._stages.get(stage.number)) {
			throw new StageAlreadyRegisteredError(`Stage ${stage.number} is already registered`)
		}

		this._stages.set(stage.number, stage)
		return stage
	}

	renderVariant<T>(renderer: VariantRenderer<T>, variants: VariantsIndex<T>): T {
		return renderer.render(this.variant, variants)
	}

	async completeStage(stage: Stage) {
		if (!this.pingAdapter) {
			throw new StageCompletionError("no ping adapter has been registered")
		} else if (this.variant === NO_PARTICIPATION_VARIANT) {
			return
		}

		await this.pingAdapter.sendPing(this, stage)
		console.log(`Completed stage: ${stage.number}`)
	}
}
