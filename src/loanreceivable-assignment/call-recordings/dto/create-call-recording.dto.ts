// dto/create-call-recording.dto.ts
export class CreateCallRecordingDto {
  // FK (not a column — service strips this)
  loanAssignmentId: number;

  // Table columns
  agentId: number;
  clientName: string;
  mobileNumber: string;

  fileName: string;
  s3Key: string;
  s3Url: string;

  callStartedAt?: string;
  callEndedAt?: string;
  durationSeconds?: number;

  // 🔽 New fields
  contactedParty?: string;
  dispositionId?: number;
  remarks?: string;
  nextCallScheduleAt?: string;
  agentName: string;
  relationshipName?: string;
}

