import { makeInspectable } from '../utils'
import { TelegramClient } from '../../client'
import { tl } from '@mtcute/tl'

/**
 * An invite link
 */
export class ChatInviteLink {
    readonly client: TelegramClient
    readonly raw: tl.RawChatInviteExported

    constructor (client: TelegramClient, raw: tl.RawChatInviteExported) {
        this.client = client
        this.raw = raw
    }

    /**
     * The invite link as a `t.me/joinchat/` string.
     *
     * If the link was created by another administrator, the second
     * part of the link will be censored with `...` (e.g. `https://t.me/joinchat/BGxxHIg4...`
     */
    get link(): string {
        return this.raw.link
    }

    /**
     * Creation date of the link
     */
    get date(): Date {
        return new Date(this.raw.date * 1000)
    }

    /**
     * Whether this link is primary (i.e. "permanent")
     */
    get isPrimary(): boolean {
        return this.raw.permanent!
    }

    /**
     * Whether this link was revoked and can't be used anymore
     */
    get isRevoked(): boolean {
        return this.raw.revoked!
    }

    /**
     * The date since which the link will be valid (if any)
     */
    get startDate(): Date | null {
        return this.raw.startDate ? new Date(this.raw.startDate * 1000) : null
    }

    /**
     * The date until which the link will be valid (if any)
     */
    get endDate(): Date | null {
        return this.raw.expireDate ? new Date(this.raw.expireDate * 1000) : null
    }

    /**
     * Maximum number of users that can be members of this chat
     * at the same time after joining using this link.
     *
     * Integer in range `[1, 99999]` or `Infinity` if unspecified
     */
    get usageLimit(): number {
        return this.raw.usageLimit ?? Infinity
    }

    /**
     * Number of users currently in the chat that joined using this link
     */
    get usage(): number {
        return this.raw.usageLimit ?? 0
    }
}

makeInspectable(ChatInviteLink)