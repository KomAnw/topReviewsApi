import { UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../user/user.service";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;

  const mockJwtService = {
    signAsync: vi.fn(),
    verifyAsync: vi.fn(),
  };

  const mockUserService = {
    updateRefreshTokenHash: vi.fn(),
    validateRefreshToken: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJwtService.signAsync.mockResolvedValue("jwt-token");
    mockUserService.updateRefreshTokenHash.mockResolvedValue(undefined);
    mockUserService.validateRefreshToken.mockResolvedValue(true);

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: mockJwtService },
        { provide: UserService, useValue: mockUserService },
      ],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("should call signAsync with payload, save refresh token and return tokens", async () => {
      const email = "user@example.com";

      const result = await authService.login(email);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ email, type: "access" }, { expiresIn: "1h" });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ email, type: "refresh" }, { expiresIn: "7d" });
      expect(mockUserService.updateRefreshTokenHash).toHaveBeenCalledWith(email, "jwt-token");
      expect(result).toEqual({ accessToken: "jwt-token", refreshToken: "jwt-token" });
    });
  });

  describe("refreshTokens", () => {
    it("should verify token, validate it with user service and generate new ones", async () => {
      const email = "user@example.com";
      mockJwtService.verifyAsync.mockResolvedValue({ email, type: "refresh" });

      const result = await authService.refreshTokens("valid-refresh-token");

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith("valid-refresh-token");
      expect(mockUserService.validateRefreshToken).toHaveBeenCalledWith(email, "valid-refresh-token");
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ email, type: "access" }, { expiresIn: "1h" });
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ email, type: "refresh" }, { expiresIn: "7d" });
      expect(mockUserService.updateRefreshTokenHash).toHaveBeenCalledWith(email, "jwt-token");
      expect(result).toEqual({ accessToken: "jwt-token", refreshToken: "jwt-token" });
    });

    it("should throw UnauthorizedException if token is not refresh token", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ email: "user@example.com", type: "access" });

      await expect(authService.refreshTokens("access-token")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if token validation fails", async () => {
      mockJwtService.verifyAsync.mockResolvedValue({ email: "user@example.com", type: "refresh" });
      mockUserService.validateRefreshToken.mockResolvedValue(false);

      await expect(authService.refreshTokens("invalid-refresh-token")).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if token verification fails", async () => {
      mockJwtService.verifyAsync.mockRejectedValue(new Error("invalid"));

      await expect(authService.refreshTokens("invalid-token")).rejects.toThrow(UnauthorizedException);
    });
  });

  describe("logout", () => {
    it("should call updateRefreshTokenHash with null", async () => {
      const email = "user@example.com";
      await authService.logout(email);
      expect(mockUserService.updateRefreshTokenHash).toHaveBeenCalledWith(email, null);
    });
  });
});
