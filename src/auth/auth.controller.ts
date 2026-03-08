import { BadRequestException, Body, Controller, HttpCode, Post } from "@nestjs/common";
import { UserService } from "../user/user.service";
import { AUTH_CONSTANTS } from "./auth.constants";
import { AuthService } from "./auth.service";
import { AuthDto } from "./dto/auth.dto";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post("register")
  async register(@Body() dto: AuthDto) {
    const user = await this.userService.findUser(dto.login);

    if (user) {
      throw new BadRequestException(AUTH_CONSTANTS.USER_ALREADY_EXISTS);
    }

    await this.userService.createUser(dto.login, dto.password);

    return { email: dto.login };
  }

  @HttpCode(200)
  @Post("login")
  async login(@Body() dto: AuthDto) {
    const { email } = await this.userService.validateUser(dto.login, dto.password);
    return this.authService.login(email);
  }
}
