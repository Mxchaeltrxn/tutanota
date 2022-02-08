const map = {
    KeyPair: () => import('./KeyPair.js'),
    Group: () => import('./Group.js'),
    GroupInfo: () => import('./GroupInfo.js'),
    GroupMembership: () => import('./GroupMembership.js'),
    Customer: () => import('./Customer.js'),
    AuthenticatedDevice: () => import('./AuthenticatedDevice.js'),
    Login: () => import('./Login.js'),
    SecondFactorAuthentication: () => import('./SecondFactorAuthentication.js'),
    PhoneNumber: () => import('./PhoneNumber.js'),
    VariableExternalAuthInfo: () => import('./VariableExternalAuthInfo.js'),
    UserExternalAuthInfo: () => import('./UserExternalAuthInfo.js'),
    User: () => import('./User.js'),
    ExternalUserReference: () => import('./ExternalUserReference.js'),
    GroupRoot: () => import('./GroupRoot.js'),
    BucketPermission: () => import('./BucketPermission.js'),
    Bucket: () => import('./Bucket.js'),
    Permission: () => import('./Permission.js'),
    AccountingInfo: () => import('./AccountingInfo.js'),
    CustomerInfo: () => import('./CustomerInfo.js'),
    SentGroupInvitation: () => import('./SentGroupInvitation.js'),
    MailAddressToGroup: () => import('./MailAddressToGroup.js'),
    GroupMember: () => import('./GroupMember.js'),
    RootInstance: () => import('./RootInstance.js'),
    VersionInfo: () => import('./VersionInfo.js'),
    SystemKeysReturn: () => import('./SystemKeysReturn.js'),
    MailAddressAvailabilityData: () => import('./MailAddressAvailabilityData.js'),
    MailAddressAvailabilityReturn: () => import('./MailAddressAvailabilityReturn.js'),
    RegistrationServiceData: () => import('./RegistrationServiceData.js'),
    RegistrationReturn: () => import('./RegistrationReturn.js'),
    SendRegistrationCodeData: () => import('./SendRegistrationCodeData.js'),
    SendRegistrationCodeReturn: () => import('./SendRegistrationCodeReturn.js'),
    VerifyRegistrationCodeData: () => import('./VerifyRegistrationCodeData.js'),
    CreateGroupData: () => import('./CreateGroupData.js'),
    CreateGroupListData: () => import('./CreateGroupListData.js'),
    CustomerReturn: () => import('./CustomerReturn.js'),
    CustomerData: () => import('./CustomerData.js'),
    UserReturn: () => import('./UserReturn.js'),
    UserData: () => import('./UserData.js'),
    UserDataDelete: () => import('./UserDataDelete.js'),
    PublicKeyData: () => import('./PublicKeyData.js'),
    PublicKeyReturn: () => import('./PublicKeyReturn.js'),
    SaltData: () => import('./SaltData.js'),
    SaltReturn: () => import('./SaltReturn.js'),
    UserIdData: () => import('./UserIdData.js'),
    UserIdReturn: () => import('./UserIdReturn.js'),
    AutoLoginDataGet: () => import('./AutoLoginDataGet.js'),
    AutoLoginDataDelete: () => import('./AutoLoginDataDelete.js'),
    AutoLoginDataReturn: () => import('./AutoLoginDataReturn.js'),
    AutoLoginPostReturn: () => import('./AutoLoginPostReturn.js'),
    UpdatePermissionKeyData: () => import('./UpdatePermissionKeyData.js'),
    Authentication: () => import('./Authentication.js'),
    Chat: () => import('./Chat.js'),
    EntityUpdate: () => import('./EntityUpdate.js'),
    Exception: () => import('./Exception.js'),
    Version: () => import('./Version.js'),
    VersionData: () => import('./VersionData.js'),
    VersionReturn: () => import('./VersionReturn.js'),
    MembershipAddData: () => import('./MembershipAddData.js'),
    StringConfigValue: () => import('./StringConfigValue.js'),
    ChangePasswordData: () => import('./ChangePasswordData.js'),
    SecondFactorAuthData: () => import('./SecondFactorAuthData.js'),
    SecondFactorAuthAllowedReturn: () => import('./SecondFactorAuthAllowedReturn.js'),
    CustomerInfoReturn: () => import('./CustomerInfoReturn.js'),
    ResetPasswordData: () => import('./ResetPasswordData.js'),
    DomainMailAddressAvailabilityData: () => import('./DomainMailAddressAvailabilityData.js'),
    DomainMailAddressAvailabilityReturn: () => import('./DomainMailAddressAvailabilityReturn.js'),
    RegistrationConfigReturn: () => import('./RegistrationConfigReturn.js'),
    PushIdentifier: () => import('./PushIdentifier.js'),
    PushIdentifierList: () => import('./PushIdentifierList.js'),
    DeleteCustomerData: () => import('./DeleteCustomerData.js'),
    PremiumFeatureData: () => import('./PremiumFeatureData.js'),
    CustomerProperties: () => import('./CustomerProperties.js'),
    ExternalPropertiesReturn: () => import('./ExternalPropertiesReturn.js'),
    RegistrationCaptchaServiceData: () => import('./RegistrationCaptchaServiceData.js'),
    RegistrationCaptchaServiceReturn: () => import('./RegistrationCaptchaServiceReturn.js'),
    MailAddressAlias: () => import('./MailAddressAlias.js'),
    MailAddressAliasServiceData: () => import('./MailAddressAliasServiceData.js'),
    MailAddressAliasServiceReturn: () => import('./MailAddressAliasServiceReturn.js'),
    DomainInfo: () => import('./DomainInfo.js'),
    BookingItem: () => import('./BookingItem.js'),
    Booking: () => import('./Booking.js'),
    BookingsRef: () => import('./BookingsRef.js'),
    StringWrapper: () => import('./StringWrapper.js'),
    CustomDomainReturn: () => import('./CustomDomainReturn.js'),
    CustomDomainData: () => import('./CustomDomainData.js'),
    InvoiceInfo: () => import('./InvoiceInfo.js'),
    SwitchAccountTypeData: () => import('./SwitchAccountTypeData.js'),
    PdfInvoiceServiceData: () => import('./PdfInvoiceServiceData.js'),
    PdfInvoiceServiceReturn: () => import('./PdfInvoiceServiceReturn.js'),
    MailAddressAliasServiceDataDelete: () => import('./MailAddressAliasServiceDataDelete.js'),
    PaymentDataServiceGetReturn: () => import('./PaymentDataServiceGetReturn.js'),
    PaymentDataServicePutData: () => import('./PaymentDataServicePutData.js'),
    PaymentDataServicePutReturn: () => import('./PaymentDataServicePutReturn.js'),
    PriceRequestData: () => import('./PriceRequestData.js'),
    PriceServiceData: () => import('./PriceServiceData.js'),
    PriceItemData: () => import('./PriceItemData.js'),
    PriceData: () => import('./PriceData.js'),
    PriceServiceReturn: () => import('./PriceServiceReturn.js'),
    MembershipRemoveData: () => import('./MembershipRemoveData.js'),
    File: () => import('./File.js'),
    EmailSenderListElement: () => import('./EmailSenderListElement.js'),
    CustomerServerProperties: () => import('./CustomerServerProperties.js'),
    CreateCustomerServerPropertiesData: () => import('./CreateCustomerServerPropertiesData.js'),
    CreateCustomerServerPropertiesReturn: () => import('./CreateCustomerServerPropertiesReturn.js'),
    PremiumFeatureReturn: () => import('./PremiumFeatureReturn.js'),
    UserAreaGroups: () => import('./UserAreaGroups.js'),
    DebitServicePutData: () => import('./DebitServicePutData.js'),
    BookingServiceData: () => import('./BookingServiceData.js'),
    EntityEventBatch: () => import('./EntityEventBatch.js'),
    DomainsRef: () => import('./DomainsRef.js'),
    AuditLogEntry: () => import('./AuditLogEntry.js'),
    AuditLogRef: () => import('./AuditLogRef.js'),
    WhitelabelConfig: () => import('./WhitelabelConfig.js'),
    BrandingDomainData: () => import('./BrandingDomainData.js'),
    BrandingDomainDeleteData: () => import('./BrandingDomainDeleteData.js'),
    U2fRegisteredDevice: () => import('./U2fRegisteredDevice.js'),
    SecondFactor: () => import('./SecondFactor.js'),
    U2fKey: () => import('./U2fKey.js'),
    U2fChallenge: () => import('./U2fChallenge.js'),
    Challenge: () => import('./Challenge.js'),
    Session: () => import('./Session.js'),
    UserAuthentication: () => import('./UserAuthentication.js'),
    CreateSessionData: () => import('./CreateSessionData.js'),
    CreateSessionReturn: () => import('./CreateSessionReturn.js'),
    U2fResponseData: () => import('./U2fResponseData.js'),
    SecondFactorAuthGetData: () => import('./SecondFactorAuthGetData.js'),
    SecondFactorAuthGetReturn: () => import('./SecondFactorAuthGetReturn.js'),
    OtpChallenge: () => import('./OtpChallenge.js'),
    BootstrapFeature: () => import('./BootstrapFeature.js'),
    Feature: () => import('./Feature.js'),
    WhitelabelChild: () => import('./WhitelabelChild.js'),
    WhitelabelChildrenRef: () => import('./WhitelabelChildrenRef.js'),
    WhitelabelParent: () => import('./WhitelabelParent.js'),
    UpdateAdminshipData: () => import('./UpdateAdminshipData.js'),
    AdministratedGroup: () => import('./AdministratedGroup.js'),
    AdministratedGroupsRef: () => import('./AdministratedGroupsRef.js'),
    CreditCard: () => import('./CreditCard.js'),
    LocationServiceGetReturn: () => import('./LocationServiceGetReturn.js'),
    OrderProcessingAgreement: () => import('./OrderProcessingAgreement.js'),
    SignOrderProcessingAgreementData: () => import('./SignOrderProcessingAgreementData.js'),
    GeneratedIdWrapper: () => import('./GeneratedIdWrapper.js'),
    SseConnectData: () => import('./SseConnectData.js'),
    NotificationInfo: () => import('./NotificationInfo.js'),
    RecoverCode: () => import('./RecoverCode.js'),
    ResetFactorsDeleteData: () => import('./ResetFactorsDeleteData.js'),
    UpgradePriceServiceData: () => import('./UpgradePriceServiceData.js'),
    PlanPrices: () => import('./PlanPrices.js'),
    UpgradePriceServiceReturn: () => import('./UpgradePriceServiceReturn.js'),
    RegistrationCaptchaServiceGetData: () => import('./RegistrationCaptchaServiceGetData.js'),
    WebsocketEntityData: () => import('./WebsocketEntityData.js'),
    WebsocketCounterValue: () => import('./WebsocketCounterValue.js'),
    WebsocketCounterData: () => import('./WebsocketCounterData.js'),
    CertificateInfo: () => import('./CertificateInfo.js'),
    NotificationMailTemplate: () => import('./NotificationMailTemplate.js'),
    CalendarEventRef: () => import('./CalendarEventRef.js'),
    AlarmInfo: () => import('./AlarmInfo.js'),
    UserAlarmInfo: () => import('./UserAlarmInfo.js'),
    UserAlarmInfoListType: () => import('./UserAlarmInfoListType.js'),
    NotificationSessionKey: () => import('./NotificationSessionKey.js'),
    RepeatRule: () => import('./RepeatRule.js'),
    AlarmNotification: () => import('./AlarmNotification.js'),
    AlarmServicePost: () => import('./AlarmServicePost.js'),
    DnsRecord: () => import('./DnsRecord.js'),
    CustomDomainCheckData: () => import('./CustomDomainCheckData.js'),
    CustomDomainCheckReturn: () => import('./CustomDomainCheckReturn.js'),
    CloseSessionServicePost: () => import('./CloseSessionServicePost.js'),
    ReceivedGroupInvitation: () => import('./ReceivedGroupInvitation.js'),
    UserGroupRoot: () => import('./UserGroupRoot.js'),
    PaymentErrorInfo: () => import('./PaymentErrorInfo.js'),
    InvoiceItem: () => import('./InvoiceItem.js'),
    Invoice: () => import('./Invoice.js'),
    MissedNotification: () => import('./MissedNotification.js'),
    BrandingDomainGetReturn: () => import('./BrandingDomainGetReturn.js'),
    RejectedSender: () => import('./RejectedSender.js'),
    RejectedSendersRef: () => import('./RejectedSendersRef.js'),
    SecondFactorAuthDeleteData: () => import('./SecondFactorAuthDeleteData.js'),
    TakeOverDeletedAddressData: () => import('./TakeOverDeletedAddressData.js'),
    WebsocketLeaderStatus: () => import('./WebsocketLeaderStatus.js'),
    GiftCard: () => import('./GiftCard.js'),
    GiftCardsRef: () => import('./GiftCardsRef.js'),
    GiftCardOption: () => import('./GiftCardOption.js'),
    GiftCardGetReturn: () => import('./GiftCardGetReturn.js'),
    GiftCardCreateData: () => import('./GiftCardCreateData.js'),
    GiftCardDeleteData: () => import('./GiftCardDeleteData.js'),
    GiftCardCreateReturn: () => import('./GiftCardCreateReturn.js'),
    GiftCardRedeemData: () => import('./GiftCardRedeemData.js'),
    GiftCardRedeemGetReturn: () => import('./GiftCardRedeemGetReturn.js'),
    Braintree3ds2Request: () => import('./Braintree3ds2Request.js'),
    Braintree3ds2Response: () => import('./Braintree3ds2Response.js'),
    PaymentDataServicePostData: () => import('./PaymentDataServicePostData.js'),
    PaymentDataServiceGetData: () => import('./PaymentDataServiceGetData.js'),
    TypeInfo: () => import('./TypeInfo.js'),
    ArchiveRef: () => import('./ArchiveRef.js'),
    ArchiveType: () => import('./ArchiveType.js'),
    Blob: () => import('./Blob.js'),
    BlobId: () => import('./BlobId.js'),
    TargetServer: () => import('./TargetServer.js'),
    BlobAccessInfo: () => import('./BlobAccessInfo.js'),
    WebauthnResponseData: () => import('./WebauthnResponseData.js'),
    UsageTestPingData: () => import('./UsageTestPingData.js'),
    UsageTestAssignmentPostIn: () => import('./UsageTestAssignmentPostIn.js'),
    UsageTestAssignment: () => import('./UsageTestAssignment.js'),
    UsageTestAssignmentPostOut: () => import('./UsageTestAssignmentPostOut.js'),
    UsageTestParticipationPostIn: () => import('./UsageTestParticipationPostIn.js'),
    UsageTestParticipationPutIn: () => import('./UsageTestParticipationPutIn.js'),
    UsageTestParticipationPostOut: () => import('./UsageTestParticipationPostOut.js')
}
export default map