// dto/create-call-recording.dto.ts
export class CreateCallRecordingDto {
  loanAssignmentId: number;
  borrowerName: string;
  recordingS3Url: string;

  callerNumber?: string;
  calleeNumber?: string;
  callStartTime?: Date;
  callEndTime?: Date;
  durationSeconds?: number;

  txtFileName: string;
}
