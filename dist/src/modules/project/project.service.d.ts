import { PrismaService } from '../../prisma/prisma.service';
export declare class ProjectService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(clubId: bigint): Promise<$Public.PrismaPromise<T>>;
    findById(id: bigint): Promise<any>;
    create(clubId: bigint, data: {
        name: string;
        type?: number;
        price: number;
        priceType?: number;
        commissionType?: number;
        commissionValue?: number;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    update(id: bigint, data: Partial<{
        name: string;
        price: number;
        commissionType: number;
        commissionValue: number;
        status: number;
    }>): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
