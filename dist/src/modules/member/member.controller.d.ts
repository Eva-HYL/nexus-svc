import { MemberService } from './member.service';
export declare class MemberController {
    private memberService;
    constructor(memberService: MemberService);
    findAll(clubId: string, page?: string, pageSize?: string): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    add(body: {
        clubId: string;
        userId: string;
        role?: number;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>>;
    updateRole(userId: string, body: {
        clubId: string;
        role: number;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
    remove(userId: string, clubId: string): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
