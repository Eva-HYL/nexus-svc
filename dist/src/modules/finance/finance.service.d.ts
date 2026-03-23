import { PrismaService } from '../../prisma/prisma.service';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(memberId: bigint, clubId: bigint, period?: {
        start: Date;
        end: Date;
    }): Promise<{
        totalAmount: any;
        paidAmount: any;
        pendingAmount: any;
        count: any;
    }>;
    getEarningList(memberId: bigint, clubId: bigint, page?: number, pageSize?: number): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    calculateSalary(memberId: bigint, clubId: bigint, periodStart: Date, periodEnd: Date): Promise<$Utils.JsPromise<R>>;
    paySalary(salaryId: bigint, payerId: bigint): Promise<$Utils.JsPromise<R>>;
    getSalaryList(clubId: bigint, memberId?: bigint, page?: number, pageSize?: number): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
}
