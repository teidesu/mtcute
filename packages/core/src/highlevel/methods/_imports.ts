/* eslint-disable @typescript-eslint/no-unused-vars */

// @copy
import { tdFileId } from '@mtcute/file-id'
// @copy
import { tl } from '@mtcute/tl'

// @copy
import { RpcCallOptions } from '../../network/index.js'
// @copy
import { MaybeArray, MaybePromise, MtUnsupportedError, PartialExcept, PartialOnly } from '../../types/index.js'
// @copy
import { BaseTelegramClient, BaseTelegramClientOptions } from '../base.js'
// @copy
import { ITelegramClient } from '../client.types.js'
// @copy
import {
    AllStories,
    ArrayPaginated,
    ArrayWithTotal,
    Boost,
    BoostSlot,
    BoostStats,
    BotChatJoinRequestUpdate,
    BotCommands,
    BotReactionCountUpdate,
    BotReactionUpdate,
    BotStoppedUpdate,
    CallbackQuery,
    Chat,
    ChatEvent,
    ChatInviteLink,
    ChatInviteLinkMember,
    ChatJoinRequestUpdate,
    ChatMember,
    ChatMemberUpdate,
    ChatPreview,
    ChosenInlineResult,
    DeleteMessageUpdate,
    DeleteStoryUpdate,
    Dialog,
    FileDownloadLocation,
    FileDownloadParameters,
    ForumTopic,
    GameHighScore,
    HistoryReadUpdate,
    InlineCallbackQuery,
    InlineQuery,
    InputChatEventFilters,
    InputDialogFolder,
    InputFileLike,
    InputInlineResult,
    InputMediaLike,
    InputMessageId,
    InputPeerLike,
    InputPrivacyRule,
    InputReaction,
    InputStickerSet,
    InputStickerSetItem,
    InputText,
    MaybeDynamic,
    Message,
    MessageMedia,
    MessageReactions,
    ParametersSkip2,
    ParsedUpdate,
    PeerReaction,
    PeersIndex,
    PeerStories,
    Photo,
    Poll,
    PollUpdate,
    PollVoteUpdate,
    PreCheckoutQuery,
    RawDocument,
    ReplyMarkup,
    SentCode,
    Sticker,
    StickerSet,
    StickerSourceType,
    StickerType,
    StoriesStealthMode,
    Story,
    StoryInteractions,
    StoryUpdate,
    StoryViewer,
    StoryViewersList,
    TakeoutSession,
    TextWithEntities,
    TypingStatus,
    UploadedFile,
    UploadFileLike,
    User,
    UserStatusUpdate,
    UserTypingUpdate,
} from '../types/index.js'
// @copy
import { StringSessionData } from '../utils/string-session.js'
