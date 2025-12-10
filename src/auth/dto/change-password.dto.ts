export class ChangePasswordDto {
  username: string;         // username of the account being changed
  oldPassword?: string;     // optional for admin resetting
  newPassword: string;      // new password
  resetMode?: boolean;      // true = admin override reset
}
