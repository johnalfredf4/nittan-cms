export class ChangePasswordDto {
  username: string;
  newPassword: string;
  oldPassword?: string; // not required for admin reset
  resetMode?: boolean;  // true means admin forced reset
}
