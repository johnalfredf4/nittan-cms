// dto/update-call-recording.dto.ts
export class UpdateCallRecordingDto {
  callerNumber?: string;
  calleeNumber?: string;
  callStartTime?: Date;
  callEndTime?: Date;
  durationSeconds?: number;
}
