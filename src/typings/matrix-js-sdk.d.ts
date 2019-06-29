/* eslint camelcase: off */

declare module 'matrix-js-sdk' {

  import { EventEmitter } from 'events'

  export type MatrixCallback = (err: null | object, data: any) => void

  export class MatrixError {

    public errcode    : string  //  The Matrix 'errcode' value, e.g. "M_FORBIDDEN".
    public name       : string  //  Same as MatrixError.errcode but with a default unknown string.
    public message    : string  //  The Matrix 'error' value, e.g. "Missing token."
    public data       : object  //  The raw Matrix error JSON used to construct this object.
    public httpStatus : number  // The numeric HTTP status code given

    constructor (errorJson: object)

  }

  export class Room {

    roomId       : string              // The ID of this room.
    name         : string              // The human-readable display name for this room.
    timeline     : Array<MatrixEvent>  // The live event timeline for this room, with the oldest event at index 0. Present for backwards compatibility - prefer getLiveTimeline().getEvents().
    tags         : object              // Dict of room tags; the keys are the tag name and the values are any metadata associated with the tag - e.g. { "fav" : { order: 1 } }
    accountData  : object              // Dict of per-room account_data events; the keys are the event type and the values are the events.
    oldState     : RoomState           // The state of the room at the time of the oldest event in the live timeline. Present for backwards compatibility - prefer getLiveTimeline().getState(EventTimeline.BACKWARDS).
    currentState : RoomState           // The state of the room at the time of the newest event in the timeline. Present for backwards compatibility - prefer getLiveTimeline().getState(EventTimeline.FORWARDS).
    summary      : RoomSummary         // The room summary.
    storageToken : any                 // A token which a data store can use to remember the state of the room.

    constructor (roomId: string, client: MatrixClient, myUserId: string, opts?: {
      storageToken?                      : any      // Optional. The token which a data store can use to remember the state of the room. What this means is dependent on the store implementation.
      pendingEventOrdering?              : string   // <optional> Controls where pending messages appear in a room's timeline. If "chronological", messages will appear in the timeline when the call to sendEvent was made. If "detached", pending messages will appear in a separate list, accessbile via module:models/room#getPendingEvents. Default: "chronological".
      timelineSupport?                   : boolean  // <optional> false Set to true to enable improved timeline support.
      unstableClientRelationAggregation? : boolean  // <optional> false Optional. Set to true to enable client-side aggregation of event relations via `EventTimelineSet#getRelationsForEvent`. This feature is currently unstable and the API may change without notice.
    })

    addAccountData(events: Array<MatrixEvent>): void
    addEventsToTimeline(events: Array<MatrixEvent>, toStartOfTimeline: boolean, timeline: EventTimeline, paginationToken?: string): void
    addLiveEvents(events: Array<MatrixEvent>, duplicateStrategy: string): void
    addPendingEvent(event: MatrixEvent, txnId: string): void
    addReceipt(event: MatrixEvent, fake: boolean): void
    addTags(event: MatrixEvent): void
    addTimeline(): EventTimeline
    clearLoadedMembersIfNeeded(): void
    findEventById(eventId: string): null | MatrixEvent
    getAccountData(type: string): null | MatrixEvent
    getAliases(): Array<string>
    getAvatarUrl(
      baseUrl: string, width: number, height: number, resizeMethod: string, allowDefault: boolean,
    ): null | string
    getBlacklistUnverifiedDevices(): boolean
    getCanonicalAlias() : null | string
    getDefaultRoomName(userId: string): string
    getDMInviter (): undefined | string
    getEncryptionTargetMembers(): Promise<Array<RoomMember>>
    getEventReadUpTo(userId: string, ignoreSynthesized: boolean): string
    getInvitedAndJoinedMemberCount(): number
    getInvitedMemberCount(): number
    getJoinedMemberCount(): number
    getJoinedMembers(): Array<RoomMember>
    getLiveTimeline(): EventTimeline
    getMember(userId: string): RoomMember
    getMembersWithMembership(membership: string): Array<RoomMember>
    getMyMembership(myUserId: string): string
    getOrCreateFilteredTimelineSet(filter: Filter): EventTimelineSet
    getPendingEvents(): Array<MatrixEvent>
    getReceiptsForEvent(event: MatrixEvent): Array<Object>
    getRecommendedVersion(): Promise<{
      version: string, needsUpgrade: bool, urgent: bool
    }>
    getTimelineForEvent(eventId: string): null | EventTimeline
    getTimelineSets(): Array<EventTimelineSet>
    getUnfilteredTimelineSet(): EventTimelineSet
    getUnreadNotificationCount(type: string): number
    getUsersReadUpTo(event: MatrixEvent): Array<string>
    getVersion(): string
    guessDMUserId(): string
    hasMembershipState(userId: string, membership: MembershipType): boolean
    hasUnverifiedDevices(): bool
    hasUserReadEvent(userId: string, eventId: string): boolean
    loadMembersIfNeeded(): Promise<void>
    maySendMessage(): boolean
    recalculate(): void
    removeEvent(eventId): bool
    removeEvents(event_ids: Array<string>): void
    removeFilteredTimelineSet(filter: Filter): void
    resetLiveTimeline(backPaginationToken?: string, forwardPaginationToken?: string): void
    setBlacklistUnverifiedDevices(value: boolean): void
    setUnreadNotificationCount(type: string, count: number): void
    shouldEncryptForInvitedMembers(): boolean
    shouldUpgradeToVersion(): null | string
    updateMyMembership(membership: MemberShipType): void
    updatePendingEvent (event: MatrixEvent, newStatus: EventStatus, newEventId: string): void
    userMayUpgradeRoom(userId: string): boolean

  }

  export class User {

    public userId                  : string                     // The ID of the user.
    public info                    : Object                     // The info object supplied in the constructor.
    public displayName             : string                     // The 'displayname' of the user if known.
    public avatarUrl               : string                     // The 'avatar_url' of the user if known.
    public presence                : string                     // The presence enum if known.
    public presenceStatusMsg       : string                     // The presence status message if known.
    public lastActiveAgo           : Number                     // The time elapsed in ms since the user interacted proactively with the server, or we saw a message from the user
    public lastPresenceTs          : Number                     // Timestamp (ms since the epoch) for when we last received presence data for this user. We can subtract lastActiveAgo from this to approximate an absolute value for when a user was last active.
    public currentlyActive         : Boolean                    // Whether we should consider lastActiveAgo to be an approximation and that the user should be seen as active 'now'
    public events                  : { presence: MatrixEvent }  // The events describing this user.

    constructor (
      userId: string,
    )

    getLastActiveTs     ()                   : number
    getLastModifiedTime ()                   : number
    setAvatarUrl        (url: string)        : void
    setDisplayName      (name: string)       : void
    setPresenceEvent    (event: MatrixEvent) : void
    setRawDisplayName   (name: string)       : void

  }

  export type EventType = never
                        |'m.room.canonical_alias'
                        |'m.room.guest_access'
                        |'m.room.history_visibility'
                        |'m.room.join_rules'
                        |'m.room.member'
                        |'m.room.message'
                        |'m.room.name'
                        |'m.room.power_levels'
                        |'m.room.tombstone'
                        |'m.room.topic'
                        |'m.sticker'

  export type MsgType = never
                      |'m.audio'
                      |'m.file'
                      |'m.image'
                      |'m.sticker'
                      |'m.text'
                      |'m.video'

  export type MembershipType = never
                            |'invite'
                            |'joined'
                            |'join'
                            |'leave'
  /**
   * Only part of the MatrixClient methods was put here
   * because they are too many.
   * @huan 14 June 2019
   */
  export class MatrixClient extends EventEmitter {

    acceptGroupInvite (groupId: string, opts: object): Promise<void>
    addPushRule (scope: string, kind: string, ruleId: string, body: object, callback?: () => void): Promise<void>
    addRoomToGroup(groupId: string, roomId: string, isPublic: boolean): Promise<void>
    addRoomToGroupSummary(groupId: string, roomId: string, categoryId?: string): Promise<void>
    addThreePid(creds: object, bindboolean, callback?: (err: null | object, data: any) => void): Promise<void>
    addUserToGroupSummary(groupId: string, userId: string, roleId?: string): Promise<void>
    backPaginateRoomEventsSearch(searchResults: object): Promise<object>
    ban(roomId: string, userId: string, reason: string, callback: (err: null | object, data: any) => void): Promise<void>
    beginKeyVerification(method: string, userId: string, deviceId: string): Promise<object>
    cancelAndResendEventRoomKeyRequest(event: MatrixEvent): Promise<void>
    cancelPendingEvent(event: MatrixEvent): Promise<void>
    cancelUpload(promise: Promise): boolean
    checkKeyBackup(): object
    claimOneTimeKeys(devices: string[], key_algorithm = 'signed_curve25519'): Promise<object>
    clearStores(): Promise<void>
    createAlias(alias: string, roomId: string, callback: MatrixCallback): Promise<void>
    createFilter(content: object): Promise<Filter>
    createGroup(content: object): Promise<{ [groupId: string]: string }>
    createKeyBackupVersion(info: object): Promise<object>
    createRoom(options: CreateRoomOptions, callback: MatrixCallback): Promise<{
      room_id: string,
      room_alias?: string,
    }>
    deactivateAccount(auth: object, erase: boolean): Promise<void>
    deleteAlias(alias: string, callback: MatrixCallback): Promise<void>
    deleteDevice(device_id: string, auth: object): Promise<object>
    deleteMultipleDevices(devices: string, auth: object): Promise<object>
    deletePushRule(scope: string, kind: string, ruleId: string, callback?: MatrixCallback): Promise<void>
    deleteRoomTag(roomId: string, tagName: string, callback?: MatrixCallback): Promise<void>
    deleteThreePid(medium: string, address: string): Promise<object>
    disableKeyBackup(): void
    downloadKeys(userIds: Array<string>, forceDownload: boolean): Promise<{
      [userId: string]: {
        [deviceId: string]: string // DeviceInfo
      }
    }>
    downloadKeysForUsers(userIds: Array<string>, opts?: object): Promise<object>
    dropFromPresenceList(callback: MatrixCallback, userIds: Array<string>): Promise<void>
    emit(event: string, listener: Function): boolean
    enableKeyBackup(info: object): void
    exportRoomKeys(): Promise<void>
    fetchRoomEvent(roomId: string, eventId: string, callback?: MatrixCallback): Promise<object>
    forceDiscardSession(roomId: string): void
    forget(roomId: string, deleteRoom: boolean, callback?: MatrixCallback): Promise<void>
    generateClientSecret(): string
    getAccessToken(): null | string
    getAccountData(eventType: EventType): null | object
    getCanResetTimelineCallback(): null | Function
    getCapabilities(fresh: boolean): Promise<object>
    getCasLoginUrl(redirectUrl: string): string
    getCurrentUploads(): Array<object>
    getDeviceEd25519Key(): null | string
    getDeviceId(): null | string
    getDevices(): Promise<object>
    getDomain (): null | string
    getEventMapper(): Function
    getEventSenderDeviceInfo(event: MatrixEvent): Promise<CryptoDeviceInfo>
    getEventTimeline(timelineSet: EventTimelineSet, eventId: string): Promise<EventTimeline>
    getFallbackAuthUrl(loginType: string, authSessionId: string): string
    getFilter(userId: string, filterId: string, allowCached: boolean): Promise<Filter>
    getGlobalBlacklistUnverifiedDevices(): boolean
    getGroup(groupId: string): Group
    getGroupInvitedUsers(groupId: string): Promise<object>
    getGroupProfile(groupId: string): Promise<object>
    getGroupRooms(groupId: string): Promise<object>
    getGroups(): Array<Group>
    getGroupSummary(groupId: string): Promise<object>
    getGroupUsers(groupId: string): Promise<object>
    getHomeserverUrl(): string
    getIdentityServerUrl(stripProto: boolean): string
    getIgnoredUsers(): Array<string>
    getJoinedGroups(): Promise<Array<object>>
    getJoinedRoomMembers(roomId: string): Promise<Array<object>>
    getJoinedRooms(): Promise<Array<object>>
    getKeyBackupEnabled(): boolean
    getKeyBackupVersion(): Promise<null | object>
    getKeyChanges(oldToken: string, newToken: string): Promise<object>
    getMediaConfig(callback: MatrixCallback): Promise<object>
    getNotifTimelineSet(): EventTimelineSet
    getOpenIdToken(): Promiose<object>
    getOrCreateFilter(filterName: string, filter: Filter): Promise<String>
    getPresenceList(callback: MatrixCallback): Promise<Array<object>>
    getProfileInfo(userId: string, info: string, callback?: MatrixCallback): Promise<object>
    getPublicisedGroups(userIds: string[]): Promise<object>
    getPushActionsForEvent(event: MatrixEvent): PushAction
    getPushers(callback: MatrixCallback): Promise<object>
    getPushRules(callback: MatrixCallback): Promise<object>
    getRoom(roomId: string): null | Room
    getRoomDirectoryVisibility(roomId: string, callback?: MatrixCallback): Promise<object>
    getRoomIdForAlias(alias: string, callback?: MatrixCallback): Promise<object>
    getRoomPushRule(scope: string, roomId: string): object
    getRooms(): Array<Room>
    getRoomTags(roomId: string, callback?: MatrixCallback): Promise<object>
    getRoomUpgradeHistory(roomId: string, verifyLinks: boolean): Array<Room>
    getScheduler(): null | MatrixScheduler
    getSsoLoginUrl(redirectUrl: string, loginType: string): string
    getStateEvent(
      roomId: string, eventType: EventType, stateKey: string, callback?: MatrixCallback
    ): Promise<object>
    getStoredDevice(userId: string, deviceId: string): Promise<CryptoDeviceInfo>
    getStoredDevicesForUser(userId: string): Promise<Array<CryptoDeviceInfo>>
    getSyncState(): null | string
    getSyncStateData(): null | object
    getThirdpartyLocation(protocol: string, params: object): Promise<object>
    getThirdpartyProtocols(): Promise<object>
    getThirdpartyUser(protocol: string, params: object): Promise<object>
    getThreePids(callback: MatrixCallback): Promise<object>
    getTurnServers(): Array<Object>
    getUrlPreview(url: string, ts: number, callback?: MatrixCallback): Promise<object>
    getUser(userId: string): null | User
    getUserId(): null | string
    getUserIdLocalpart (): null | string
    getUsers(): Array<User>
    getVisibleRooms(): Array<Room>
    importRoomKeys(keys: Array<object>): Promise<void>
    initCrypto(): void
    invite(roomId: string, userId: string, callback?: MatrixCallback): Promise<void>
    inviteByEmail(roomId: string, email: string, callback?: MatrixCallback): Promise<void>
    inviteByThreePid(roomId: string, medium: string, address: string, callback?: MatrixCallback): Promise<void>
    inviteToPresenceList(callback: MatrixCallback, userIds: Array<string>): Promise<void>
    inviteUserToGroup(groupId: string, userId: string): Promise<void>
    isCryptoEnabled(): boolean
    isEventSenderVerified(event: MatrixEvent): boolean
    isGuest(): boolean
    isKeyBackupTrusted(info: object): object
    isLoggedIn(): boolean
    isRoomEncrypted(roomId: string):  boolean
    isUserIgnored(userId: string): boolean
    isUsernameAvailable(username: string): Promise<boolean>
    joinGroup(groupId: string): Promise<void>
    joinRoom(roomIdOrAlias: string, opts: {
      syncRoom: boolean // True to do a room initial sync on the resulting room. If false, the returned Room object will have no current state. Default: true.
      inviteSignUrl: boolean  // If the caller has a keypair 3pid invite, the signing URL is passed in this parameter.
      viaServers: Array // <string> The server names to try and join through in addition to those that are automatically chosen.
    }, callback: MatrixCallback): Promise<Room>
    kick(roomId: string, userId: string, reason?: string, callback?: MatrixCallback): Promise<void>
    leave(roomId: string, callback?: MatrixCallback): Promise<void>
    leaveGroup(groupId: string): Promise<void>
    leaveRoomChain(roomId: string, includeFuture: boolean): Promise<object>
    login(loginType: string, data: object, callback?: MatrixCallback): Promise<void>
    loginFlows(callback?: MatrixCallback): Promise<void>
    loginWithPassword(user: string, password: string, callback?: MatrixCallback): Promise<void>
    loginWithSAML2(relayState: string, callback?: MatrixCallback): Promise<void>
    loginWithToken(token: string, callback?: MatrixCallback): Promise<void>
    logout(callback?: MatrixCallback): Promise<void>
    lookupThreePid(medium: string, address: string, callback?: MatrixCallback): Promise<object>
    makeTxnId(): string
    members(
      roomId: string, includeMembership: string, excludeMembership: string, atEventId: string, callback?: MatrixCallback,
    ): Promise<object>
    mxcUrlToHttp(mxcUrl: string, width: number, height: number, resizeMethod: string, allowDirectLinks: boolean): null | string
    paginateEventTimeline(eventTimeline: EventTimeline, opts?: object): Promise<boolean>
    peekInRoom(roomId: string): Promise<object>
    prepareKeyBackupVersion(password: string): Promise<object>
    publicRooms(options: {
      server: string  //  The remote server to query for the room list. Optional. If unspecified, get the local home server's public room list.
      limit: number //  Maximum number of entries to return
      since: string //  Token to paginate from
      filter: { //  Filter parameters
        generic_search_term: string // String to search for
      },

    }, callback): Promise<void>
    redactEvent(roomId: string, eventId: string, txnIdopt: string, callback?: MatrixCallback): Promise<void>
    register(
      username: string, password: string, sessionId: string,
      auth: object, bindThreepids: object, guestAccessToken: string,
      inhibitLogin: string, callback?: MatrixCallback,
    ): Promise<void>
    registerGuest(opts?: object, callback?:MatrixCallback): Promise<void>
    registerRequest(data: object, kind?: string, callback?: MatrixCallback): Promise<object>
    removeRoomFromGroup(groupId: string, roomId: string): Promise<void>
    removeRoomFromGroupSummary(groupId: string, roomId: string): Promise<void>
    removeUserFromGroup(groupId: string, userId: string): Promise<void>
    removeUserFromGroupSummary(groupId: string, userId: string): Promise<void>
    requestAdd3pidEmailToken(email: string, clientSecret: string, sendAttempt: number, nextLink: string): Promise<string>
    requestAdd3pidMsisdnToken(
      phoneCountry: string, phoneNumber: string, clientSecret: string, sendAttempt: number, nextLink: string,
    ): Promise<string>
    requestEmailToken(
      email: string, clientSecret: string, sendAttempt: number, nextLink: string, callback?: MatrixCallback,
    ): Promise<string>
    requestPasswordEmailToken(
      email: string, clientSecret: string, sendAttempt: number, nextLink: string, callback?: MatrixCallback,
    ): Promise<string>
    requestPasswordMsisdnToken(
      phoneCountry: string, phoneNumber: string, clientSecret: string, sendAttempt: number, nextLink: string,
    ): Promise<string>
    requestRegisterEmailToken(
      email: string, clientSecret: string, sendAttempt: number, nextLink: string,
    ): Promise<string>
    requestRegisterMsisdnToken(
      phoneCountry: string, phoneNumber: string, clientSecret: string, sendAttempt: number, nextLink: string,
    ): Promise<string>
    requestVerification(
      userId: string, methods: Array<string>, devices: Array<string>,
    ): Promise<CryptoVerificationBase>
    resendEvent(event: MatrixEvent, room: Room): Promise<void>
    resetNotifTimelineSet(): void
    resolveRoomAlias(roomAlias: string, callback?: MatrixCallback): Promise<void>
    retryImmediately(): boolean
    roomInitialSync(roomId: string, limit: number, callback?: MatrixCallback): Promise<void>
    roomState(roomId: string, callback?: MatrixCallback): Promise<void>
    scheduleAllGroupSessionsForBackup(): void
    scrollback(room: Room, limit: number, callback?: MatrixCallback): Promise<Room>
    search(
      opts: {
        next_batch: string  // the batch token to pass in the query string
        body: Object  // the JSON object to pass to the request body.
      },
      callback?: MatrixCallback,
    ): Promise<void>
    searchMessageText(
      opts: {
        query: string // The text to query.
        keys: string  // <optional> The keys to search on. Defaults to all keys. One of "content.body", "content.name", "content.topic".
      },
      callback?: MatrixCallback,
    ): Promise<void>
    searchRoomEvents(opts: {
      term: string  // the term to search for
      filter: Object  // a JSON filter object to pass in the request
    }): Promise<object>
    searchUserDirectory(opts: {
      term: string  // the term with which to search.
      limit:  number  // the maximum number of results to return. The server will apply a limit if unspecified.
    }): Promise<Array<object>>
    sendEmoteMessage(
      roomId: string, body: string, txnId: string, callback?: MatrixCallback,
    ): Promise<void>
    sendEvent(
      roomId: string, eventType: EventType, content: object, txnId: string, callback?: MatrixCallback,
    ): Promise<void>
    sendHtmlEmote(
      roomId: string, body: string, htmlBody: string, callback?: MatrixCallback,
    ): Promise<void>
    sendHtmlMessage(
      roomId: string, body: string, htmlBody: string, callback?: MatrixCallback,
    ): Promise<void>
    sendHtmlNotice(
      roomId: string, body: string, htmlBody: string, callback?: MatrixCallback,
    ): Promise<void>
    sendImageMessage(
      roomId: string, url: string, info: object, text: string, callback?: MatrixCallback,
    ): Promise<void>
    sendKeyBackup(
      roomId: string, sessionId: string, version: number, data: object,
    ): Promise<void>
    sendMessage(
      roomId: string, content: object, txnId: string, callback?: MatrixCallback,
    ): Promise<void>
    sendNotice(
      roomId: string, body: string, txnId: string, callback?: MatrixCallback,
    ): Promise<void>
    sendReadReceipt(event: MatrixEvent, callback?: MatrixCallback): Promise<void>
    sendReceipt(event: MatrixEvent, receiptType: string, callback?: MatrixCallback): Promise<void>
    sendStateEvent(
      roomId: string, eventType: EventType, content: object, stateKey: string, callback?: MatrixCallback,
    ): Promise<void>
    sendStickerMessage(
      roomId: string, url: string, info: object, text: string, callback?: MatrixCallback,
    ): Promise<void>
    sendTextMessage(roomId: string, body: string, txnId: string, callback?: MatrixCallback): Promise<void>
    sendToDevice(eventType: EventType, contentMap: {
      [key: string]: {
        [key2: string]: object
      }
    }, txnId?: string): Promise<object>
    sendTyping(roomId: string, isTyping: boolean, timeoutMs: number, callback?: MatrixCallback): Promise<void>
    setAccountData(eventType: EventType, contents: object, callback?: MatrixCallback): Promise<void>
    setAvatarUrl(url: string, callback?: MatrixCallback): Promise<void>
    setDeviceBlocked(userId: string, deviceId: string, blocked?: boolean): Promise<void>
    setDeviceDetails(device_id: string, body: object): Promise<object>
    setDeviceKnown(userId: string, deviceId: string, known?: boolean): Promise<void>
    setDeviceVerified(userId: string, deviceId: string, verified?: boolean): Promise<void>
    setDisplayName(name: string, callback?: MatrixCallback): Promise<void>
    setForceTURN(forceTURN: boolean): void
    setGlobalBlacklistUnverifiedDevices(value: boolean): void
    setGroupJoinPolicy(groupId: string, policy: object): Promise<void>
    setGroupProfile(groupId: string, profile: {
      name: string  // <optional> Name of the group
      avatar_url: string  // <optional> MXC avatar URL
      short_description: string // <optional> A short description of the room
      long_description: string  // <optional> A longer HTML description of the room
    }): Promise<void>
    setGroupPublicity(groupId: string, isPublic: boolean): Promise<void>
    setGuest(isGuest: boolean): void
    setGuestAccess(roomId: string, opts: {
      allowJoin:boolean // True to allow guests to join this room. This implicitly gives guests write access. If false or not given, guests are explicitly forbidden from joining the room.
      allowRead:boolean // True to set history visibility to be world_readable. This gives guests read access *from this point forward*. If false or not given, history visibility is not modified.
    }): Promise<void>
    setIgnoredUsers(userIds: string[], callback?: MatrixCallback): Promise<object>
    setNotifTimelineSet(notifTimelineSet: EventTimelineSet): void
    setPassword(authDict: object, newPassword: string, callback?: MatrixCallback): Promise<void>
    setPowerLevel(
      roomId: string, userId: string, powerLevel: number, event: MatrixEvent, callback?: MatrixCallback,
    ): Promise<void>
    setPresence(opts: {
      presence: string  // One of "online", "offline" or "unavailable"
      status_msg: string  // The status message to attach.
    }, callback): Promise<void>
    setProfileInfo(info: string, data: object, callback?: MatrixCallback): Promise<void>
    setPusher(pusher: object, callback?: MatrixCallback): Promise<void>
    setPushRuleActions(
      scope: string, kind: string, ruleId: string, actions: Array<string>, callback?: MatrixCallback,
    ): Promise<object>
    setPushRuleEnabled(
      scope: string, kind: string, ruleId: string, enabled: boolean, callback?: MatrixCallback,
    ): Promise<object>
    setRoomAccountData(
      roomId: string, eventType: EventType, content: object, callback?: MatrixCallback,
    ): Promise<void>
    setRoomDirectoryVisibility(
      roomId: string, visibility: string, callback?: MatrixCallback,
    ): Promise<object>
    setRoomDirectoryVisibilityAppService(
      networkId: string, roomId: string, visibility: string, callback?: MatrixCallback,
    ): Promise<object>
    setRoomEncryption(roomId: string, config: object): Promise<void>
    setRoomMutePushRule(scope: string, roomId: string, mute: string): Promise<object>
    setRoomName(roomId: string, name: string, callback?: MatrixCallback): Promise<void>
    setRoomReadMarkers(roomId: string, eventId: string, rrEvent: string): Promise<void>
    setRoomReadMarkersHttpRequest(roomId: string, rmEventId: string, rrEventId: string): Promise<void>
    setRoomTag(roomId: string, tagName: string, metadata: object, callback?: MatrixCallback): Promise<void>
    setRoomTopic(roomId: string, topic: string, callback?: MatrixCallback): Promise<void>

    startClient(opts?: {
      initialSyncLimit?: Number  // <optional> The event limit= to apply to initial sync. Default: 8.
      includeArchivedRooms?: Boolean // <optional> True to put archived=true on the /initialSync request. Default: false.
      resolveInvitesToProfiles?: Boolean // <optional> True to do /profile requests on every invite event if the displayname/avatar_url is not known for this user ID. Default: false.
      pendingEventOrdering?: String  // <optional> Controls where pending messages appear in a room's timeline. If "chronological", messages will appear in the timeline when the call to sendEvent was made. If "detached", pending messages will appear in a separate list, accessbile via module:models/room#getPendingEvents. Default: "chronological".
      pollTimeout?: Number // <optional> The number of milliseconds to wait on /sync. Default: 30000 (30 seconds).
      filter?: Filter  // <optional> The filter to apply to /sync calls. This will override the opts.initialSyncLimit, which would normally result in a timeline limit filter.
      disablePresence?: Boolean  // <optional> True to perform syncing without automatically updating presence.
      lazyLoadMembers?: Boolean  // <optional> True to not load all membership events during initial sync but fetch them when needed by calling `loadOutOfBandMembers` This will override the filter option at this moment.
    }): void
    stopClient(): void
    stopPeeking(): void
    submitMsisdnToken(sid: string, clientSecret: string, token: string): Promise<object>
    supportsVoip(): boolean
    syncLeftRooms(): Promise<void>
    turnServer(callback?: MatrixCallback): Promise<void>
    unban(roomId: string, userId: string, callback?: MatrixCallback): Promise<void>
    updateGroupRoomVisibility(groupId: string, roomId: string, isPublic: boolean): Promise<void>
    upgradeRoom(roomId: string, newVersion: string): Promise<{ replacement_room: object }>
    uploadContent(file: object, opts: {
      includeFilename: boolean  // <optional> if false will not send the filename, e.g for encrypted file uploads where filename leaks are undesirable. Defaults to true.
      type: string  // <optional> Content-type for the upload. Defaults to file.type, or applicaton/octet-stream.
      rawResponse: boolean  // <optional> Return the raw body, rather than parsing the JSON. Defaults to false (except on node.js, where it defaults to true for backwards compatibility).
      onlyContentUri: boolean // <optional> Just return the content URI, rather than the whole body. Defaults to false (except on browsers, where it defaults to true for backwards compatibility). Ignored if opts.rawResponse is true.
      callback: function  // <optional> Deprecated. Optional. The callback to invoke on success/failure. See the promise return values for more information.
      progressHandler: function // <optional> Optional. Called when a chunk of data has been uploaded, with an object containing the fields `loaded` (number of bytes transferred) and `total` (total size, if known).
    }): Promise<object>
    uploadKeys(): object
    uploadKeysRequest(content: object, opts?: object, callback?: MatrixCallback): Promise<object>

  }

  /**
   * The following types are the classes that To Be Typing:
   */
  export type CryptoDeviceInfo = any
  export type EventTimeline = any
  export type EventTimelineSet = any
  export type Group = any
  export type PushAction = any
  export type MatrixScheduler = any
  export type CryptoVerificationBase = any
  export type RoomSummary = any
  export type EventStatus = any

  export interface CreateRoomOptions {
    invite          : Array<string>  //  <string> A list of user IDs to invite to this room.
    name            : string         //  The name to give this room.
    room_alias_name : string         //  The alias localpart to assign to this room.
    topic           : string         //  The topic to give this room.
    visibility      : string         //  Either 'public' or 'private'.
  }

  export type FilterComponent = any

  export class Filter {

    static fromJson (userId: string, filterId: string, jsonObj: object): Filter

    constructor (
      userId: string,  // The user ID for this filter.
      filterId?: string // <optional> The filter ID if known.
    )

    filterRoomTimeline (events: MatrixEvent): Array<MatrixEvent>
    getDefinition(): object
    getFilterId(): null | number
    getRoomTimelineFilterComponent(): FilterComponent
    setDefinition(definition: object): void
    setIncludeLeaveRooms(includeLeave: boolean): void
    setTimelineLimit(limit: number): void

  }

  export class MatrixEvent {

    public event          : object       //  The raw (possibly encrypted) event. Do not access this property directly unless you absolutely have to. Prefer the getter methods defined on this class. Using the getter methods shields your app from changes to event JSON between Matrix versions.
    public sender         : RoomMember   //  The room member who sent this event, or null e.g. this is a presence event. This is only guaranteed to be set for events that appear in a timeline, ie. do not guarantee that it will be set on state events.
    public target         : RoomMember   //  The room member who is the target of this event, e.g. the invitee, the person being banned, etc.
    public status         : EventStatus  //  The sending status of the event.
    public error          : Error        //  most recent error associated with sending the event, if any
    public forwardLooking : boolean      //  True if this event is 'forward looking', meaning that getDirectionalContent() will return event.content and not event.prev_content. Default: true. This property is experimental and may change.

    constructor (event: object)

  }

  export class RoomMember {

    public roomId         : string   // The room ID for this member.
    public userId         : string   // The user ID of this member.
    public typing         : boolean  // True if the room member is currently typing.
    public name           : string   // The human-readable name for this room member. This will be disambiguated with a suffix of " (@user_id:matrix.org)" if another member shares the same displayname.
    public rawDisplayName : string   // The ambiguous displayname of this room member.
    public powerLevel     : Number   // The power level for this room member.
    public powerLevelNorm : Number   // The normalised power level (0-100) for this room member.
    public user           : User     // The User object for this room member, if one exists.
    public membership     : MembershipType   // The membership state for this room member e.g. 'join'.
    public events         : Object   // The events describing this RoomMember.

    constructor (roomId: string, userId: string)

    getAvatarUrl(
      baseUrl: string, width: number, height: number, resizeMethod: string, allowDefault: boolean, allowDirectLinks: boolean
    ): null | string
    getDMInviter(): string
    getLastModifiedTime(): number
    getMxcAvatarUrl(): string
    isOutOfBand(): boolean
    markOutOfBand(): void
    setMembershipEvent(event: MatrixEvent, roomState: RoomState): void
    setPowerLevelEvent(powerLevelEvent: MatrixEvent): void
    setTypingEvent(event: MatrixEvent): void

  }

  export class RoomState {

    constructor (roomId?: string, oobMemberFlags?: object)

    clearOutOfBandMembers       ()                                             : void
    clone                       ()                                             : RoomState
    getInvitedMemberCount       ()                                             : number
    getInviteForThreePidToken   (token: string)                                : undefined | MatrixEvent
    getJoinedMemberCount        ()                                             : number
    getLastModifiedTime         ()                                             : number
    getMember                   (userId: string)                               : RoomMember
    getMembers                  ()                                             : Array<RoomMember>
    getMembersExcept            (excludedIds: string[])                        : Array<RoomMember>
    getSentinelMember           (userId: string)                               : RoomMember
    getStateEvents              (eventType: EventType, stateKey:string)        : MatrixEvent | Array<MatrixEvent>
    getUserIdsWithDisplayName   (displayName: string)                          : Array<string>
    markOutOfBandMembersFailed  ()                                             : void
    markOutOfBandMembersStarted ()                                             : void
    mayClientSendStateEvent     (stateEventType: EventType, cli: MatrixClient) : boolean
    maySendEvent                (eventType: EventType, userId: string)         : boolean
    maySendMessage              (userId: string)                               : boolean
    maySendRedactionForEvent    (mxEvent: MatrixEvent, userId: string)         : boolean
    maySendStateEvent           (stateEventType: EventType, userId: string)    : boolean
    mayTriggerNotifOfType       (notifLevelKey: string, userId: string)        : boolean
    needsOutOfBandMembers       ()                                             : boolean
    setInvitedMemberCount       (count: number)                                : void
    setJoinedMemberCount        (count: number)                                : void
    setOutOfBandMembers         (stateEvents: MatrixEvent)                     : void
    setStateEvents              (stateEvents: MatrixEvent)                     : void
    setTypingEvent              (event: MatrixEvent)                           : void
    setUnknownStateEvents       (events: MatrixEvent)                          : void

  }
}
