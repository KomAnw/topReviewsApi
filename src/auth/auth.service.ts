import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";
import { AUTH_CONSTANTS } from "./auth.constants";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async generateTokens(email: string) {
    const accessToken = await this.jwtService.signAsync(
      { email, type: "access" },
      { expiresIn: "1h" },
    );
    const refreshToken = await this.jwtService.signAsync(
      { email, type: "refresh" },
      { expiresIn: "7d" },
    );

    return { accessToken, refreshToken };
  }

  async login(email: string) {
    const tokens = await this.generateTokens(email);
    await this.userService.updateRefreshTokenHash(email, tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(refreshToken: string) {
    try {
      const result = await this.jwtService.verifyAsync(refreshToken);
      if (result.type !== "refresh") {
        throw new Error("Invalid token type");
      }
      const isTokenValid = await this.userService.validateRefreshToken(result.email, refreshToken);
      if (!isTokenValid) {
        throw new Error("Invalid refresh token");
      }
      
      const tokens = await this.generateTokens(result.email);
      await this.userService.updateRefreshTokenHash(result.email, tokens.refreshToken);
      return tokens;
    } catch (e) {
      throw new UnauthorizedException(AUTH_CONSTANTS.INVALID_TOKEN);
    }
  }

  async logout(email: string) {
    await this.userService.updateRefreshTokenHash(email, null);
  }
}
