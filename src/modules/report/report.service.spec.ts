import { Test, TestingModule } from '@nestjs/testing';
import { ReportService } from './report.service';
import { PrismaService } from '../../prisma/prisma.service';
import { ProjectService } from '../project/project.service';
import { WalletService } from '../wallet/wallet.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReportStatus, ReportType, OrderType } from '@prisma/client';

describe('ReportService', () => {
  let service: ReportService;
  let prisma: PrismaService;
  let projectService: ProjectService;
  let walletService: WalletService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportService,
        {
          provide: PrismaService,
          useValue: {
            report: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
            },
            earning: {
              create: jest.fn(),
              updateMany: jest.fn(),
            },
            deposit: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            depositUsage: {
              create: jest.fn(),
            },
            $transaction: jest.fn((fn) => fn(prisma)),
          },
        },
        {
          provide: ProjectService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: WalletService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ReportService>(ReportService);
    prisma = module.get<PrismaService>(PrismaService);
    projectService = module.get<ProjectService>(ProjectService);
    walletService = module.get<WalletService>(WalletService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('submit', () => {
    it('should return existing report if requestId exists', async () => {
      const existingReport = { id: 1n, requestId: 'test-id' };
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValue(existingReport as any);

      const result = await service.submit(1n, 1n, {
        requestId: 'test-id',
        reportType: ReportType.PROJECT,
        orderType: OrderType.RECEIVER,
        projectId: '1',
        bossName: 'Test Boss',
      } as any);

      expect(result).toBe(existingReport);
      expect(prisma.report.findUnique).toHaveBeenCalledWith({
        where: { requestId: 'test-id' },
      });
    });

    it('should create new report if requestId not exists', async () => {
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValue(null);
      jest.spyOn(projectService, 'findById').mockResolvedValue({
        id: 1n,
        price: 60,
        commissionType: 2,
        commissionValue: 20,
      } as any);

      const mockReport = {
        id: 1n,
        amount: 60,
        commission: 12,
        actualAmount: 48,
      };
      jest.spyOn(prisma.report, 'create').mockResolvedValue(mockReport as any);
      jest.spyOn(prisma.earning, 'create').mockResolvedValue({} as any);
      // jest.spyOn(prisma.$transaction).mockImplementation(fn => fn(prisma));

      const result = await service.submit(1n, 1n, {
        requestId: 'new-id',
        reportType: ReportType.PROJECT,
        orderType: OrderType.RECEIVER,
        projectId: '1',
        duration: 60,
        bossName: 'Test Boss',
      } as any);

      expect(result).toBeDefined();
    });
  });

  describe('approve', () => {
    it('should throw exception if report not found', async () => {
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValue(null);

      await expect(service.approve(1n, 1n)).rejects.toThrow(NotFoundException);
    });

    it('should throw exception if report not pending', async () => {
      jest.spyOn(prisma.report, 'findUnique').mockResolvedValue({
        id: 1n,
        status: 2,
      } as any);

      await expect(service.approve(1n, 1n)).rejects.toThrow(BadRequestException);
    });
  });
});
