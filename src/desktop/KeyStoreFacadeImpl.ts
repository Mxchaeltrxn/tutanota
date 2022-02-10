import type {SecretStorage} from "./sse/SecretStorage"
import {DesktopCryptoFacade} from "./DesktopCryptoFacade"
import {log} from "./DesktopLog"
import {Base64, base64ToUint8Array, getFromMap, uint8ArrayToBase64} from "@tutao/tutanota-utils"
import {base64ToKey, keyToBase64,} from "@tutao/tutanota-crypto"

interface NativeKeySpec {
	/**
	 * This is supposed to be internet service but this is what is usually presented to the user (at least mac os does this).
	 * One would thing that this would group all the things but in reality permissions are set per-account anyway.
	 */
	readonly serviceName: string
	/** This is supposed to be account name but this is usually not shown. */
	readonly accountName: string
	/** Whether we want to cache the key in memory */
	readonly cached: boolean
}

export const DeviceKeySpec: NativeKeySpec = Object.freeze({
	serviceName: "tutanota-vault",
	accountName: "tuta",
	cached: true,
})

export const CredentialsKeySpec: NativeKeySpec = Object.freeze({
	serviceName: "tutanota-credentials",
	accountName: "tutanota-credentials",
	// Credentials key should not be cached, we should ask it every time we operate on credentials (there's already intermediate in web to avoid asking
	// too many times)
	cached: false
})

export const DatabaseKeySpec: NativeKeySpec = Object.freeze({
	serviceName: "tutanota-database",
	accountName: "tutanota-database",
	cached: false
})

/** Interface for accessing/generating/caching keys. */
export interface DesktopKeyStoreFacade {
	/**
	 * get the key used to encrypt alarms and settings
	 */
	getDeviceKey(): Promise<Aes256Key>

	/**
	 * get the key used to encrypt saved credentials
	 */
	getCredentialsKey(): Promise<Aes256Key>

	/**
	 * get the key used to encrypt the SQLCipher database
	 * this is encrypted using the credentials key
	 */
	getDatabaseKey(): Promise<Aes256Key>
}

export class KeyStoreFacadeImpl implements DesktopKeyStoreFacade {
	private readonly resolvedKeys: Map<NativeKeySpec, Promise<Aes256Key>> = new Map()

	constructor(
		private readonly secretStorage: SecretStorage,
		private readonly crypto: DesktopCryptoFacade
	) {
	}

	/** @inheritDoc */
	async getDeviceKey(): Promise<Aes256Key> {
		// Device key can be cached
		return this.resolveKey(DeviceKeySpec, null)
	}

	/** @inheritDoc */
	async getCredentialsKey(): Promise<Aes256Key> {
		return this.resolveKey(CredentialsKeySpec, null)
	}

	/** @inheritDoc */
	async getDatabaseKey(): Promise<Aes256Key> {
		const credentialsKey = await this.resolveKey(CredentialsKeySpec, null)
		return this.resolveKey(DatabaseKeySpec, credentialsKey)
	}

	private resolveKey(spec: NativeKeySpec, encryptWith: Aes256Key | null): Promise<Aes256Key> {
		// Asking for the same key in parallel easily breaks keytar/gnome-keyring so we cache the promise.
		const entry = getFromMap(this.resolvedKeys, spec, () => this.fetchOrGenerateKey(spec, encryptWith))

		if (spec.cached) {
			// We only want to cache *successful* promises, otherwise we have no chance to retry.
			return entry.catch((e) => {
				this.resolvedKeys.delete(spec)
				throw e
			})
		} else {
			// If we don't want to cache the key we remove it in any case.
			return entry.finally(() => {
				this.resolvedKeys.delete(spec)
			})
		}
	}

	private async fetchOrGenerateKey(spec: NativeKeySpec, encryptWith: Aes256Key | null): Promise<Aes256Key> {
		log.debug("resolving key...", spec.serviceName)
		try {
			return (await this.fetchKey(spec, encryptWith)) ?? (await this.generateAndStoreKey(spec, encryptWith))
		} catch (e) {
			log.warn("Failed to resolve/generate key: ", spec.serviceName, e)
			throw e
		}
	}

	private async fetchKey(spec: NativeKeySpec, encryptWith: Aes256Key | null): Promise<Aes256Key | null> {
		const base64 = await this.secretStorage.getPassword(spec.serviceName, spec.accountName)

		if (base64 == null) {
			return null
		}

		return this.maybeDecrypt(base64, encryptWith)

	}

	private async generateAndStoreKey(spec: NativeKeySpec, encryptWith: Aes256Key | null): Promise<Aes256Key> {
		log.warn(`key ${spec.serviceName} not found, generating a new one`)

		const key: Aes256Key = this.crypto.generateDeviceKey()

		const base64 = this.maybeEncrypt(key, encryptWith)

		await this.secretStorage.setPassword(spec.serviceName, spec.accountName, base64)
		return key
	}

	private maybeEncrypt(key: Aes256Key, encryptionKey: Aes256Key | null): Base64 {
		if (encryptionKey == null) {
			return keyToBase64(key)
		} else {
			return uint8ArrayToBase64(this.crypto.aes256Encrypt256Key(encryptionKey, key))
		}
	}

	private maybeDecrypt(base64: Base64, encryptionKey: Aes256Key | null): Aes256Key {
		if (encryptionKey == null) {
			return base64ToKey(base64)
		} else {
			return this.crypto.aes256Decrypt256Key(encryptionKey, base64ToUint8Array(base64))
		}
	}

}
