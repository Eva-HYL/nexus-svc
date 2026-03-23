"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const finance_service_1 = require("./finance.service");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FinanceController = class FinanceController {
    financeService;
    constructor(financeService) {
        this.financeService = financeService;
    }
    getStats(userId, clubId, startDate, endDate) {
        const period = startDate && endDate
            ? { start: new Date(startDate), end: new Date(endDate) }
            : undefined;
        return this.financeService.getStats(BigInt(userId), BigInt(clubId), period);
    }
    getList(userId, clubId, page = '1', pageSize = '20') {
        return this.financeService.getEarningList(BigInt(userId), BigInt(clubId), +page, +pageSize);
    }
    calculateSalary(body) {
        return this.financeService.calculateSalary(BigInt(body.memberId), BigInt(body.clubId), new Date(body.periodStart), new Date(body.periodEnd));
    }
    paySalary(userId, salaryId) {
        return this.financeService.paySalary(BigInt(salaryId), BigInt(userId));
    }
    getSalaryList(clubId, memberId, page = '1', pageSize = '20') {
        return this.financeService.getSalaryList(BigInt(clubId), memberId ? BigInt(memberId) : undefined, +page, +pageSize);
    }
};
exports.FinanceController = FinanceController;
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('clubId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Query)('clubId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getList", null);
__decorate([
    (0, common_1.Post)('salary/calculate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "calculateSalary", null);
__decorate([
    (0, common_1.Post)('salary/pay'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)('salaryId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "paySalary", null);
__decorate([
    (0, common_1.Get)('salary/list'),
    __param(0, (0, common_1.Query)('clubId')),
    __param(1, (0, common_1.Query)('memberId')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object, Object]),
    __metadata("design:returntype", void 0)
], FinanceController.prototype, "getSalaryList", null);
exports.FinanceController = FinanceController = __decorate([
    (0, common_1.Controller)('earning'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [finance_service_1.FinanceService])
], FinanceController);
//# sourceMappingURL=finance.controller.js.map