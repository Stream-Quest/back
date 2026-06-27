import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ResolutionWhereUniqueInput } from '../generated/prisma/models';
import { Prisma, Resolution } from '../generated/prisma/client';
import { CreateResolutionDto } from './dto/resolution/create-resolution.dto';
import { UpdateResolutionDto } from './dto/resolution/update-resolution.dto';

export type ResolutionWithConditions = Prisma.ResolutionGetPayload<{
  include: {
    conditionGroups: {
      include: { conditions: true };
    };
  };
}>;

@Injectable()
export class ResolutionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getResolution(
    where: ResolutionWhereUniqueInput,
  ): Promise<ResolutionWithConditions | null> {
    return await this.prisma.resolution.findUnique({
      where,
      include: {
        conditionGroups: {
          include: {
            conditions: true,
          },
        },
      },
    });
  }

  async createResolution(
    dto: CreateResolutionDto,
    eventId: string,
  ): Promise<ResolutionWithConditions> {
    const { conditionGroups, ...data } = dto;

    return await this.prisma.resolution.create({
      data: {
        ...data,
        event: { connect: { id: eventId } },
        conditionGroups: {
          create: conditionGroups?.map((group) => ({
            operator: group.operator,
            conditions: {
              create: group.conditions.map((condition) => ({
                contextType: condition.contextType,
                value: condition.value,
              })),
            },
          })),
        },
      },
      include: {
        conditionGroups: {
          include: { conditions: true },
        },
      },
    });
  }

  async updateResolution(
    where: ResolutionWhereUniqueInput,
    dto: UpdateResolutionDto,
  ): Promise<ResolutionWithConditions> {
    return await this.prisma.$transaction(async (tx) => {
      await tx.conditionGroup.deleteMany({
        where: { resolutionId: where.id as string },
      });

      return await tx.resolution.update({
        where,
        data: {
          message: dto.message,
          isFallback: dto.isFallback,
          ...(dto.conditionGroups && {
            conditionGroups: {
              create: dto.conditionGroups.map((group) => ({
                operator: group.operator,
                conditions: {
                  create: group.conditions.map((condition) => ({
                    contextType: condition.contextType,
                    value: condition.value,
                  })),
                },
              })),
            },
          }),
        },
        include: {
          conditionGroups: {
            include: { conditions: true },
          },
        },
      });
    });
  }

  async deleteResolution(
    where: ResolutionWhereUniqueInput,
  ): Promise<Resolution> {
    return await this.prisma.resolution.delete({ where });
  }
}
