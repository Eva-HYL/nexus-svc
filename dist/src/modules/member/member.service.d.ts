import { PrismaService } from '../../prisma/prisma.service';
export declare class MemberService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(clubId: bigint, page?: number, pageSize?: number): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    updateRole(clubId: bigint, userId: bigint, role: number): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(clubId: bigint, userId: bigint): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    add(clubId: bigint, userId: bigint, role?: number): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>>;
}
