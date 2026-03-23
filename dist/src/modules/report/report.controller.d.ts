import { ReportService } from './report.service';
export declare class ReportController {
    private reportService;
    constructor(reportService: ReportService);
    submit(userId: string, body: {
        clubId: string;
        projectId: string;
        duration?: number;
        quantity?: number;
        bossName: string;
        remark?: string;
    }): Promise<$Utils.JsPromise<R>>;
    findAll(clubId: string, memberId?: string, status?: string, page?: string, pageSize?: string): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    findPending(clubId: string): Promise<$Public.PrismaPromise<T>>;
    approve(userId: string, reportId: string): Promise<$Utils.JsPromise<R>>;
    reject(userId: string, body: {
        reportId: string;
        reason?: string;
    }): Promise<$Utils.JsPromise<R>>;
}
