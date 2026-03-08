import { IsEmail, IsString, MinLength } from "class-validator";

export class AuthDto {
  @IsEmail()
  login: string;

  @IsString()
  @MinLength(3)
  password: string;
}
