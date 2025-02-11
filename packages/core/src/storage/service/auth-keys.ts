import type { IAuthKeysRepository } from '../repository/auth-keys.js'

import type { ServiceOptions } from './base.js'
import type { FutureSaltsService } from './future-salts.js'
import { BaseService } from './base.js'

export class AuthKeysService extends BaseService {
    constructor(
        readonly _keys: IAuthKeysRepository,
        readonly _salts: FutureSaltsService,
        opts: ServiceOptions,
    ) {
        super(opts)
    }

    async deleteByDc(dc: number): Promise<void> {
        await this._keys.deleteByDc(dc)
        await this._salts.delete(dc)
    }
}
