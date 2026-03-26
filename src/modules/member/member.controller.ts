import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MemberService } from './member.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, Min, IsEnum, IsIn } from 'class-validator';
import { MemberRole } from '@prisma/client';

// DTO 定义
class MemberQueryDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Min(1)
  @IsOptional()
  pageSize?: number;

  @IsNumber()
  @IsOptional()
  status?: number;

  @IsNumber()
  @IsOptional()
  role?: number;
}

class ApplyDto {
  @IsString()
  @IsNotEmpty({ message: '俱乐部ID不能为空' })
  clubId: string;
}

class ApproveDto {
  @IsString()
  @IsNotEmpty({ message: '俱乐部ID不能为空' })
  clubId: string;

  @IsNumber()
  @IsOptional()
  role?: number;
}

class BatchApproveDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsArray()
  @IsString({ each: true })
  userIds: string[];
}

class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsNumber()
  @IsIn([1, 2, 3, 4], { message: '角色值无效' })
  role: number;
}

class RejectDto {
  @IsString()
  @IsNotEmpty()
  clubId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

@Controller('member')
@UseGuards(AuthGuard('jwt'))
export class MemberController {
  constructor(private memberService: MemberService) {}

  /**
   * 获取成员列表
   * GET /api/member/list
   */
  @Get('list')
  findAll(@Query() query: MemberQueryDto) {
    return this.memberService.findAll(BigInt(query.clubId), {
      page: query.page,
      pageSize: query.pageSize,
      status: query.status,
      role: query.role,
    });
  }

  /**
   * 获取待审核成员列表
   * GET /api/member/pending
   */
  @Get('pending')
  findPending(@Query('clubId') clubId: string) {
    return this.memberService.findPending(BigInt(clubId));
  }

  /**
   * 申请加入俱乐部
   * POST /api/member/apply
   */
  @Post('apply')
  apply(
    @Body() dto: ApplyDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.memberService.apply(BigInt(dto.clubId), BigInt(userId));
  }

  /**
   * 审批通过
   * POST /api/member/:userId/approve
   */
  @Post(':userId/approve')
  approve(
    @Param('userId') userId: string,
    @Body() dto: ApproveDto,
    @CurrentUser('id') approverId: string,
  ) {
    return this.memberService.approve(
      BigInt(dto.clubId),
      BigInt(userId),
      BigInt(approverId),
      dto.role as unknown as MemberRole,
    );
  }

  /**
   * 批量审批通过
   * POST /api/member/batch-approve
   */
  @Post('batch-approve')
  batchApprove(
    @Body() dto: BatchApproveDto,
    @CurrentUser('id') approverId: string,
  ) {
    return this.memberService.batchApprove(
      BigInt(dto.clubId),
      dto.userIds.map(id => BigInt(id)),
      BigInt(approverId),
    );
  }

  /**
   * 拒绝申请
   * POST /api/member/:userId/reject
   */
  @Post(':userId/reject')
  reject(
    @Param('userId') userId: string,
    @Body() dto: RejectDto,
    @CurrentUser('id') approverId: string,
  ) {
    return this.memberService.reject(
      BigInt(dto.clubId),
      BigInt(userId),
      BigInt(approverId),
      dto.reason,
    );
  }

  /**
   * 更新成员角色
   * PUT /api/member/:userId/role
   */
  @Put(':userId/role')
  updateRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.updateRole(
      BigInt(dto.clubId),
      BigInt(userId),
      dto.role as unknown as MemberRole,
      BigInt(operatorId),
    );
  }

  /**
   * 移除成员
   * DELETE /api/member/:userId
   */
  @Delete(':userId')
  remove(
    @Param('userId') userId: string,
    @Query('clubId') clubId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.remove(BigInt(clubId), BigInt(userId), BigInt(operatorId));
  }

  /**
   * 直接添加成员（管理员操作）
   * POST /api/member/add
   */
  @Post('add')
  add(
    @Body() body: { clubId: string; userId: string; role?: number },
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.addDirectly(
      BigInt(body.clubId),
      BigInt(body.userId),
      body.role as unknown as MemberRole,
      BigInt(operatorId),
    );
  }

  /**
   * 生成邀请码
   * GET /api/member/invite-code
   */
  @Get('invite-code')
  generateInviteCode(
    @Query('clubId') clubId: string,
    @CurrentUser('id') operatorId: string,
  ) {
    return this.memberService.generateInviteCode(BigInt(clubId), BigInt(operatorId));
  }
}