import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanReceivableAssignmentV2 } from '../entities/loanreceivable-assignment-v2.entity';



@Injectable()
export class AgentLoadService {
constructor(
@InjectRepository(LoanReceivableAssignmentV2, 'nittan_app')
private repo: Repository<LoanReceivableAssignmentV2>,
) {}


async getAgentLoads(agentIds: number[]) {
const loads = await Promise.all(
agentIds.map(async id => ({
agentId: id,
count: await this.repo.count({ where: { agentId: id, status: 'ACTIVE' } }),
})),
);


return loads.sort((a, b) => a.count - b.count);
}
}
