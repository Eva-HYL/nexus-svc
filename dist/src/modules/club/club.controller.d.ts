import { ClubService } from './club.service';
export declare class ClubController {
    private clubService;
    constructor(clubService: ClubService);
    create(userId: string, body: {
        name: string;
        logo?: string;
        description?: string;
    }): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    myClubs(userId: string): Promise<$Public.PrismaPromise<T>>;
    findOne(id: string): Promise<any>;
    update(id: string, body: any): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ClubPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
