import { PrismaService } from '../../prisma/prisma.service';
export declare class ClubService {
    private prisma;
    constructor(prisma: PrismaService);
    create(ownerId: bigint, data: {
        name: string;
        logo?: string;
        description?: string;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    findById(id: bigint): Promise<any>;
    findByUser(userId: bigint): Promise<$Public.PrismaPromise<T>>;
    update(id: bigint, data: Partial<{
        name: string;
        logo: string;
        description: string;
    }>): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
