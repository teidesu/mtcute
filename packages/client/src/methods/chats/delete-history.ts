import { TelegramClient } from '../../client'
import { InputPeerLike } from '../../types'
import { isInputPeerChannel } from '../../utils/peer-utils'
import { createDummyUpdate } from '../../utils/updates-utils'

/**
 * Delete communication history (for private chats
 * and legacy groups)
 *
 * @internal
 */
export async function deleteHistory(
    this: TelegramClient,
    chat: InputPeerLike,
    params?: {
        /**
         * Deletion mode. Can be:
         * - `delete`: delete messages (only for yourself)
         * - `clear`: delete messages (only for yourself)
         * - `revoke`: delete messages for all users
         * - I'm not sure what's the difference between `delete` and `clear`,
         * but they are in fact different flags in TL object.
         *
         * @default  'delete'
         */
        mode: 'delete' | 'clear' | 'revoke'

        /**
         * Maximum ID of message to delete.
         *
         * @default  0, i.e. remove all messages
         */
        maxId?: number
    },
): Promise<void> {
    const { mode = 'delete', maxId = 0 } = params ?? {}

    const peer = await this.resolvePeer(chat)

    const res = await this.call({
        _: 'messages.deleteHistory',
        justClear: mode === 'clear',
        revoke: mode === 'revoke',
        peer,
        maxId,
    })

    if (isInputPeerChannel(peer)) {
        this._handleUpdate(createDummyUpdate(res.pts, res.ptsCount, peer.channelId))
    } else {
        this._handleUpdate(createDummyUpdate(res.pts, res.ptsCount))
    }
}
