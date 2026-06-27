import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RuleResponseDto } from './dto/rule/rule-response.dto';
import { RuleRepository } from './rule.repository';
import { CreateRuleDto } from './dto/rule/create-rule.dto';
import { Rule } from '../generated/prisma/client';
import { UpdateRuleDto } from './dto/rule/update-rule.dto';

@Injectable()
export class RuleService {
  constructor(private readonly repository: RuleRepository) {}

  async getRule(id: string): Promise<RuleResponseDto> {
    if (!id) {
      throw new BadRequestException('Rule id is missing');
    }

    const rule = await this.repository.getRule({ id });

    if (!rule) {
      throw new NotFoundException('Rule not found');
    }

    return rule;
  }

  async createRule(
    dto: CreateRuleDto,
    eventId: string,
  ): Promise<RuleResponseDto> {
    return await this.repository.createRule(dto, eventId);
  }

  async updateRule(dto: UpdateRuleDto, rule: Rule): Promise<RuleResponseDto> {
    return await this.repository.updateRule({ id: rule.id }, dto);
  }

  async deleteRule(rule: Rule): Promise<Rule> {
    return await this.repository.deleteRule({ id: rule.id });
  }
}
