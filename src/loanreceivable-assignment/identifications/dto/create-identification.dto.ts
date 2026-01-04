export class CreateIdentificationDto {
  personalSnapshotId: number;

  idType: string;
  idNumber: string;

  dateIssued?: string; // ISO string from frontend
  countryIssued?: string;
}
