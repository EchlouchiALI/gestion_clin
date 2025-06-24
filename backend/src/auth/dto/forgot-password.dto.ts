export class ForgotPasswordDto {
    email: string;
  }
  
  export class VerifyCodeDto {
    email: string;
    code: string;
  }
  
  export class ResetPasswordDto {
    email: string;
    code: string;
    newPassword: string;
  }
  