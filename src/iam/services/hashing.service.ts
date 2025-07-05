import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class HashingService {
    private readonly saltRounds = 10;

    async hash(data: string): Promise<string> {
        return bcrypt.hash(data, this.saltRounds);
    }

    async compare(raw: string, hashed: string): Promise<boolean> {
        return bcrypt.compare(raw, hashed);
    }

}
