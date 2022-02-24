//@bundleInto:common-min

import {TutanotaError} from "./TutanotaError.js"

export class DeviceStorageUnavailableError extends TutanotaError {

	constructor(msg: string, error: Error | null) {
		const message = error
			? (msg + "> " + (error.stack ? error.stack : error.message))
			: msg
		super("DeviceStorageUnavailableError", message)
	}
}