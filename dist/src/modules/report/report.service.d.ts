import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
export declare class ReportService {
    private prisma;
    private projectService;
    constructor(prisma: PrismaService, projectService: ProjectService);
    submit(memberId: bigint, clubId: bigint, dto: {
        projectId: string;
        duration?: number;
        quantity?: number;
        bossName: string;
        remark?: string;
    }): Promise<$Utils.JsPromise<R>>;
    findAll(clubId: bigint, query: {
        memberId?: string;
        status?: number;
        page?: number;
        pageSize?: number;
    }): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    findPending(clubId: bigint): Promise<$Public.PrismaPromise<T>>;
    approve(reportId: bigint, approverId: bigint): Promise<$Utils.JsPromise<R>>;
    reject(reportId: bigint, approverId: bigint, reason?: string): Promise<$Utils.JsPromise<R>>;
}
