import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { UserService } from "../user/user.service";
import { AUTH_CONSTANTS } from "./auth.constants";
import { AuthService } from "./auth.service";
import { UserEmail } from "./decorators/user-email.decorator";
import { AuthDto } from "./dto/auth.dto";
import { JwtGuard } from "./guards/jwt.guard";

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
  async login(@Body() dto: AuthDto, @Res({ passthrough: true }) res: Response) {
    const { email } = await this.userService.validateUser(dto.login, dto.password);
    const { accessToken, refreshToken } = await this.authService.login(email);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @HttpCode(200)
  @Post("refresh")
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = (req as Request & { cookies?: Record<string, string> }).cookies?.refreshToken;
    const { accessToken, refreshToken: newRefreshToken } = await this.authService.refreshTokens(
      refreshToken ?? "",
    );

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { accessToken };
  }

  @HttpCode(200)
  @UseGuards(JwtGuard)
  @Post("logout")
  async logout(@UserEmail() email: string, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(email);
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/auth",
    });
    return { success: true };
  }
}
