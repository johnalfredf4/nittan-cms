export class ChangePasswordDto {
  username?: string;       // optional if you infer from JWT
  currentPassword: string;
  newPassword: string;
}
