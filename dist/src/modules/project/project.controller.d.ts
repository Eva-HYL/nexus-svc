import { ProjectService } from './project.service';
export declare class ProjectController {
    private projectService;
    constructor(projectService: ProjectService);
    findAll(clubId: string): Promise<$Public.PrismaPromise<T>>;
    create(body: any): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ProjectPayload<ExtArgs>, T, "create", GlobalOmitOptions>>;
    update(id: string, body: any): Promise<$Result.GetResult<import(".prisma/client/client").Prisma.$ProjectPayload<ExtArgs>, T, "update", GlobalOmitOptions>>;
}
