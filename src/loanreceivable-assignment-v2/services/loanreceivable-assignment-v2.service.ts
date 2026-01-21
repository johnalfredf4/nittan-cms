import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoanReceivableAssignmentV2 } from '../entities/loanreceivable-assignment.entity';
import { RetentionRule } from '../entities/retention-rule.entity';
import { NittanService } from '../nittan/nittan.service';
import { AgentLoadService } from '../engine/agent-load.service';
import { mapDpdToCategory } from '../engine/dpd-category.mapper';
import { Cron } from '@nestjs/schedule';
import { LessThan } from 'typeorm';

@Injectable()
export class LoanReceivableAssignmentV2Service {
  private logger = new Logger(LoanReceivableAssignmentV2Service.name);

  constructor(
    private readonly nittan: NittanService,

    @InjectRepository(LoanReceivableAssignmentV2, 'nittan_app')
    private assignments: Repository<LoanReceivableAssignmentV2>,

    @InjectRepository(RetentionRule, 'nittan_app')
    private rulesRepo: Repository<RetentionRule>,

    private readonly agentLoad: AgentLoadService,
  ) {}

  async run(agentIds: number[], maxPerAgent = 10) {
    this.logger.log('Starting Assignment V2');

    const receivables = await this.nittan.fetchReceivables();
    const rules = await this.rulesRepo.find({ where: { isActive: true } });

    const loads = await this.agentLoad.getAgentLoads(agentIds);

    for (const r of receivables) {
      const exists = await this.assignments.findOne({
        where: { loanReceivableId: r.ID, status: 'ACTIVE' },
      });
      if (exists) continue;

      const rule = mapDpdToCategory(r.DPD, rules);
      if (!rule) continue;

      const agent = loads.find(l => l.count < maxPerAgent);
      if (!agent) break;

      const retentionUntil = rule.retentionDays
        ? new Date(Date.now() + rule.retentionDays * 86400000)
        : null;

      await this.assignments.save({
        loanReceivableId: r.ID,
        loanApplicationId: r.LoanApplicationId,
        agentId: agent.agentId,
        dpd: r.DPD,
        categoryCode: rule.categoryCode,
        retentionUntil,
        status: 'ACTIVE',
      });

      agent.count++;
    }

    this.logger.log('Assignment V2 Completed');
    return { success: true };
  }
  
  /* =====================================================
	CRON — EVERY 1 MINUTE
	- Expire old assignments
	- Reassign eligible receivables
	===================================================== */
	@Cron('0 */1 * * * *')
		async autoExpireAndReassign() {
		this.logger.log('🔁 Running auto-expire + reassign cycle');


		const now = new Date();


		// 1. EXPIRE OLD ASSIGNMENTS
		const expired = await this.assignmentRepo.update(
		{
		status: 'ACTIVE',
		retentionUntil: LessThan(now),
		},
		{ status: 'EXPIRED' },
		);


		if (expired.affected) {
		this.logger.log(`⏰ Expired assignments: ${expired.affected}`);
		}


		// 2. RE-RUN ASSIGNMENT ENGINE
		try {
		await this.runAssignmentEngine();
		} catch (err) {
		this.logger.error('❌ Reassign cycle failed', err);
		}
	}
	
	async runAssignmentEngine() {
		this.logger.log('⚙️ Running assignment engine');


		const receivables = await this.fetchReceivables();
		if (!receivables.length) return;


		let agents = await this.loadAgentsWithLoad();
		if (!agents.length) return;


		for (const loan of receivables) {
		// Prevent duplicate ACTIVE assignments
		const exists = await this.assignmentRepo.findOne({
		where: {
		loanReceivableId: loan.id,
		status: 'ACTIVE',
		},
		});


		if (exists) continue;


		agents.sort((a, b) => a.assignedCount - b.assignedCount);
		const agent = agents.find(a => a.assignedCount < 10);


		if (!agent) {
		this.logger.warn('⚠️ All agents at max capacity');
		return;
		}


		const rule = await this.getRetentionRule(loan.dpd);


		const retentionUntil = rule.indefinite
		? new Date('2099-12-31')
		: new Date(Date.now() + rule.retentionDays * 86400000);


		await this.assignmentRepo.save({
		loanApplicationId: loan.loanApplicationId,
		loanReceivableId: loan.id,
		agentId: agent.agentId,
		dpd: loan.dpd,
		categoryCode: rule.categoryCode,
		retentionDays: rule.retentionDays,
		retentionUntil,
		status: 'ACTIVE',
		});

		agent.assignedCount++;
		}


		this.logger.log('✅ Assignment cycle complete');
		}
}
