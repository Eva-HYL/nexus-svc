import { PrismaService } from '../../prisma/prisma.service';
export declare class UserService {
    private prisma;
    constructor(prisma: PrismaService);
    findByPhone(phone: string): Promise<any>;
    findById(id: bigint): Promise<any>;
    register(phone: string, password: string, nickname?: string): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    updateProfile(id: bigint, data: {
        nickname?: string;
        avatar?: string;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
