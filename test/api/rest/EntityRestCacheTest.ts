import o from "ospec"
import {CacheStorage, EntityRestCache, expandId} from "../../../src/api/worker/rest/EntityRestCache"
import type {MailBody} from "../../../src/api/entities/tutanota/MailBody"
import {createMailBody, MailBodyTypeRef} from "../../../src/api/entities/tutanota/MailBody"
import {OperationType} from "../../../src/api/common/TutanotaConstants"
import type {EntityUpdate} from "../../../src/api/entities/sys/EntityUpdate"
import {createEntityUpdate} from "../../../src/api/entities/sys/EntityUpdate"
import type {Mail} from "../../../src/api/entities/tutanota/Mail"
import {createMail, MailTypeRef} from "../../../src/api/entities/tutanota/Mail"
import {assertNotNull, clone, downcast, isSameTypeRef, neverNull, TypeRef} from "@tutao/tutanota-utils"
import {createExternalUserReference, ExternalUserReferenceTypeRef} from "../../../src/api/entities/sys/ExternalUserReference"
import {NotAuthorizedError, NotFoundError} from "../../../src/api/common/error/RestError"
import {EntityRestClient, typeRefToPath} from "../../../src/api/worker/rest/EntityRestClient"
import {CUSTOM_MIN_ID, GENERATED_MAX_ID, GENERATED_MIN_ID, getElementId, getListId, stringToCustomId} from "../../../src/api/common/utils/EntityUtils";
import {ContactTypeRef, createContact} from "../../../src/api/entities/tutanota/Contact"
import {createCustomer, CustomerTypeRef} from "../../../src/api/entities/sys/Customer"
import {assertThrows, mockAttribute, unmockAttribute} from "@tutao/tutanota-test-utils"
import {createPermission, PermissionTypeRef} from "../../../src/api/entities/sys/Permission"
import {OfflineStorage} from "../../../src/api/worker/rest/OfflineStorage"
import {EphemeralCacheStorage} from "../../../src/api/worker/rest/EphemeralCacheStorage"
import {QueuedBatch} from "../../../src/api/worker/search/EventQueue"

type UserIdProvider = () => Id | null

async function getOfflineStorage(userIdProvider: UserIdProvider): Promise<CacheStorage> {
	const {OfflineDbFacade} = await import("../../../src/desktop/db/OfflineDbFacade.js")
	const {OfflineDb} = await import("../../../src/desktop/db/OfflineDb.js")
	const offlineDbFactory = async (userId: string) => {
		assertNotNull(userId)
		// Added by sqliteNativeBannerPlugin
		const nativePath = globalThis.buildOptions.sqliteNativePath
		const db = new OfflineDb(nativePath)
		await db.init(":memory:")
		return db
	}
	const offlineDbFacade = new OfflineDbFacade(offlineDbFactory)
	return new OfflineStorage(offlineDbFacade, userIdProvider)
}

async function getEphemeralStorage(): Promise<EphemeralCacheStorage> {
	return new EphemeralCacheStorage()
}

testEntityRestCache("ephemeral", getEphemeralStorage)
node(() => testEntityRestCache("offline", getOfflineStorage))()

export function testEntityRestCache(name: string, getStorage: (userIdProvider: UserIdProvider) => Promise<CacheStorage>) {
	const groupId = "groupId"
	const batchId = "batchId"
	o.spec("entity rest cache " + name, function () {
		let storage: CacheStorage
		let cache: EntityRestCache

		// The entity client will assert to throwing if an unexpected method is called
		// You can mock it's attributes if you want to assert that a given method will be called
		let entityRestClient
		let userIdProvider: UserIdProvider


		let createUpdate = function (
			typeRef: TypeRef<any>,
			listId: Id,
			id: Id,
			operation: OperationType,
		): EntityUpdate {
			let eu = createEntityUpdate()
			eu.application = typeRef.app
			eu.type = typeRef.type
			eu.instanceListId = listId
			eu.instanceId = id
			eu.operation = operation
			return eu
		}

		let createId = function (idText) {
			return Array(13 - idText.length).join("-") + idText
		}

		let createBodyInstance = function (id, bodyText): MailBody {
			let body = createMailBody()
			body._id = createId(id)
			body.text = bodyText
			return body
		}

		let createMailInstance = function (listId, id, subject): Mail {
			let mail = createMail()
			mail._id = [listId, createId(id)]
			mail.subject = subject ?? ""
			return mail
		}

		function mockRestClient(): EntityRestClient {
			let notToBeCalled = function (name: string) {
				return function (...args) {
					throw new Error(name + " should not have been called. arguments: " + String(args))
				}
			}

			return downcast({
				load: notToBeCalled("load"),
				loadRange: notToBeCalled("loadRange"),
				loadMultiple: notToBeCalled("loadMultiple"),
				setup: notToBeCalled("setup"),
				setupMultiple: notToBeCalled("setupMultiple"),
				update: notToBeCalled("update"),
				erase: notToBeCalled("erase"),
				entityEventsReceived: e => Promise.resolve(e),
			})
		}

		o.beforeEach(async function () {
			userIdProvider = () => "userId"
			storage = await getStorage(userIdProvider)
			entityRestClient = mockRestClient()
			cache = new EntityRestCache(entityRestClient, storage)

		})

		o.spec("entityEventsReceived", function () {
			const path = typeRefToPath(ContactTypeRef)
			const contactListId1 = "contactListId1"
			const contactListId2 = "contactListId2"
			const id1 = "id1"
			const id2 = "id2"
			const id3 = "id3"
			const id4 = "id4"
			const id5 = "id5"
			const id7 = "id7"

			o("writes batch meta on entity update", async function () {
				const contact1 = createContact({_id: [contactListId1, id1]})
				const contact2 = createContact({_id: [contactListId1, id2]})

				const batch = [
					createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
					createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE)
				]
				const loadMultiple = o.spy(function (typeRef, listId, ids,) {
					return Promise.resolve([contact1, contact2])
				})
				const mock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
				const mock2 = mockAttribute(storage, storage.putLastBatchIdForGroup, () => {
					return Promise.resolve(undefined)
				})
				await cache.entityEventsReceived(makeBatch(batch))
				await cache.getLastEntityEventBatchForGroup(groupId)
				o(storage.putLastBatchIdForGroup.callCount).equals(1)("putLastBatchMeta is called")
				o(storage.putLastBatchIdForGroup.args).deepEquals([groupId, batchId])
				unmockAttribute(mock)
				unmockAttribute(mock2)
			})

			o.spec("postMultiple", async function () {
				o.beforeEach(async function () {
					await storage.setNewRangeForList(ContactTypeRef, contactListId1, id1, id7)
					await storage.setNewRangeForList(ContactTypeRef, contactListId2, id1, id7)
				})
				o("entity events received should call loadMultiple when receiving updates from a postMultiple", async function () {
					const contact1 = createContact({_id: [contactListId1, id1]})
					const contact2 = createContact({_id: [contactListId1, id2]})

					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE)
					]
					const loadMultiple = o.spy(function (typeRef, listId, ids,) {
						o(isSameTypeRef(typeRef, ContactTypeRef)).equals(true)
						o(listId).equals(contactListId1)
						o(ids).deepEquals(["id1", "id2"])
						return Promise.resolve([contact1, contact2])
					})
					const mock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const updates = await cache.entityEventsReceived(makeBatch(batch))
					unmockAttribute(mock)
					o(loadMultiple.callCount).equals(1)("loadMultiple is called")
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).notEquals(null)
					o(updates).deepEquals(batch)
				})

				o("post multiple with different update type and list ids should make multiple load calls", async function () {
					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id3, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id4, OperationType.CREATE),
						createUpdate(CustomerTypeRef, null as any, id5, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.UPDATE),
					]
					const load = o.spy(function (typeRef, id) {
						const {listId, elementId} = expandId(id)

						if (isSameTypeRef(typeRef, ContactTypeRef)) {
							o(elementId).equals(id2)
							return Promise.resolve(
								createContact({
									_id: [neverNull(listId), elementId],
								}),
							)
						} else if (isSameTypeRef(typeRef, CustomerTypeRef)) {
							o(["id5", "id6", "id7"].includes(elementId)).equals(true)
							return Promise.resolve(
								createCustomer({
									_id: elementId,
								}),
							)
						}
						throw new Error("should not be reached")
					})
					const loadMultiple = o.spy(function (typeRef, listId, ids) {
						if (isSameTypeRef(typeRef, ContactTypeRef)) {
							if (listId === contactListId1) {
								o(ids).deepEquals(["id1", "id2"])
								return Promise.resolve([
									createContact({
										_id: [listId, id1],
									}),
									createContact({
										_id: [listId, id2],
									}),
								])
							} else if (listId === contactListId2) {
								o(ids).deepEquals(["id3", "id4"])
								return Promise.resolve([
									createContact({
										_id: [listId, "id3"],
									}),
									createContact({
										_id: [listId, "id4"],
									}),
								])
							}
						}
						throw new Error("should not be reached")
					})


					const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
					const loadMultipleMock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const filteredUpdates = await cache.entityEventsReceived(makeBatch(batch))
					unmockAttribute(loadMock)
					unmockAttribute(loadMultipleMock)
					o(load.callCount).equals(1)("One load for the customer create")
					o(loadMultiple.callCount).equals(2)("Two load multiple, one for each contact list")
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id3)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id4)).notEquals(null)
					o(await storage.get(CustomerTypeRef, null, id5)).equals(null)
					o(filteredUpdates.length).equals(batch.length)
					for (const update of batch) {
						o(filteredUpdates.includes(update)).equals(true)
					}
				})

				o("returns empty [] when loadMultiple throwing an error ", async function () {
					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id3, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id4, OperationType.CREATE)
					]
					const loadMultiple = o.spy(function (typeRef, listId, ids) {
						o(isSameTypeRef(typeRef, ContactTypeRef)).equals(true)

						if (listId === contactListId1) {
							o(ids).deepEquals(["id1", "id2"])
							return Promise.resolve([
								createContact({
									_id: [listId, id1],
								}),
								createContact({
									_id: [listId, id2],
								}),
							])
						} else if (listId === contactListId2) {
							o(ids).deepEquals(["id3", "id4"])
							return Promise.reject(new NotAuthorizedError("bam"))
						}
					})
					const loadMultipleMock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const updates = await cache.entityEventsReceived(makeBatch(batch))
					unmockAttribute(loadMultipleMock)

					o(loadMultiple.callCount).equals(2)
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id3)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id4)).equals(null)
					o(updates).deepEquals(batch.slice(0, 2))
				})
			})
			o.spec("post  multiple cache range", function () {
				o("update is not in cache range", async function () {

					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE)
					]
					const updates = await cache.entityEventsReceived(makeBatch(batch))

					o(await storage.get(ContactTypeRef, contactListId1, id1)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).equals(null)
					o(updates).deepEquals(batch)
				})

				o("updates partially not loaded by loadMultiple", async function () {
					await storage.setNewRangeForList(ContactTypeRef, contactListId1, id1, id2)

					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE),
					]
					const loadMultiple = o.spy(function (typeRef, listId, ids) {
						if (isSameTypeRef(typeRef, ContactTypeRef)) {
							if (listId === contactListId1) {
								o(ids).deepEquals(["id1", "id2"])
								return Promise.resolve([
									createContact({_id: [listId, id1]})
								])
							}
						}
						throw new Error("should not be reached")
					})
					const loadMultipleMock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const filteredUpdates = await cache.entityEventsReceived(makeBatch(batch))
					unmockAttribute(loadMultipleMock)

					o(loadMultiple.callCount).equals(1)
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).equals(null)
					o(filteredUpdates.length).equals(batch.length - 1)
					for (const update of batch.slice(0, 1)) {
						o(filteredUpdates.includes(update)).equals(true)
					}
				})

				o("update are partially in cache range ", async function () {
					await storage.setNewRangeForList(ContactTypeRef, contactListId1, id1, id1)
					await storage.setNewRangeForList(ContactTypeRef, contactListId2, id4, id4)

					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id3, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id4, OperationType.CREATE),
					]
					const loadMultiple = o.spy(function (typeRef, listId, ids) {
						if (isSameTypeRef(typeRef, ContactTypeRef)) {
							if (listId === contactListId1) {
								o(ids).deepEquals(["id1"])
								return Promise.resolve([
									createContact({
										_id: [listId, id1],
									}),
								])
							} else if (listId === contactListId2) {
								o(ids).deepEquals(["id4"])
								return Promise.resolve([
									createContact({
										_id: [listId, "id4"],
									}),
								])
							}
						}
						throw new Error("should not be reached")
					})
					const loadMultipleMock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const filteredUpdates = await cache.entityEventsReceived(makeBatch(batch))
					unmockAttribute(loadMultipleMock)
					o(loadMultiple.callCount).equals(2) // twice for contact creations (per list id)
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id3)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id4)).notEquals(null)
					o(filteredUpdates.length).equals(batch.length)
					for (const update of batch) {
						o(filteredUpdates.includes(update)).equals(true)
					}
				})
				o("update  partially results in NotAuthorizedError ", async function () {
					await storage.setNewRangeForList(ContactTypeRef, contactListId1, id1, id1)
					await storage.setNewRangeForList(ContactTypeRef, contactListId2, id4, id4)

					const batch = [
						createUpdate(ContactTypeRef, contactListId1, id1, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId1, id2, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id3, OperationType.CREATE),
						createUpdate(ContactTypeRef, contactListId2, id4, OperationType.CREATE),
					]
					const loadMultiple = o.spy(function (typeRef, listId, ids) {
						if (isSameTypeRef(typeRef, ContactTypeRef)) {
							if (listId === contactListId1) {
								o(ids).deepEquals(["id1"])
								return Promise.resolve([
									createContact({
										_id: [listId, id1],
									}),
								])
							} else if (listId === contactListId2) {
								o(ids).deepEquals(["id4"])
								return Promise.reject(new NotAuthorizedError("bam"))
							}
						}
						throw new Error("should not be reached")
					})
					const loadMultipleMock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)
					const filteredUpdates = await cache.entityEventsReceived(makeBatch(batch))
					o(loadMultiple.callCount).equals(2) // twice for contact creations (per list id)
					o(await storage.get(ContactTypeRef, contactListId1, id1)).notEquals(null)
					o(await storage.get(ContactTypeRef, contactListId1, id2)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id3)).equals(null)
					o(await storage.get(ContactTypeRef, contactListId2, id4)).equals(null)
					o(filteredUpdates.length).equals(batch.length - 1)
					for (const update of batch.slice(0, 3)) {
						o(filteredUpdates.includes(update)).equals(true)
					}
					unmockAttribute(loadMultipleMock)
				})
			})
			o("element create notifications are not loaded from server", async function () {
				await cache.entityEventsReceived(makeBatch([createUpdate(MailBodyTypeRef, null as any, "id1", OperationType.CREATE)]))
			})

			o("element update notifications are not put into cache", async function () {
				await cache.entityEventsReceived(makeBatch([createUpdate(MailBodyTypeRef, null as any, "id1", OperationType.UPDATE)]))
			})

			// element notifications
			o("Update event for cached entity is received, it should be redownloaded", async function () {
				let initialBody = createBodyInstance("id1", "hello")
				await storage.put(initialBody)

				const load = o.spy(async () => createBodyInstance("id1", "goodbye"))
				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailBodyTypeRef, null as any, createId("id1"), OperationType.UPDATE),
				]))
				o(load.callCount).equals(1) // entity is loaded from server
// @ts-ignore
				o(isSameTypeRef(load.args[0], MailBodyTypeRef)).equals(true)
				// @ts-ignore
				o(load.args[1]).equals(createId("id1"))
				const body = await cache.load(MailBodyTypeRef, createId("id1"))
				o(body.text).equals("goodbye")
				o(load.callCount).equals(1) // entity is provided from cache

				unmockAttribute(loadMock)
			})
			o("element should be deleted from the cache when a delete event is received", async function () {
				let initialBody = createBodyInstance("id1", "hello")
				await storage.put(initialBody)

				const load = o.spy(function () {
					return Promise.reject(new NotFoundError("not found"))
				})
				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailBodyTypeRef, null as any, createId("id1"), OperationType.DELETE),
				]))
				// entity is not loaded from server when it is deleted
				o(load.callCount).equals(0)
				await assertThrows(NotFoundError, () => cache.load(MailBodyTypeRef, createId("id1")))
				unmockAttribute(loadMock)

				// we tried to reload the mail body using the rest client, because it was removed from the cache
				o(load.callCount).equals(1)
			})

			o("Mail should not be loaded when a move event is received", async function () {
				const instance = createMailInstance("listId1", "id1", "henlo")
				await storage.put(instance)

				const newListId = "listid2"
				const newInstance = clone(instance)
				newInstance._id = [newListId, getElementId(instance)]

				// The moved mail will not be loaded from the server
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, getListId(instance), getElementId(instance), OperationType.DELETE),
					createUpdate(MailTypeRef, newListId, getElementId(instance), OperationType.CREATE),
				]))

				const load = o.spy(() => Promise.reject(new Error("error from test")))
				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				const thrown = await assertThrows(Error, () =>
					cache.load(MailTypeRef, [getListId(instance), getElementId(instance)]),
				)
				o(thrown.message).equals("error from test")
				o(load.callCount).equals(1)("load is called once")
				const result2 = await cache.load(MailTypeRef, [newListId, getElementId(instance)])
				o(result2).deepEquals(newInstance)("Cached instance is a newInstance")
				unmockAttribute(loadMock)
			})

			o("id is in range but instance doesn't exist after moving lower range", async function () {
				const mails = [1, 2, 3].map(i => createMailInstance("listId1", "id" + i, "mail" + i))
				const newListId = "listId2"

				const loadRange = o.spy(() => Promise.resolve(mails))
				const loadRangeMock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 3, false)
				o(loadRange.callCount).equals(1)
				unmockAttribute(loadRangeMock)

				// Move mail event: we don't try to load the mail again, we just update our cached mail
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, getListId(mails[0]), getElementId(mails[0]), OperationType.DELETE),
					createUpdate(MailTypeRef, newListId, getElementId(mails[0]), OperationType.CREATE),
				]))

				// id3 was moved to another list, which means it is no longer cached, which means we should try to load it again (causing NotFoundError)
				const load = o.spy(() => Promise.reject(new Error("This is not the mail you're looking for")))
				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				const thrown = await assertThrows(Error, () =>
					cache.load(MailTypeRef, ["listId1", getElementId(mails[0])]),
				)
				o(thrown.message).equals("This is not the mail you're looking for")
				o(load.callCount).equals(1)
				unmockAttribute(loadMock)
			})


			o("id is in range but instance doesn't exist after moving upper range", async function () {
				const mails = [
					createMailInstance("listId1", "id1", "mail 1"),
					createMailInstance("listId1", "id2", "mail 2"),
					createMailInstance("listId1", "id3", "mail 3"),
				]

				const loadRange = o.spy(async () => Promise.resolve(mails))
				const loadRangeMock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 3, false)
				o(loadRange.callCount).equals(1)

				unmockAttribute(loadRangeMock)

				// Move mail event: we don't try to load the mail again, we just update our cached mail
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, "listId1", "id3", OperationType.DELETE),
					createUpdate(MailTypeRef, "listId2", "id3", OperationType.CREATE),
				]))

				// id3 was moved to another list, which means it is no longer cached, which means we should try to load it again when requested (causing NotFoundError)
				const load = o.spy(async function () {
					throw new Error("This is not the mail you're looking for")
				})
				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				const thrown = await assertThrows(Error, () => cache.load(MailTypeRef, ["listId1", "id3"]))
				o(thrown.message).equals("This is not the mail you're looking for")
				//load was called when we tried to load the moved mail when we tried to load the moved mail
				o(load.callCount).equals(1)
				unmockAttribute(loadMock)
			})

			// list element notifications
			o("list element create notifications are not put into cache", async function () {
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, "listId1", createId("id1"), OperationType.CREATE),
				]))
			})

			o("list element update notifications are not put into cache", async function () {
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, "listId1", createId("id1"), OperationType.UPDATE),
				]))
			})

			o("list element is updated in cache", async function () {
				let initialMail = createMailInstance("listId1", createId("id1"), "hello")
				await storage.put(initialMail)

				let mailUpdate = createMailInstance("listId1", createId("id1"), "goodbye")
				const load = o.spy(function (typeRef, id) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(id).deepEquals(["listId1", createId("id1")])
					return Promise.resolve(mailUpdate)
				})

				const loadMock = mockAttribute(entityRestClient, entityRestClient.load, load)
				await cache.entityEventsReceived(makeBatch([
					createUpdate(MailTypeRef, "listId1", createId("id1"), OperationType.UPDATE),
				]))
				o(load.callCount).equals(1) // entity is loaded from server

				const mail = await cache.load(MailTypeRef, ["listId1", createId("id1")])
				o(mail.subject).equals("goodbye")
				o(load.callCount).equals(1) // entity is provided from cache

				unmockAttribute(loadMock)
			})

			o("when deleted from a range, then the remaining range will still be retrieved from the cache", async function () {
					const originalMails = await setupMailList(true, true)
					// no load should be called
					await cache.entityEventsReceived(makeBatch([
						createUpdate(MailTypeRef, "listId1", createId("id2"), OperationType.DELETE),
					]))
					const mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 4, false)
					// The entity is provided from the cache
					o(mails).deepEquals([originalMails[0], originalMails[2]])
				},
			)
			o("when reading from the cache, the entities will be cloned", async function () {
				let body = createBodyInstance("id1", "hello")

				await storage.put(body)

				const body1 = await cache.load(MailBodyTypeRef, createId("id1"))
				o(body1 == body).equals(false)
				const body2 = await cache.load(MailBodyTypeRef, createId("id1"))
				o(body1 == body2).equals(false)
			})


			o("when reading from the cache, the entities will be cloned pt.2", async function () {
				let mail = createMailInstance("listId1", "id1", "hello")
				await storage.put(mail)
				const mail1 = await cache.load(MailTypeRef, ["listId1", createId("id1")])
				o(mail1 == mail).equals(false)
				const mail2 = await cache.load(MailTypeRef, ["listId1", createId("id1")])
				o(mail1 == mail2).equals(false)
			})

			async function setupMailList(loadedUntilMinId: boolean, loadedUntilMaxId: boolean): Promise<Mail[]> {
				let mail1 = createMailInstance("listId1", "id1", "hello1")
				let mail2 = createMailInstance("listId1", "id2", "hello2")
				let mail3 = createMailInstance("listId1", "id3", "hello3")
				let startId = loadedUntilMaxId ? GENERATED_MAX_ID : createId("id4")
				let count = loadedUntilMinId ? 4 : 3
				const loadRange = o.spy(function (typeRef, listId, start, countParam, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(startId)
					o(countParam).equals(count)
					o(reverse).equals(true)
					return Promise.resolve([mail3, mail2, mail1])
				})
				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				// load the mails in reverse because this is the mail use case. return them in reverse to have the intuitive order
				const mails = await cache.loadRange(MailTypeRef, "listId1", startId, count, true)
				o(mails).deepEquals(clone([mail3, mail2, mail1]))
				o(loadRange.callCount).equals(1) // entities are loaded from server
				unmockAttribute(mock)
				return clone([mail1, mail2, mail3])
			}

			o("when reading from the cache, the entities will be cloned (range requests)", async function () {
				const originalMails = await setupMailList(true, true)

				// the range request will be provided from the cache
				const mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 3, false)
				o(mails).deepEquals(originalMails)
				o(mails[0] == originalMails[0]).equals(false)
				o(mails[1] == originalMails[1]).equals(false)
				o(mails[2] == originalMails[2]).equals(false)
			})

			o("list elements are provided from cache - range min to max loaded", async function () {
				const originalMails = await setupMailList(true, true)

				let mails

				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 3, false)
				o(mails).deepEquals(originalMails)

				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 1, false)
				o(mails).deepEquals(originalMails.slice(0, 1))

				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 4, false)
				o(mails).deepEquals(originalMails)

				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id1"), 2, false)
				o(mails).deepEquals(originalMails.slice(1, 3))

				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MAX_ID, 3, true)
				o(mails).deepEquals([originalMails[2], originalMails[1], originalMails[0]])

				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 1, true)
				o(mails).deepEquals(originalMails.slice(0, 1))

				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 3, true)
				o(mails).deepEquals(originalMails.slice(0, 1))
			})

			o("list elements are provided from cache - range min to id3 loaded", async function () {
				const originalMails = await setupMailList(true, false)
				let mails
				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 3, false)
				o(mails).deepEquals(originalMails)
				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 1, false)
				o(mails).deepEquals(originalMails.slice(0, 1))
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id1"), 2, false)
				o(mails).deepEquals(originalMails.slice(1, 3))
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 1, true)
				o(mails).deepEquals(originalMails.slice(0, 1))
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 3, true)
				o(mails).deepEquals(originalMails.slice(0, 1))
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id0"), 3, true)
				o(mails).deepEquals([])

			})

			o("list elements are provided from cache - range max to id1 loaded", async function () {
				const originalMails = await setupMailList(false, true)
				let mails
				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MAX_ID, 3, true)
				o(mails).deepEquals([originalMails[2], originalMails[1], originalMails[0]])
				mails = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MAX_ID, 2, true)
				o(mails).deepEquals([originalMails[2], originalMails[1]])
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id5"), 1, false)
				o(mails).deepEquals([])

				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 1, true)
				o(mails).deepEquals(originalMails.slice(0, 1))
				mails = await cache.loadRange(MailTypeRef, "listId1", createId("id1"), 2, false)
				o(mails).deepEquals(originalMails.slice(1, 3))
			})

			o("load list elements partly from server - range min to id3 loaded", async function () {
				let mail4 = createMailInstance("listId1", "id4", "subject4")
				const cachedMails = await setupMailList(true, false)
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(getElementId(cachedMails[2]))
					o(count).equals(1)
					o(reverse).equals(false)
					return Promise.resolve([mail4])
				})

				const loadRangeMock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				const result = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MIN_ID, 4, false)

				o(result).deepEquals([cachedMails[0], cachedMails[1], cachedMails[2], clone(mail4)])
				o((await storage.get(MailTypeRef, getListId(mail4), getElementId(mail4)))!).deepEquals(mail4)
				o(loadRange.callCount).equals(1) // entities are provided from server

				unmockAttribute(loadRangeMock)
			})


			o("when part of a range is already in cache, load range should only try to load what it doesn't have already", async function () {
					let mail0 = createMailInstance("listId1", "id0", "subject0")
					const cachedMails = await setupMailList(false, true)
					const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
						o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
						o(listId).equals("listId1")
						o(start).equals(getElementId(cachedMails[0]))
						o(count).equals(3)
						o(reverse).equals(true)
						return Promise.resolve([mail0])
					})

					const loadRangeMock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
					const result = await cache.loadRange(MailTypeRef, "listId1", createId("id2"), 4, true)


					o((await storage.get(MailTypeRef, getListId(mail0), getElementId(mail0)))!).deepEquals(mail0)
					o(result).deepEquals([cachedMails[0], clone(mail0)])
					o(loadRange.callCount).equals(1) // entities are provided from server
					unmockAttribute(loadRangeMock)
				},
			)
			o("load list elements partly from server - range max to id2 loaded - loadMore", async function () {
				let mail0 = createMailInstance("listId1", "id0", "subject0")
				const cachedMails = await setupMailList(false, true)
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(cachedMails[0]._id[1])
					o(count).equals(4)
					o(reverse).equals(true)
					return Promise.resolve([mail0])
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				const result = await cache.loadRange(MailTypeRef, "listId1", createId("id1"), 4, true)

				o((await storage.get(MailTypeRef, getListId(mail0), getElementId(mail0)))!).deepEquals(mail0)
				o(result).deepEquals([clone(mail0)])
				o(loadRange.callCount).equals(1) // entities are provided from server
				unmockAttribute(mock)
			})


			o("load range starting outside of stored range - not reverse", async function () {
				let mail5 = createMailInstance("listId1", "id5", "subject5")
				let mail6 = createMailInstance("listId1", "id6", "subject6")
				const cachedMails = await setupMailList(true, false)
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(createId("id4"))
					o(count).equals(4)
					// the cache actually loads from the end of the range which is id4
					//TODO  shouldn't it be id3?
					o(reverse).equals(false)
					return Promise.resolve([mail5, mail6])
				})

				const loadRangeMock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				const result = await cache.loadRange(MailTypeRef, "listId1", createId("id5"), 4, false)

				o(loadRange.callCount).equals(1) // entities are provided from server
				o(result).deepEquals([clone(mail6)])

				// further range reads are fully taken from range
				const result2 = await cache.loadRange(MailTypeRef, "listId1", createId("id1"), 4, false)

				o(loadRange.callCount).equals(1) // entities are provided from cache
				o(result2).deepEquals([cachedMails[1], cachedMails[2], clone(mail5), clone(mail6)])
				unmockAttribute(loadRangeMock)
			})


			o("load range starting outside of stored range - reverse", async function () {
				let mailFirst = createMailInstance("listId1", "ic5", "subject") // use ids smaller than "id1"
				let mailSecond = createMailInstance("listId1", "ic8", "subject")
				await setupMailList(false, false)
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					// the cache actually loads from the end of the range which is id1
					o(start).equals(createId("id1"))
					o(count).equals(4)
					o(reverse).equals(true)
					return Promise.resolve([mailSecond, mailFirst])
				})
				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				const result = await cache.loadRange(MailTypeRef, "listId1", createId("ic6"), 4, true)

				o(result).deepEquals([clone(mailFirst)])
				o((await storage.get(MailTypeRef, getListId(mailFirst), getElementId(mailFirst)))!).deepEquals(mailFirst)
				o(loadRange.callCount).equals(1) // entities are provided from server
				unmockAttribute(mock)
			})


			o("reverse load range starting outside of stored range - no new elements", async function () {
				await setupMailList(false, false)
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					// the cache actually loads from the end of the range which is id1
					o(start).equals(createId("id1"))
					o(count).equals(4)
					o(reverse).equals(true)
					return Promise.resolve([])
				})
				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				const result = await cache.loadRange(MailTypeRef, "listId1", createId("ic6"), 4, true)
				o(result).deepEquals([])
				o(loadRange.callCount).equals(1) // entities are provided from server
				unmockAttribute(mock)
			})

			o("no elements in range", async function () {
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, MailTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(GENERATED_MAX_ID)
					o(count).equals(100)
					o(reverse).equals(true)
					return Promise.resolve([])
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				const result = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MAX_ID, 100, true)

				o(result).deepEquals([])

				const result2 = await cache.loadRange(MailTypeRef, "listId1", GENERATED_MAX_ID, 100, true)

				o(result2).deepEquals([])
				o(loadRange.callCount).equals(1) // entities are only initially tried to be loaded from server
				unmockAttribute(mock)
			})


			o("custom id range is not stored", async function () {
				let ref = clone(createExternalUserReference())
				ref._id = ["listId1", stringToCustomId("custom")]
				const loadRange = o.spy(function (typeRef, listId, start, count, reverse) {
					o(isSameTypeRef(typeRef, ExternalUserReferenceTypeRef)).equals(true)
					o(listId).equals("listId1")
					o(start).equals(CUSTOM_MIN_ID)
					o(count).equals(1)
					o(reverse).equals(false)
					return Promise.resolve([ref])
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)
				const result1 = await cache.loadRange(ExternalUserReferenceTypeRef, "listId1", CUSTOM_MIN_ID, 1, false)

				o(result1).deepEquals([ref])
				const result2 = await cache.loadRange(ExternalUserReferenceTypeRef, "listId1", CUSTOM_MIN_ID, 1, false)

				o(result2).deepEquals([ref])
				o(loadRange.callCount).equals(2) // entities are always provided from server
				unmockAttribute(mock)
			})


			o("Load towards the range with start being before the existing range. Range will be extended. Reverse. ", async function () {
				const ids = [createId("1"), createId("2"), createId("3"), createId("4"), createId("5")]
				const listId1 = "listId1"
				const mail1 = createMailInstance(listId1, ids[0], "hello1")
				const mail2 = createMailInstance(listId1, ids[1], "hello2")
				const mail3 = createMailInstance(listId1, ids[2], "hello3")

				await storage.setNewRangeForList(MailTypeRef, listId1, ids[0], ids[2])
				for (const mail of [mail1, mail2, mail3]) {
					await storage.put(mail)
				}
				const moreMails = new Map()
				moreMails.set(ids[3], createMailInstance(listId1, ids[3], "hello4"))
				moreMails.set(ids[4], createMailInstance(listId1, ids[4], "hello5"))


				const loadRange = o.spy(function (...an) {
					return Promise.resolve([moreMails.get(ids[3]), moreMails.get(ids[4])])
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				const originalUpper = (await storage.getRangeForList(MailTypeRef, listId1))?.upper

				const result1 = await cache.loadRange(MailTypeRef, listId1, GENERATED_MAX_ID, 5, true)

				o(loadRange.callCount).equals(1)("entities are provided from server")
				o(loadRange.args[2]).equals(originalUpper)("starts extending range beginning with upperId")
				o(await storage.isElementIdInCacheRange(MailTypeRef, listId1, GENERATED_MAX_ID)).equals(true)("MAX ID is in cache range")
				const expectedResult = [
					moreMails.get(ids[4]), moreMails.get(ids[3]), mail3, mail2, mail1
				]
				o(result1).deepEquals(expectedResult)("Returns all elements in reverse order")


				// further requests are resolved from the cache
				const result2 = await cache.loadRange(MailTypeRef, listId1, GENERATED_MAX_ID, 5, true)

				o(result2).deepEquals(expectedResult)
				o(loadRange.callCount).equals(1) // entities are provided from cache
				unmockAttribute(mock)
			})

			o("Load towards the range with start being before the existing range. Range will be extended. Not Reverse.", async function () {
				const ids = [createId("1"), createId("2"), createId("3"), createId("4"), createId("5")]
				const listId1 = "listId1"

				const mail1 = createMailInstance(listId1, ids[0], "hello1")
				const mail2 = createMailInstance(listId1, ids[1], "hello2")
				const mail3 = createMailInstance(listId1, ids[2], "hello3")
				const mail4 = createMailInstance(listId1, ids[3], "hello4")
				const mail5 = createMailInstance(listId1, ids[4], "hello5")

				await storage.setNewRangeForList(MailTypeRef, listId1, ids[2], ids[4])

				for (const mail of [mail3, mail4, mail5]) {
					await storage.put(mail)
				}

				const loadRange = o.spy(function (...any) {
					return Promise.resolve([mail2, mail1])
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				const originalLower = (await storage.getRangeForList(MailTypeRef, listId1))?.lower

				const result1 = await cache.loadRange(MailTypeRef, listId1, GENERATED_MIN_ID, 5, false)

				o(loadRange.callCount).equals(1)("entities are provided from server")
				o(loadRange.args[2]).equals(originalLower)("starts extending range beginning with lowerId")
				o(await storage.isElementIdInCacheRange(MailTypeRef, listId1, GENERATED_MIN_ID)).equals(true)("MIN ID is in cache range")
				const expectedResult = [mail1, mail2, mail3, mail4, mail5]
				o(result1).deepEquals(expectedResult)("Returns all elements in reverse order")

				// further requests are resolved from the cache
				const result2 = await cache.loadRange(MailTypeRef, listId1, GENERATED_MIN_ID, 5, false)

				o(result2).deepEquals(expectedResult)
				o(loadRange.callCount).equals(1)("server is called only once at the end") // entities are provided from cache
				unmockAttribute(mock)
			})

			o("When a range outside the existing range is requested, the exiting range will be extended. Not reverse, away from range", async function () {
				const ids = [createId("1"), createId("2"), createId("3"), createId("4"), createId("5")]
				const listId1 = "listId1"

				const mail1 = createMailInstance(listId1, ids[0], "hello1")
				const mail2 = createMailInstance(listId1, ids[1], "hello2")
				const mail3 = createMailInstance(listId1, ids[2], "hello3")
				const mail4 = createMailInstance(listId1, ids[3], "hello4")
				const mail5 = createMailInstance(listId1, ids[4], "hello5")

				const mails = [mail1, mail2, mail3, mail4, mail5]

				await storage.setNewRangeForList(MailTypeRef, listId1, ids[0], ids[1])

				for (const mail of [mail1, mail2]) {
					await storage.put(mail)
				}

				const originalUpper = (await storage.getRangeForList(MailTypeRef, listId1))?.upper

				//mails are loaded in steps pf count until ranges are joined
				const loadRange = o.spy(function (typeRef, listId, loadStartId, count, reverse) {
					if (loadStartId === originalUpper && count === 2) {
						return Promise.resolve([mails[1], mails[2]])
					} else if (loadStartId === ids[2] && count === 2) {
						return Promise.resolve([mails[2], mails[3]])
					} else if (loadStartId === ids[3] && count === 2) {
						return Promise.resolve([mails[3], mails[4]])
					} else {
						throw new Error(`unexpected load request: startid ${loadStartId} and count ${count}`)
					}
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)


				await cache.loadRange(MailTypeRef, listId1, ids[3], 2, false)

				const lower = (await storage.getRangeForList(MailTypeRef, listId1))?.lower
				const upper = (await storage.getRangeForList(MailTypeRef, listId1))?.upper

				o(lower).equals(ids[0])("lower range is not changed")
				o(upper).equals(ids[4])("upper range corresponds to the end of the new range request")
				unmockAttribute(mock)

			})

			o("When a range outside the existing range is requested, the exiting range will be extended. Reverse, towards range", async function () {
				const ids = [createId("1"), createId("2"), createId("3"), createId("4"), createId("5")]
				const listId1 = "listId1"

				const mail1 = createMailInstance(listId1, ids[0], "hello1")
				const mail2 = createMailInstance(listId1, ids[1], "hello2")
				const mail3 = createMailInstance(listId1, ids[2], "hello3")
				const mail4 = createMailInstance(listId1, ids[3], "hello4")
				const mail5 = createMailInstance(listId1, ids[4], "hello5")

				const mails = [mail1, mail2, mail3, mail4, mail5]

				await storage.setNewRangeForList(MailTypeRef, listId1, GENERATED_MIN_ID, ids[1])

				for (const mail of [mail1, mail2]) {
					await storage.put(mail)
				}

				const originalUpper = (await storage.getRangeForList(MailTypeRef, listId1))?.upper


				const loadRange = o.spy(function (typeRef, listId, loadStartId, count, reverse) {
					if (loadStartId === originalUpper && count === 2) {
						return Promise.resolve([mails[1], mails[2]])
					} else if (loadStartId === ids[2] && count === 2) {
						return Promise.resolve([mails[2], mails[3]])
					} else if (loadStartId === ids[3] && count === 2) {
						return Promise.resolve([mails[3], mails[4]])
					} else if (loadStartId === ids[4] && count === 2) {
						return Promise.resolve([mails[4]])
					} else {
						throw new Error(`unexpected load request: startid ${loadStartId} and count ${count}`)
					}
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)


				await cache.loadRange(MailTypeRef, listId1, GENERATED_MAX_ID, 2, true)

				const lower = (await storage.getRangeForList(MailTypeRef, listId1))?.lower
				const upper = (await storage.getRangeForList(MailTypeRef, listId1))?.upper

				o(lower).equals(GENERATED_MIN_ID)("lower range is not changed")
				o(upper).equals(GENERATED_MAX_ID)("upper range corresponds to the end of the new range request")
				unmockAttribute(mock)
			})


			o("loadMultiple should load necessary elements from the server, and get the rest from the cache", async function () {
					const listId = "listId"
					const inCache = [
						createMailInstance(listId, "1", "1"),
						createMailInstance(listId, "3", "3")
					]

					const notInCache = [
						createMailInstance(listId, "2", "2"),
						createMailInstance(listId, "5", "5")
					]
					await Promise.all(inCache.map(async (i) => await storage.put(i)))
					const ids = inCache.concat(notInCache).map(getElementId)

					const loadMultiple = o.spy((...any) => Promise.resolve(notInCache))
					const mock = mockAttribute(entityRestClient, entityRestClient.loadMultiple, loadMultiple)

					const result = await cache.loadMultiple(MailTypeRef, listId, ids)

					o(result).deepEquals(notInCache.concat(inCache))("all mails are in cache")
					o(loadMultiple.callCount).equals(1)("load multiple is called once")
					o(loadMultiple.args).deepEquals(
						[MailTypeRef, listId, notInCache.map(getElementId)]
					)("load multiple is called for mails not in cache")
					for (const item of inCache.concat(notInCache)) {
						o(await storage.get(MailTypeRef, listId, getElementId(item))).notEquals(null)("element is in cache " + getElementId(item))
					}
					unmockAttribute(mock)
				},
			)
			o("load passes same parameters to entityRestClient", async function () {
				const contactId: IdTuple = [createId("0"), createId("1")]
				const contact = createContact({
					_id: contactId,
					firstName: "greg",
				})
				const client = downcast<EntityRestClient>({
					load: o.spy(() => contact),
				})
				const cache = new EntityRestCache(client, storage)
				await cache.load(
					ContactTypeRef,
					contactId,
					{
						myParam: "param",
					},
					{
						myHeader: "header",
					},
				)
				// @ts-ignore
				o(isSameTypeRef(client.load.args[0], ContactTypeRef)).equals(true)
				// @ts-ignore
				o(client.load.args[1]).deepEquals(contactId)
				// @ts-ignore
				o(client.load.args[2]).deepEquals({
					myParam: "param",
				})
				// @ts-ignore
				o(client.load.args[3]).deepEquals({
					myHeader: "header",
				})
			})
			o("single entity is cached after being loaded", async function () {
				const contactId: IdTuple = [createId("0"), createId("1")]
				const contactOnTheServer = createContact({
					_id: contactId,
					firstName: "greg",
				})
				const client = downcast<EntityRestClient>({
					load: o.spy(async () => {
						return contactOnTheServer
					}),
				})
				const cache = new EntityRestCache(client, storage)
				const firstLoaded = await cache.load(ContactTypeRef, contactId)
				o(firstLoaded).deepEquals(contactOnTheServer)
				// @ts-ignore
				o(client.load.callCount).equals(1)("The entity rest client was called because the contact isn't in cache")
				const secondLoaded = await cache.load(ContactTypeRef, contactId)
				o(secondLoaded).deepEquals(contactOnTheServer)
				// @ts-ignore
				o(client.load.callCount).equals(1)(
					"The rest client was not called again, because the contact was loaded from the cache",
				)
			})

			o("A new range request for a nonexistent range should initialize that range", async function () {
				const loadRange = o.spy(function (typeRef, listId, ...an) {
					return [
						createContact({_id: [listId, createId("1")]}),
						createContact({_id: [listId, createId("2")]}),
						createContact({_id: [listId, createId("3")]}),
						createContact({_id: [listId, createId("4")]}),
						createContact({_id: [listId, createId("5")]}),
						createContact({_id: [listId, createId("6")]}),
					]
				})

				const mock = mockAttribute(entityRestClient, entityRestClient.loadRange, loadRange)

				const result = await cache.loadRange(ContactTypeRef, createId("0"), GENERATED_MIN_ID, 1000, false)

				o(result.length).equals(6)

				unmockAttribute(mock)
			})

			o("single entity is not cached if it is an ignored entity", async function () {
				const permissionId: IdTuple = [createId("0"), createId("1")]
				const permissionOnTheServer = createPermission({
					_id: permissionId,
				})
				const client = downcast<EntityRestClient>({
					load: o.spy(async () => {
						return permissionOnTheServer
					}),
				})
				const cache = new EntityRestCache(client, storage)
				await cache.load(PermissionTypeRef, permissionId)
				await cache.load(PermissionTypeRef, permissionId)
				// @ts-ignore
				o(client.load.callCount).equals(2)("The permission was loaded both times from the server")
			})
		})

		o.spec("no user id", function () {
			o("get", async function () {
				userIdProvider = () => null
				entityRestClient.load = o.spy(async () => createContact({_id: ["listId", "id"]}))
				await cache.load(ContactTypeRef, ["listId", "id"])
				o(entityRestClient.load.callCount).equals(1)
			})

			o("put", async function () {
				userIdProvider = () => null
				entityRestClient.setup = o.spy(async () => ["listId", "id"])
				await cache.setup("listId", createContact({_id: ["listId", "id"]}))
				o(entityRestClient.setup.callCount).equals(1)
			})
		})
	})

	function makeBatch(updates: Array<EntityUpdate>): QueuedBatch {

		return {
			events: updates,
			groupId: groupId,
			batchId: "batchId",
		}
	}
}
