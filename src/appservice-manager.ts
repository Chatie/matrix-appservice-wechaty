import {
  Bridge,
  MatrixUser,
  RoomBridgeStore,
  UserBridgeStore,
  MatrixRoom,
  // RemoteUser,
  // Intent,
}                   from 'matrix-appservice-bridge'
import {
  WechatyOptions,
}                   from 'wechaty'

import cuid from 'cuid'

import {
  log,
  AppserviceWechatyData,
  APPSERVICE_WECHATY_DATA_KEY,
  WECHATY_LOCALPART,
  AppserviceMatrixRoomData,
  APPSERVICE_USER_DATA_KEY,
  AppserviceMatrixUserData,
  APPSERVICE_ROOM_DATA_KEY,
  APPSERVICE_NAME_POSTFIX,
}                               from './config'

// const REMOTE_CONTACT_DELIMITER = '<->'

export class AppserviceManager {

  public bridge!    : Bridge
  public roomStore! : RoomBridgeStore
  public userStore! : UserBridgeStore

  constructor () {
    log.verbose('AppserviceManager', 'constructor()')
  }

  public setBridge (matrixBridge: Bridge): void {
    log.verbose('AppserviceManager', 'bridge()')

    if (this.bridge) {
      throw new Error('bridge can not be set twice!')
    }

    this.bridge = matrixBridge

    const userBridgeStore = matrixBridge.getUserStore()
    const roomBridgeStore = matrixBridge.getRoomStore()

    if (!userBridgeStore) {
      throw new Error('can not get UserBridgeStore')
    }
    if (!roomBridgeStore) {
      throw new Error('can not get RoomBridgeStore')
    }
    this.roomStore = roomBridgeStore
    this.userStore = userBridgeStore
  }

  public appserviceUserId (): string {
    const bridgeOpts = this.bridge.opts
    const localpart  = bridgeOpts.registration.sender_localpart
    const domain     = bridgeOpts.domain

    return [
      '@',
      localpart,
      ':',
      domain,
    ].join('')
  }

  public async appserviceUser (): Promise<MatrixUser> {
    const matrixUserId = this.appserviceUserId()
    const matrixUser = await this.userStore.getMatrixUser(matrixUserId)
    if (!matrixUser) {
      throw new Error('no matrix user from store for id ' + matrixUserId)
    }
    return matrixUser
  }

  public async matrixUserList (): Promise<MatrixUser[]> {
    log.verbose('AppserviceManager', 'matrixUserList()')

    const wechatyData = {
      enabled: true,
    } as AppserviceWechatyData

    const query = this.storeQuery(APPSERVICE_WECHATY_DATA_KEY, wechatyData)

    const matrixUserList = await this.userStore.getByMatrixData(query)
    log.silly('AppserviceManager', 'matrixUserList() found %s users', matrixUserList.length)

    return matrixUserList
  }

  public wechatyOptions (matrixUser: MatrixUser, wechatyOptions: WechatyOptions): Promise<void>
  public wechatyOptions (matrixUser: MatrixUser): WechatyOptions

  public wechatyOptions (
    matrixUser      : MatrixUser,
    wechatyOptions? : WechatyOptions,
  ): Promise<void> | WechatyOptions {

    if (wechatyOptions) {
      // SET
      log.verbose('AppserviceManager', 'wechatyOptions(%s, "%s") SET',
        matrixUser.getId(), JSON.stringify(wechatyOptions))
      const wechatyData = {
        ...matrixUser.get(
          APPSERVICE_WECHATY_DATA_KEY
        ),
      } as AppserviceWechatyData

      wechatyData.wechatyOptions = wechatyOptions
      matrixUser.set(APPSERVICE_WECHATY_DATA_KEY, wechatyData)
      return this.userStore.setMatrixUser(matrixUser)

    } else {
      // GET
      log.verbose('AppserviceManager', 'wechatyOptions(%s) GET', matrixUser.getId())

      const wechatyData = {
        ...matrixUser.get(
          APPSERVICE_WECHATY_DATA_KEY
        ),
      } as AppserviceWechatyData

      log.silly('AppserviceManager', 'wechatyOptions(%s) GOT "%s"',
        matrixUser.getId(), JSON.stringify(wechatyData.wechatyOptions))

      return {
        ...wechatyData.wechatyOptions,
      }
    }

  }

  public isVirtual (matrixUserId: string): boolean {
    return this.bridge.getBot()
      .isRemoteUser(matrixUserId)
  }

  public isBot (matrixUserId: string): boolean {
    const appserviceUserId = this.appserviceUserId()
    return appserviceUserId === matrixUserId
  }

  public isUser (matrixUserId: string): boolean {
    return !(
      this.isBot(matrixUserId)
        || this.isVirtual(matrixUserId)
    )
  }

  public isEnabled (matrixUser: MatrixUser): boolean {
    log.verbose('AppserviceManager', 'isEnable(%s)', matrixUser.getId())

    const wechatyData = {
      ...matrixUser.get(
        APPSERVICE_WECHATY_DATA_KEY
      ),
    } as AppserviceWechatyData

    log.silly('AppserviceManager', 'isEnable(%s) -> %s', matrixUser.getId(), wechatyData.enabled)
    return !!wechatyData.enabled
  }

  public async enable (matrixUser: MatrixUser): Promise<void> {
    log.verbose('AppserviceManager', 'enable(%s)', matrixUser.getId())

    if (this.isEnabled(matrixUser)) {
      throw new Error(`matrixUserId ${matrixUser.getId()} has already enabled`)
    }

    const data = {
      enabled: true,
    } as AppserviceWechatyData

    matrixUser.set(APPSERVICE_WECHATY_DATA_KEY, data)
    await this.userStore.setMatrixUser(matrixUser)
  }

  public async disable (matrixUser: MatrixUser): Promise<void> {
    log.verbose('AppserviceManager', 'disable(%s)', matrixUser.getId())

    const wechatyData = {
      ...matrixUser.get(
        APPSERVICE_WECHATY_DATA_KEY
      ),
    } as AppserviceWechatyData
    wechatyData.enabled = false

    matrixUser.set(APPSERVICE_WECHATY_DATA_KEY, wechatyData)
    await this.userStore.setMatrixUser(matrixUser)
  }

  public async matrixUser (byUserId: string): Promise<MatrixUser> {
    log.verbose('AppserviceManager', 'matrixUser(%s)', byUserId)

    let matrixUser = await this.userStore.getMatrixUser(byUserId)
    if (!matrixUser) {
      log.silly('AppserviceManager', 'matrixUser(%s) not exist in store, created.', byUserId)
      matrixUser = new MatrixUser(byUserId)
      await this.userStore.setMatrixUser(matrixUser)
    }
    return matrixUser
  }

  public async matrixRoom (byRoomId: string): Promise<MatrixRoom> {
    log.verbose('AppserviceManager', 'matrixRoom(%s)', byRoomId)

    let matrixRoom = await this.roomStore.getMatrixRoom(byRoomId)
    if (!matrixRoom) {
      log.silly('AppserviceManager', 'matrixRoom(%s) not exist in store, created.', byRoomId)
      matrixRoom = new MatrixRoom(byRoomId)
      await this.roomStore.setMatrixRoom(matrixRoom)
    }
    return matrixRoom
  }

  public storeQuery (
    forDataKey  : string,
    fromData    : AppserviceWechatyData| AppserviceMatrixRoomData | AppserviceMatrixUserData,
  ): {
    [key: string]: string,
  } {
    log.verbose('AppserviceManager', 'storeQuery(%s, "%s")',
      forDataKey,
      JSON.stringify(fromData),
    )

    const query = {} as { [key: string]: string }
    Object.keys(fromData).map(key => {
      const value = fromData[key as keyof typeof fromData]
      query[`${forDataKey}.${key}`] = value
    })
    return query
  }

  public async directMessage (
    inMatrixRoom : MatrixRoom,
    withText     : string,
  ): Promise<void> {
    log.verbose('AppserviceManager', 'directMessage(%s, %s)',
      inMatrixRoom.getId(),
      withText,
    )

    const {
      directUserId,
    } = {
      ...inMatrixRoom.get(
        APPSERVICE_ROOM_DATA_KEY
      ),
    } as AppserviceMatrixRoomData

    if (!directUserId) {
      throw new Error(`room ${inMatrixRoom.getId()} is not a direct message room set by manager`)
    }

    try {
      await this.bridge.getIntent(directUserId).sendText(
        inMatrixRoom.getId(),
        withText,
      )
    } catch (e) {
      log.error('AppserviceManager', 'directMessage() rejection for room ' + inMatrixRoom.getId())
      throw e
    }
  }

  /**
   * GET / SET direct message room between matrix user and the bot
   */
  public async directMessageRoom (ofMatrixUser: MatrixUser)                           : Promise<null | MatrixRoom>
  public async directMessageRoom (ofMatrixUser: MatrixUser, toMatrixRoom: MatrixRoom) : Promise<void>

  public async directMessageRoom (
    ofMatrixUser  : MatrixUser,
    toMatrixRoom? : MatrixRoom,
  ): Promise<void | null | MatrixRoom> {
    log.verbose('AppserviceManager', 'directMessageRoom(%s, %s)',
      ofMatrixUser.getId(),
      (toMatrixRoom && toMatrixRoom.getId()) || '',
    )

    const userData = {
      ...ofMatrixUser.get(
        APPSERVICE_USER_DATA_KEY
      ),
    } as AppserviceMatrixUserData

    console.info('DEBUG: userData: ', userData)

    const that = this

    if (toMatrixRoom) {                // SET
      return directMessageRoomSet()
    } else {                            // GET
      return directMessageRoomGet()
    }

    async function directMessageRoomGet () {
      const directRoomId = userData.directRoomId
      if (!directRoomId) {
        return null
      }

      let directMessageRoom = await that.roomStore
        .getMatrixRoom(directRoomId)
      if (!directMessageRoom) {
        throw new Error('no room found in store from id ' + directRoomId)
      }

      log.silly('AppserviceManager', 'directMessageRoomGet() return %s', directRoomId)
      return directMessageRoom
    }

    async function directMessageRoomSet () {
      if (!toMatrixRoom) {
        throw new Error('no toMatrixRoom')
      }
      if (userData.directRoomId) {
        log.error('AppserviceManager', 'directMessageRoomSet() directRoomId %s already exists for user %s, but someone want to replaced it with %s',
          userData.directRoomId,
          ofMatrixUser.getId(),
          toMatrixRoom.getId(),
        )
        throw new Error('direct message room id had already been set for ' + ofMatrixUser.getId())
      }
      userData.directRoomId = toMatrixRoom.getId()
      ofMatrixUser.set(APPSERVICE_USER_DATA_KEY, userData)

      await that.userStore.setMatrixUser(ofMatrixUser)
    }
  }

  /**
   * Create a direct room between the consumer and the bot
   */
  async createDirectRoom (toConsumerMatrixUser: MatrixUser): Promise<MatrixRoom>
  /**
   * Create a direct room between the consumer and the virtual user
   */
  async createDirectRoom (toConsumerMatrixUser: MatrixUser, fromVirtualMatrixUser?: MatrixUser, roomName?: string): Promise<MatrixRoom>

  async createDirectRoom (
    toConsumerMatrixUser   : MatrixUser,
    fromVirtualMatrixUser? : MatrixUser,
    roomName?              : string,
  ): Promise<MatrixRoom> {
    log.verbose('AppserviceService', 'createDirectRoom(%s, %s, %s)',
      toConsumerMatrixUser.getId(),
      (fromVirtualMatrixUser && fromVirtualMatrixUser.getId()) || '',
      roomName || '',
    )

    const intent = this.bridge.getIntent(
      fromVirtualMatrixUser && fromVirtualMatrixUser.getId()
    )

    roomName = roomName
      ? roomName + APPSERVICE_NAME_POSTFIX
      : 'Wechaty Appservice Bot'

    const roomInfo = await intent.createRoom({
      createAsClient: true,
      options: {
        invite: [
          toConsumerMatrixUser.getId(),
        ],
        is_direct  : true,
        name       : roomName,
        preset     : 'trusted_private_chat',
        visibility : 'private',
      },
    })

    const matrixRoom = new MatrixRoom(roomInfo.room_id)

    const directUserId = fromVirtualMatrixUser
      ? fromVirtualMatrixUser.getId()
      : this.appserviceUserId()
    const consumerId = toConsumerMatrixUser.getId()

    const roomData   = {
      consumerId,
      directUserId,
    } as AppserviceMatrixRoomData

    matrixRoom.set(APPSERVICE_ROOM_DATA_KEY, roomData)
    await this.roomStore.setMatrixRoom(matrixRoom)

    /**
     * Save this new created direct message room into matrix user data
     *
     * 1. If fromVirtualMatrixuser exist, this direct room is for it.
     * 2. If ther's only toConsumerMatrixUser been set,
     * then it's direct message room between the consumer and the appservice bot.
     */
    await this.directMessageRoom(
      fromVirtualMatrixUser || toConsumerMatrixUser,
      matrixRoom,
    )

    return matrixRoom
  }

  /**
   * The group room will be created by the bot itself.
   *
   */
  async createRoom (
    withMatrixIdList : string[],
    withName         : string,
  ): Promise<MatrixRoom> {
    log.verbose('AppserviceService', 'createRoom([%s], %s)',
      withMatrixIdList.join(','),
      withName,
    )

    // use bot intent to create a group room
    const intent = this.bridge.getIntent()

    const roomInfo = await intent.createRoom({
      createAsClient: false,
      options: {
        invite: withMatrixIdList,
        name: withName + APPSERVICE_NAME_POSTFIX,
        visibility: 'private',
      },
    })

    const matrixRoom = new MatrixRoom(roomInfo.room_id)
    return matrixRoom
  }

  public generateVirtualUserId () {
    return [
      '@',
      WECHATY_LOCALPART,
      '_',
      cuid(),
      ':',
      this.bridge.opts.domain,
    ].join('')
  }

  /*******************
   * Private Methods *
   *******************/

}
