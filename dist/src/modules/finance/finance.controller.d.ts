import { FinanceService } from './finance.service';
export declare class FinanceController {
    private financeService;
    constructor(financeService: FinanceService);
    getStats(userId: string, clubId: string, startDate?: string, endDate?: string): Promise<{
        totalAmount: any;
        paidAmount: any;
        pendingAmount: any;
        count: any;
    }>;
    getList(userId: string, clubId: string, page?: string, pageSize?: string): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
    calculateSalary(body: {
        memberId: string;
        clubId: string;
        periodStart: string;
        periodEnd: string;
    }): Promise<$Utils.JsPromise<R>>;
    paySalary(userId: string, salaryId: string): Promise<$Utils.JsPromise<R>>;
    getSalaryList(clubId: string, memberId?: string, page?: string, pageSize?: string): Promise<{
        list: any;
        pagination: {
            page: number;
            pageSize: number;
            total: any;
        };
    }>;
}
