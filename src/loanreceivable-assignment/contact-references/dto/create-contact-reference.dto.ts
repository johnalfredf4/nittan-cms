export class CreateContactReferenceDto {
  personalSnapshotId: number;
  referenceName: string;
  address: string;
  contactNumber: string;
  employer?: string;
  section?: string;        // default handled in service
  relationship?: string;
}
