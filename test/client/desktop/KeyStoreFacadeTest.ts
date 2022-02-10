import o from "ospec"
import {CredentialsKeySpec, DatabaseKeySpec, DeviceKeySpec, KeyStoreFacadeImpl} from "../../../src/desktop/KeyStoreFacadeImpl"
import {DesktopCryptoFacade} from "../../../src/desktop/DesktopCryptoFacade"
import type {SecretStorage} from "../../../src/desktop/sse/SecretStorage"
import {keyToBase64, uint8ArrayToKey} from "@tutao/tutanota-crypto"
import {CancelledError} from "../../../src/api/common/error/CancelledError"
import {assertThrows} from "../../../packages/tutanota-test-utils/lib"
import {instance, matchers, object, reset, verify, when} from "testdouble"
import {uint8ArrayToBase64} from "@tutao/tutanota-utils"

const {anything, argThat} = matchers

function initKeyStoreFacade(secretStorage: SecretStorage, crypto: DesktopCryptoFacade): KeyStoreFacadeImpl {
	return new KeyStoreFacadeImpl(secretStorage, crypto)
}

o.spec("KeyStoreFacade test", function () {
	const aes256Key = uint8ArrayToKey(new Uint8Array([1, 2]))
	const secondAes256Key = uint8ArrayToKey(new Uint8Array([3, 4]))
	let cryptoFacadeSpy: DesktopCryptoFacade
	let secretStorageSpy: SecretStorage

	o.beforeEach(function () {
		cryptoFacadeSpy = instance(DesktopCryptoFacade)
		secretStorageSpy = object<SecretStorage>()

	})
	o.afterEach(function () {
		reset()
	})

	o.spec("getDeviceKey", function () {
		o("should return stored key", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))
			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			const actualKey = await keyStoreFacade.getDeviceKey()
			o(actualKey).deepEquals(aes256Key)
			verify(secretStorageSpy.getPassword(DeviceKeySpec.serviceName, DeviceKeySpec.accountName), {times: 1})
		})

		o("should store the key", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(null)
			when(cryptoFacadeSpy.generateDeviceKey()).thenReturn(aes256Key)
			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			await keyStoreFacade.getDeviceKey()
			verify(secretStorageSpy.setPassword(DeviceKeySpec.serviceName, DeviceKeySpec.accountName, keyToBase64(aes256Key)), {times: 1})
		})

		o("should cache successful key fetch", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))
			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			const actualKey = await keyStoreFacade.getDeviceKey()
			o(actualKey).deepEquals(aes256Key)

			const actualKey2 = await keyStoreFacade.getDeviceKey()
			o(actualKey2).deepEquals(aes256Key)

			verify(secretStorageSpy.getPassword(DeviceKeySpec.serviceName, DeviceKeySpec.accountName), {times: 1})
		})

		o("should not cache failures", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenReject(new CancelledError("Test"))

			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			await assertThrows(CancelledError, () => keyStoreFacade.getDeviceKey())

			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))
			const actualKey = await keyStoreFacade.getDeviceKey()
			o(actualKey).deepEquals(aes256Key)

			verify(secretStorageSpy.getPassword(DeviceKeySpec.serviceName, DeviceKeySpec.accountName), {times: 2})
		})
	})

	o.spec("getCredentialsKey", function () {
		o("should return stored key", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))

			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			const actualKey = await keyStoreFacade.getCredentialsKey()
			o(actualKey).deepEquals(aes256Key)

			verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 1})
		})

		o("should store the key", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(null)
			when(cryptoFacadeSpy.generateDeviceKey()).thenReturn(aes256Key)
			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			await keyStoreFacade.getCredentialsKey()

			verify(secretStorageSpy.setPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName, keyToBase64(aes256Key)), {times: 1})
		})

		o("should NOT cache successful key fetch", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))

			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			const actualKey = await keyStoreFacade.getCredentialsKey()
			o(actualKey).deepEquals(aes256Key)

			const actualKey2 = await keyStoreFacade.getCredentialsKey()
			o(actualKey2).deepEquals(aes256Key)

			verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 2})
		})

		o("should not cache failures", async function () {
			when(secretStorageSpy.getPassword(anything(), anything())).thenReject(new CancelledError("Test"))

			const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
			await assertThrows(CancelledError, () => keyStoreFacade.getCredentialsKey())

			when(secretStorageSpy.getPassword(anything(), anything())).thenResolve(keyToBase64(aes256Key))
			const actualKey = await keyStoreFacade.getCredentialsKey()
			o(actualKey).deepEquals(aes256Key)

			verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 2})
		})

		o.spec("database key", function () {
			o("When an encrypted database key is sored, it is decrypted with the credentials key and then returned", async function () {

				when(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName)).thenResolve(keyToBase64(aes256Key))
				const encryptedDatabaseKey = new Uint8Array([1, 2, 3])
				when(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName)).thenResolve(uint8ArrayToBase64(encryptedDatabaseKey))
				when(cryptoFacadeSpy.aes256Decrypt256Key(aes256Key, encryptedDatabaseKey)).thenReturn(secondAes256Key)


				const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
				const actualKey = await keyStoreFacade.getDatabaseKey()
				o(actualKey).deepEquals(secondAes256Key)

				verify(cryptoFacadeSpy.aes256Decrypt256Key(aes256Key, encryptedDatabaseKey), {times: 1})
				verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 1})
				verify(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName), {times: 1})
			})

			o("When no encrypted database key is stored a new key is created, encrypted and stored", async function () {
				when(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName)).thenResolve(keyToBase64(aes256Key))
				when(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName)).thenResolve(null)

				when(cryptoFacadeSpy.generateDeviceKey()).thenReturn(secondAes256Key)
				const encryptedDatabaseKey = new Uint8Array([1, 2, 3])
				when(cryptoFacadeSpy.aes256Encrypt256Key(aes256Key, secondAes256Key)).thenReturn(encryptedDatabaseKey)


				const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
				await keyStoreFacade.getDatabaseKey()

				//The key is encrypted
				verify(cryptoFacadeSpy.aes256Encrypt256Key(aes256Key, secondAes256Key), {times: 1})
				//The key is stored encrypted
				verify(secretStorageSpy.setPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName, uint8ArrayToBase64(encryptedDatabaseKey)), {times: 1})
			})
			o("should NOT cache successful key fetch", async function () {
				when(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName)).thenResolve(keyToBase64(aes256Key))
				const encryptedDatabaseKey = new Uint8Array([1, 2, 3])
				when(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName)).thenResolve(uint8ArrayToBase64(encryptedDatabaseKey))
				when(cryptoFacadeSpy.aes256Decrypt256Key(aes256Key, encryptedDatabaseKey)).thenReturn(secondAes256Key)

				const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
				const actualKey = await keyStoreFacade.getDatabaseKey()
				o(actualKey).deepEquals(secondAes256Key)

				const actualKey2 = await keyStoreFacade.getDatabaseKey()
				o(actualKey2).deepEquals(secondAes256Key)

				verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 2})
				verify(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName), {times: 2})
			})
			o("should not cache failures", async function () {
				when(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName)).thenResolve(keyToBase64(aes256Key))
				when(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName)).thenReject(new CancelledError("Test"))

				const keyStoreFacade = initKeyStoreFacade(secretStorageSpy, cryptoFacadeSpy)
				await assertThrows(CancelledError, () => keyStoreFacade.getDatabaseKey())

				const encryptedDatabaseKey = new Uint8Array([1, 2, 3])
				when(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName)).thenResolve(uint8ArrayToBase64(encryptedDatabaseKey))
				when(cryptoFacadeSpy.aes256Decrypt256Key(aes256Key, encryptedDatabaseKey)).thenReturn(secondAes256Key)
				const actualKey = await keyStoreFacade.getDatabaseKey()
				o(actualKey).deepEquals(secondAes256Key)

				verify(secretStorageSpy.getPassword(CredentialsKeySpec.serviceName, CredentialsKeySpec.accountName), {times: 2})
				verify(secretStorageSpy.getPassword(DatabaseKeySpec.serviceName, DatabaseKeySpec.accountName), {times: 2})
			})


		})

	})
})