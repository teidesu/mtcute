import EventEmitter from 'events'
import { tl } from '@mtcute/tl'

import { Logger } from '../utils'
import {
    SessionConnection,
    SessionConnectionParams,
} from './session-connection'
import { MtprotoSession } from './mtproto-session'

export class MultiSessionConnection extends EventEmitter {
    private _log: Logger
    readonly _sessions: MtprotoSession[]

    constructor(
        readonly params: SessionConnectionParams,
        private _count: number,
        log: Logger
    ) {
        super()
        this._log = log.create('multi')

        this._sessions = []
        this._updateConnections()
    }

    protected _connections: SessionConnection[] = []

    setCount(count: number, doUpdate = true): void {
        this._count = count
        if (doUpdate) this._updateConnections()
    }

    private _updateSessions(): void {
        // there are two cases
        // 1. this msc is main, in which case every connection should have its own session
        // 2. this msc is not main, in which case all connections should share the same session
        if (!this.params.isMainConnection) {
            // case 2
            if (this._sessions.length === 0) {
                this._sessions.push(
                    new MtprotoSession(
                        this.params.crypto,
                        this._log.create('session'),
                        this.params.readerMap,
                        this.params.writerMap
                    )
                )
            }

            // shouldn't happen, but just in case
            while (this._sessions.length > 1) {
                this._sessions.pop()!.reset()
            }

            return
        }

        // case 1
        if (this._sessions.length === this._count) return

        if (this._sessions.length > this._count) {
            // destroy extra sessions
            for (let i = this._sessions.length - 1; i >= this._count; i--) {
                this._sessions[i].reset()
            }

            this._sessions.splice(this._count)
            return
        }

        while (this._sessions.length < this._count) {
            const idx = this._sessions.length
            const session = new MtprotoSession(
                this.params.crypto,
                this._log.create('session'),
                this.params.readerMap,
                this.params.writerMap
            )

            // brvh
            if (idx !== 0) session._authKey = this._sessions[0]._authKey

            this._sessions.push(session)
        }
    }

    private _updateConnections(): void {
        this._updateSessions()
        if (this._connections.length === this._count) return

        if (this._connections.length > this._count) {
            // destroy extra connections
            for (let i = this._connections.length - 1; i >= this._count; i--) {
                this._connections[i].removeAllListeners()
                this._connections[i].destroy()
            }

            this._connections.splice(this._count)
            return
        }

        // create new connections
        for (let i = this._connections.length; i < this._count; i++) {
            const session = this.params.isMainConnection
                ? this._sessions[i]
                : this._sessions[0]
            const conn = new SessionConnection(
                {
                    ...this.params,
                    isMainConnection: this.params.isMainConnection && i === 0,
                },
                session
            )

            conn.on('update', (update) => this.emit('update', update))
            conn.on('error', (err) => this.emit('error', err, conn))
            conn.on('key-change', (key) => {
                this.emit('key-change', i, key)

                // notify other connections
                for (const conn_ of this._connections) {
                    if (conn_ === conn) continue
                    conn_.onConnected()
                }
            })
            conn.on('tmp-key-change', (key, expires) =>
                this.emit('tmp-key-change', i, key, expires)
            )
            conn.on('auth-begin', () => {
                this._log.debug('received auth-begin from connection %d', i)
                this.emit('auth-begin', i)

                // we need to reset temp auth keys if there are any left

                this._connections.forEach((conn_) => {
                    conn_._session._authKeyTemp.reset()
                    if (conn_ !== conn) conn_.reconnect()
                })
            })
            conn.on('usable', () => this.emit('usable', i))
            conn.on('request-auth', () => this.emit('request-auth', i))

            this._connections.push(conn)
        }
    }

    destroy(): void {
        this._connections.forEach((conn) => conn.destroy())
        this._sessions.forEach((sess) => sess.reset())
    }

    private _nextConnection = 0

    sendRpc<T extends tl.RpcMethod>(
        request: T,
        stack?: string,
        timeout?: number
    ): Promise<tl.RpcCallReturn[T['_']]> {
        if (this.params.isMainConnection) {
            // find the least loaded connection
            let min = Infinity
            let minIdx = 0
            for (let i = 0; i < this._connections.length; i++) {
                const conn = this._connections[i]
                const total =
                    conn._session.queuedRpc.length +
                    conn._session.pendingMessages.size()

                if (total < min) {
                    min = total
                    minIdx = i
                }
            }

            return this._connections[minIdx].sendRpc(request, stack, timeout)
        }

        // round-robin connections
        // since they all share the same session, it doesn't matter which one we use
        return this._connections[
            this._nextConnection++ % this._connections.length
        ].sendRpc(request, stack, timeout)
    }

    async changeDc(dc: tl.RawDcOption, authKey?: Buffer | null): Promise<void> {
        await Promise.all(
            this._connections.map((conn) => conn.changeDc(dc, authKey))
        )
    }

    connect(): void {
        for (const conn of this._connections) {
            conn.connect()
        }
    }

    async setAuthKey(
        authKey: Buffer | null,
        temp = false,
        idx = 0
    ): Promise<void> {
        const session = this._sessions[idx]
        const key = temp ? session._authKeyTemp : session._authKey
        await key.setup(authKey)
    }

    requestAuth(): void {
        this._connections[0]._authorize()
    }
}
