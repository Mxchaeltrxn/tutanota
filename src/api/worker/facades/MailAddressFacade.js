// @flow
import {createMailAddressAliasServiceDataDelete} from "../../entities/sys/MailAddressAliasServiceDataDelete"
import {HttpMethod} from "../../common/EntityFunctions"
import {createMailAddressAliasServiceData} from "../../entities/sys/MailAddressAliasServiceData"
import {createDomainMailAddressAvailabilityData} from "../../entities/sys/DomainMailAddressAvailabilityData"
import type {LoginFacadeImpl} from "./LoginFacade"
import {createMailAddressAvailabilityData} from "../../entities/sys/MailAddressAvailabilityData"
import {DomainMailAddressAvailabilityReturnTypeRef} from "../../entities/sys/DomainMailAddressAvailabilityReturn"
import {MailAddressAvailabilityReturnTypeRef} from "../../entities/sys/MailAddressAvailabilityReturn"
import type {MailAddressAliasServiceReturn} from "../../entities/sys/MailAddressAliasServiceReturn"
import {MailAddressAliasServiceReturnTypeRef} from "../../entities/sys/MailAddressAliasServiceReturn"
import {SysService} from "../../entities/sys/Services"
import {serviceRequest, serviceRequestVoid} from "../EntityWorker"
import {assertWorkerOrNode} from "../../common/Env"

assertWorkerOrNode()

export class MailAddressFacade {
	_login: LoginFacadeImpl;

	constructor(login: LoginFacadeImpl) {
		this._login = login

	}

	getAliasCounters(): Promise<MailAddressAliasServiceReturn> {
		return serviceRequest(SysService.MailAddressAliasService, HttpMethod.GET, null, MailAddressAliasServiceReturnTypeRef)
	}

	isMailAddressAvailable(mailAddress: string): Promise<boolean> {
		if (this._login.isLoggedIn()) {
			let data = createDomainMailAddressAvailabilityData()
			data.mailAddress = mailAddress
			return serviceRequest(SysService.DomainMailAddressAvailabilityService, HttpMethod.GET, data, DomainMailAddressAvailabilityReturnTypeRef)
				.then(result => result.available)
		} else {
			let data = createMailAddressAvailabilityData()
			data.mailAddress = mailAddress
			return serviceRequest(SysService.MailAddressAvailabilityService, HttpMethod.GET, data, MailAddressAvailabilityReturnTypeRef)
				.then(result => result.available)
		}
	}

	addMailAlias(groupId: Id, alias: string): Promise<void> {
		let data = createMailAddressAliasServiceData()
		data.group = groupId
		data.mailAddress = alias
		return serviceRequestVoid(SysService.MailAddressAliasService, HttpMethod.POST, data)
	}

	setMailAliasStatus(groupId: Id, alias: string, restore: boolean): Promise<void> {
		let deleteData = createMailAddressAliasServiceDataDelete()
		deleteData.mailAddress = alias
		deleteData.restore = restore
		deleteData.group = groupId
		return serviceRequestVoid(SysService.MailAddressAliasService, HttpMethod.DELETE, deleteData)
	}
}
