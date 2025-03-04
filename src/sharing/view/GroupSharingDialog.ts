import m, {Children, Component, Vnode} from "mithril"
import stream from "mithril/stream"
import {Dialog, DialogType} from "../../gui/base/Dialog"
import type {TableLineAttrs} from "../../gui/base/TableN"
import {ColumnWidth, TableN} from "../../gui/base/TableN"
import {assert, assertNotNull, downcast, neverNull, ofClass, remove} from "@tutao/tutanota-utils"
import {Icons} from "../../gui/base/icons/Icons"
import {lang} from "../../misc/LanguageViewModel"
import {Bubble, BubbleTextField} from "../../gui/base/BubbleTextField"
import {RecipientInfoBubbleHandler} from "../../misc/RecipientInfoBubbleHandler"
import {createRecipientInfo, getDisplayText, resolveRecipientInfoContact} from "../../mail/model/MailUtils"
import type {DropdownChildAttrs} from "../../gui/base/DropdownN"
import {attachDropdown} from "../../gui/base/DropdownN"
import {ButtonType} from "../../gui/base/ButtonN"
import {showProgressDialog} from "../../gui/dialogs/ProgressDialog"
import {ShareCapability} from "../../api/common/TutanotaConstants"
import {DropDownSelectorN} from "../../gui/base/DropDownSelectorN"
import {PreconditionFailedError, TooManyRequestsError} from "../../api/common/error/RestError"
import {TextFieldN} from "../../gui/base/TextFieldN"
import type {GroupInfo} from "../../api/entities/sys/GroupInfo"
import type {Contact} from "../../api/entities/tutanota/Contact"
import type {RecipientInfo} from "../../api/common/RecipientInfo"
import {
	getCapabilityText,
	getMemberCabability,
	getSharedGroupName,
	hasCapabilityOnGroup,
	isShareableGroupType,
	isSharedGroupOwner
} from "../GroupUtils"
import {sendShareNotificationEmail} from "../GroupSharingUtils"
import {GroupSharingModel} from "../model/GroupSharingModel"
import {logins} from "../../api/main/LoginController"
import {locator} from "../../api/main/MainLocator"
import {UserError} from "../../api/main/UserError"
import {showUserError} from "../../misc/ErrorHandlerImpl"
import {getConfirmation} from "../../gui/base/GuiUtils"
import type {GroupSharingTexts} from "../GroupGuiUtils"
import {getTextsForGroupType} from "../GroupGuiUtils"
import Stream from "mithril/stream";
// the maximum number of BTF suggestions so the suggestions dropdown does not overflow the dialog
const SHOW_CONTACT_SUGGESTIONS_MAX = 3

export function showGroupSharingDialog(groupInfo: GroupInfo, allowGroupNameOverride: boolean) {
	const groupType = downcast(assertNotNull(groupInfo.groupType))
	assert(isShareableGroupType(downcast(groupInfo.groupType)), `Group type "${groupType}" must be shareable`)
	const texts = getTextsForGroupType(groupType)
	showProgressDialog(
		"loading_msg",
		GroupSharingModel.newAsync(
			groupInfo,
			locator.eventController,
			locator.entityClient,
			logins,
			locator.mailFacade,
			locator.shareFacade,
			locator.groupManagementFacade,
		),
	).then(model => {
		model.onEntityUpdate.map(m.redraw.bind(m))
		const contentAttrs: GroupSharingDialogAttrs = {
			model,
			allowGroupNameOverride,
			texts,
		}
		Dialog.showActionDialog({
			title: lang.get("sharing_label"),
			type: DialogType.EditMedium,
			child: () => m(GroupSharingDialogContent, contentAttrs),
			okAction: null,
			cancelAction: () => model.dispose(),
			cancelActionTextId: "close_alt",
		})
	})
}

type GroupSharingDialogAttrs = {
	model: GroupSharingModel
	allowGroupNameOverride: boolean
	texts: GroupSharingTexts
}

class GroupSharingDialogContent implements Component<GroupSharingDialogAttrs> {
	view(vnode: Vnode<GroupSharingDialogAttrs>): Children {
		const {model, allowGroupNameOverride, texts} = vnode.attrs
		const groupName = getSharedGroupName(model.info, allowGroupNameOverride)
		return m(".flex.col.pt-s", [
			m(TableN, {
				columnHeading: [() => texts.participantsLabel(groupName)],
				columnWidths: [ColumnWidth.Largest, ColumnWidth.Largest],
				lines: this._renderMemberInfos(model, texts, groupName).concat(this._renderGroupInvitations(model, texts, groupName)),
				showActionButtonColumn: true,
				addButtonAttrs: hasCapabilityOnGroup(logins.getUserController().user, model.group, ShareCapability.Invite)
					? {
						label: "addParticipant_action",
						click: () => showAddParticipantDialog(model, texts),
						icon: () => Icons.Add,
					}
					: null,
			}),
		])
	}

	_renderGroupInvitations(model: GroupSharingModel, texts: GroupSharingTexts, groupName: string): Array<TableLineAttrs> {
		return model.sentGroupInvitations.map(sentGroupInvitation => {
			return {
				cells: () => [
					{
						main: sentGroupInvitation.inviteeMailAddress,
						info: [`${lang.get("invited_label")}, ${getCapabilityText(downcast(sentGroupInvitation.capability))}`],
						mainStyle: ".i",
					},
				],
				actionButtonAttrs:
					model.canCancelInvitation(sentGroupInvitation)
						? {
							label: "remove_action",
							click: () => {
								getConfirmation(() => texts.removeMemberMessage(groupName, sentGroupInvitation.inviteeMailAddress)).confirmed(() =>
									model.cancelInvitation(sentGroupInvitation),
								)
							},
							icon: () => Icons.Cancel,
						}
						: null,
			}
		})
	}

	_renderMemberInfos(model: GroupSharingModel, texts: GroupSharingTexts, groupName: string): Array<TableLineAttrs> {
		return model.memberInfos.map(memberInfo => {
			return {
				cells: () => [
					{
						main: getDisplayText(memberInfo.info.name, neverNull(memberInfo.info.mailAddress), false),
						info: [
							(isSharedGroupOwner(model.group, memberInfo.member.user) ? lang.get("owner_label") : lang.get("participant_label")) +
							", " +
							getCapabilityText(getMemberCabability(memberInfo, model.group)),
						],
					},
				],
				actionButtonAttrs: model.canRemoveGroupMember(memberInfo.member)
					? {
						label: "delete_action",
						icon: () => Icons.Cancel,
						click: () => {
							getConfirmation(() => texts.removeMemberMessage(groupName, downcast(memberInfo.info.mailAddress))).confirmed(() =>
								model.removeGroupMember(memberInfo.member),
							)
						},
					}
					: null,
			}
		})
	}
} // This is a separate function because "this" inside bubble handler object is "any"

function _createBubbleContextButtons(bubbles: Array<Bubble<RecipientInfo>>, name: string, mailAddress: string): Array<DropdownChildAttrs> {
	let buttonAttrs: Array<DropdownChildAttrs> = [
		{
			info: mailAddress,
			center: false,
			bold: false,
		},
	]
	buttonAttrs.push({
		label: "remove_action",
		type: ButtonType.Secondary,
		click: () => {
			const bubbleToRemove = bubbles.find(bubble => bubble.entity.mailAddress === mailAddress)

			if (bubbleToRemove) {
				remove(bubbles, bubbleToRemove)
			}
		},
	})
	return buttonAttrs
}

function showAddParticipantDialog(model: GroupSharingModel, texts: GroupSharingTexts) {
	const bubbleHandler = new RecipientInfoBubbleHandler(
		{
			createBubble(name: string | null, mailAddress: string, contact: Contact | null): Bubble<RecipientInfo> {
				let recipientInfo = createRecipientInfo(mailAddress, name, contact)
				recipientInfo.resolveContactPromise = resolveRecipientInfoContact(recipientInfo, locator.contactModel, logins.getUserController().user)
				let bubbleWrapper = {}

				const childAttrs = () => _createBubbleContextButtons(invitePeopleValueTextField.bubbles, recipientInfo.name, mailAddress)

				const buttonAttrs = attachDropdown(
					{
						label: () => getDisplayText(recipientInfo.name, mailAddress, false),
						type: ButtonType.TextBubble,
						isSelected: () => false,
					},
					childAttrs,
				)
				return new Bubble(recipientInfo, neverNull(buttonAttrs), mailAddress)
			},
		},
		locator.contactModel,
		SHOW_CONTACT_SUGGESTIONS_MAX,
	)
	const invitePeopleValueTextField = new BubbleTextField<RecipientInfo>("shareWithEmailRecipient_label", bubbleHandler)
	const capability: Stream<ShareCapability> = stream(ShareCapability.Read)
	const realGroupName = getSharedGroupName(model.info, false)
	const customGroupName = getSharedGroupName(model.info, true)
	let dialog = Dialog.showActionDialog({
		type: DialogType.EditMedium,
		title: () => lang.get("addParticipant_action"),
		child: () => [
			m(".rel", m(invitePeopleValueTextField)),
			m(DropDownSelectorN, {
				label: "permissions_label",
				items: [
					{
						name: getCapabilityText(ShareCapability.Invite),
						value: ShareCapability.Invite,
					},
					{
						name: getCapabilityText(ShareCapability.Write),
						value: ShareCapability.Write,
					},
					{
						name: getCapabilityText(ShareCapability.Read),
						value: ShareCapability.Read,
					},
				],
				selectedValue: capability,
				dropdownWidth: 300,
			}),
			m(TextFieldN, {
				value: stream(realGroupName),
				label: texts.groupNameLabel,
				disabled: true,
				helpLabel: () => {
					return m("", customGroupName === realGroupName ? null : texts.yourCustomNameLabel(customGroupName))
				},
			}),
			m(".pt", texts.addMemberMessage(customGroupName || realGroupName)),
		],
		okAction: () => {
			invitePeopleValueTextField.createBubbles()

			if (invitePeopleValueTextField.bubbles.length === 0) {
				return Dialog.message("noRecipients_msg")
			} else {
				const recipients = invitePeopleValueTextField.bubbles.map(b => b.entity)
				return import("../../misc/SubscriptionDialogs")
					.then(SubscriptionDialogUtils => SubscriptionDialogUtils.checkPremiumSubscription(false))
					.then(ok => {
						if (ok) {
							showProgressDialog("calendarInvitationProgress_msg", model.sendGroupInvitation(model.info, recipients, capability()))
								.then(invitedMailAddresses => {
									dialog.close()
									sendShareNotificationEmail(
										model.info,
										invitedMailAddresses.map(ma => createRecipientInfo(ma.address, null, null)),
										texts,
									)
								})
								.catch(
									ofClass(PreconditionFailedError, e => {
										if (logins.getUserController().isGlobalAdmin()) {
											getConfirmation(() => texts.sharingNotOrderedAdmin).confirmed(() =>
												import("../../subscription/BuyDialog").then(BuyDialog => BuyDialog.showSharingBuyDialog(true)),
											)
										} else {
											Dialog.message(() => `${texts.sharingNotOrderedUser} ${lang.get("contactAdmin_msg")}`)
										}
									}),
								)
								.catch(ofClass(UserError, showUserError))
								.catch(ofClass(TooManyRequestsError, e => Dialog.message("tooManyAttempts_msg")))
						}
					})
			}
		},
		okActionTextId: "invite_alt",
	}).setCloseHandler(() => {
		dialog.close()
	})
}