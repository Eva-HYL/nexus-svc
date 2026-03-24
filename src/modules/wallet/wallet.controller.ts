import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { WalletService } from './wallet.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsNumber, IsPositive, IsOptional, IsString, IsNotEmpty, Min, Max, IsIn } from 'class-validator';

// DTO 定义
class RechargeDto {
  @IsNumber()
  @IsPositive({ message: '充值金额必须大于0' })
  amount: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

class AdjustDto {
  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

class TransactionQueryDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsNumber()
  @IsIn([1, 2, 3, 4, 5, 6])
  @IsOptional()
  type?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @Max(100)
  @IsOptional()
  pageSize?: number;
}

@Controller('wallet')
@UseGuards(AuthGuard('jwt'))
export class WalletController {
  constructor(private walletService: WalletService) {}

  /**
   * 查询我的钱包余额
   * GET /api/wallet/balance
   */
  @Get('balance')
  async getBalance(
    @Query('clubId') clubId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletService.getBalance(BigInt(clubId), BigInt(userId));
  }

  /**
   * 查询交易记录
   * GET /api/wallet/transactions
   */
  @Get('transactions')
  async getTransactions(
    @Query() query: TransactionQueryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.walletService.getTransactions(BigInt(query.clubId), BigInt(userId), {
      type: query.type,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  /**
   * 充值（管理员操作）
   * POST /api/wallet/recharge
   */
  @Post('recharge')
  async recharge(
    @Body() dto: RechargeDto,
    @CurrentUser('id') operatorId: string,
  ) {
    // TODO: 添加权限检查，只有管理员可以充值
    return this.walletService.recharge(
      BigInt(dto.clubId),
      BigInt(dto.userId),
      dto.amount,
      BigInt(operatorId),
      dto.remark,
    );
  }

  /**
   * 管理员调账
   * POST /api/wallet/adjust
   */
  @Post('adjust')
  async adjust(
    @Body() dto: AdjustDto,
    @CurrentUser('id') operatorId: string,
  ) {
    // TODO: 添加权限检查，只有管理员可以调账
    return this.walletService.adjust(
      BigInt(dto.clubId),
      BigInt(dto.userId),
      dto.amount,
      BigInt(operatorId),
      dto.remark,
    );
  }

  /**
   * 检查余额状态
   * GET /api/wallet/check
   */
  @Get('check')
  async checkBalance(
    @Query('clubId') clubId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.walletService.checkMinBalance(BigInt(clubId), BigInt(userId));
    return {
      balance: result.balance.toString(),
      minBalance: result.minBalance.toString(),
      pass: result.pass,
    };
  }
}