import type { PrismaClient, Report } from "../../lib/db";
import type { ReportReason, ReportStatus } from "./types";

/**
 * 通報作成入力
 */
export type CreateReportInput = {
  signageId: string;
  reporterUserId: string;
  reason: ReportReason;
  description?: string;
};

/**
 * 通報フィルター
 */
export type ReportFilter = {
  status?: ReportStatus;
  signageId?: string;
};

/**
 * ページネーション
 */
export type Pagination = {
  limit: number;
  offset: number;
};

/**
 * 詳細情報を含む通報（Prismaクエリ結果）
 */
export type ReportWithDetailsResult = Report & {
  signage: {
    id: string;
    title: string;
    slug: string;
    user: {
      id: string;
      name: string | null;
    };
  };
  reporterUser: {
    id: string;
    name: string | null;
  };
};

/**
 * ReportRepository型定義
 */
export type ReportRepository = {
  create: (input: CreateReportInput) => Promise<Report>;
  findById: (id: string) => Promise<Report | null>;
  findByIdWithDetails: (id: string) => Promise<ReportWithDetailsResult | null>;
  findMany: (filter: ReportFilter, pagination: Pagination) => Promise<ReportWithDetailsResult[]>;
  count: (filter: ReportFilter) => Promise<number>;
  updateStatus: (id: string, status: ReportStatus, reviewedBy: string) => Promise<Report>;
  existsByUserAndSignage: (userId: string, signageId: string) => Promise<boolean>;
};

/**
 * ReportRepositoryを作成
 */
export const createReportRepository = (prisma: PrismaClient): ReportRepository => ({
  create: async (input: CreateReportInput): Promise<Report> => {
    return prisma.report.create({
      data: {
        signageId: input.signageId,
        reporterUserId: input.reporterUserId,
        reason: input.reason,
        description: input.description,
      },
    });
  },

  findById: async (id: string): Promise<Report | null> => {
    return prisma.report.findUnique({
      where: { id },
    });
  },

  findByIdWithDetails: async (id: string): Promise<ReportWithDetailsResult | null> => {
    return prisma.report.findUnique({
      where: { id },
      include: {
        signage: {
          select: {
            id: true,
            title: true,
            slug: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reporterUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  },

  findMany: async (
    filter: ReportFilter,
    pagination: Pagination,
  ): Promise<ReportWithDetailsResult[]> => {
    return prisma.report.findMany({
      where: {
        ...(filter.status && { status: filter.status }),
        ...(filter.signageId && { signageId: filter.signageId }),
      },
      include: {
        signage: {
          select: {
            id: true,
            title: true,
            slug: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reporterUser: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: pagination.offset,
      take: pagination.limit,
    });
  },

  count: async (filter: ReportFilter): Promise<number> => {
    return prisma.report.count({
      where: {
        ...(filter.status && { status: filter.status }),
        ...(filter.signageId && { signageId: filter.signageId }),
      },
    });
  },

  updateStatus: async (id: string, status: ReportStatus, reviewedBy: string): Promise<Report> => {
    return prisma.report.update({
      where: { id },
      data: {
        status,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  },

  existsByUserAndSignage: async (userId: string, signageId: string): Promise<boolean> => {
    const count = await prisma.report.count({
      where: {
        reporterUserId: userId,
        signageId,
      },
    });
    return count > 0;
  },
});
