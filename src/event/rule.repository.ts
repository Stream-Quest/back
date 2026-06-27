import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RuleWhereUniqueInput } from '../generated/prisma/models';
import { Rule } from '../generated/prisma/client';
import { CreateRuleDto } from './dto/rule/create-rule.dto';
import { InputJsonValue } from '@prisma/client/runtime/client';
import { UpdateRuleDto } from './dto/rule/update-rule.dto';

@Injectable()
export class RuleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getRule(where: RuleWhereUniqueInput): Promise<Rule | null> {
    return await this.prisma.rule.findUnique({ where });
  }

  async createRule(dto: CreateRuleDto, eventId: string): Promise<Rule> {
    return await this.prisma.rule.create({
      data: {
        ...dto,
        config: dto.config as InputJsonValue,
        event: {
          connect: {
            id: eventId,
          },
        },
      },
    });
  }

  async updateRule(
    where: RuleWhereUniqueInput,
    dto: UpdateRuleDto,
  ): Promise<Rule> {
    const { config, ...data } = dto;

    return await this.prisma.rule.update({
      where,
      data: {
        ...data,
        ...(config && { config: config }),
      },
    });
  }

  async deleteRule(where: RuleWhereUniqueInput): Promise<Rule> {
    return await this.prisma.rule.delete({ where });
  }
}
