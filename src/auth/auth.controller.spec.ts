import { BadRequestException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { UserService } from "../user/user.service";
import { AUTH_CONSTANTS } from "./auth.constants";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let authController: AuthController;

  const mockUserService = {
    findUser: vi.fn(),
    createUser: vi.fn(),
    validateUser: vi.fn(),
  };

  const mockAuthService = {
    login: vi.fn(),
    refreshTokens: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    authController = app.get<AuthController>(AuthController);
  });

  describe("register", () => {
    it("should create user and return email when user does not exist", async () => {
      const dto = { login: "test@example.com", password: "password123" };
      mockUserService.findUser.mockResolvedValue(null);
      mockUserService.createUser.mockResolvedValue(undefined);

      const result = await authController.register(dto);

      expect(mockUserService.findUser).toHaveBeenCalledWith(dto.login);
      expect(mockUserService.createUser).toHaveBeenCalledWith(dto.login, dto.password);
      expect(result).toEqual({ email: dto.login });
    });

    it("should throw BadRequestException when user already exists", async () => {
      const dto = { login: "test@example.com", password: "password123" };
      mockUserService.findUser.mockResolvedValue({ email: dto.login });

      await expect(authController.register(dto)).rejects.toThrow(BadRequestException);
      await expect(authController.register(dto)).rejects.toMatchObject({
        response: { message: AUTH_CONSTANTS.USER_ALREADY_EXISTS },
      });
      expect(mockUserService.createUser).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should validate user and return tokens", async () => {
      const dto = { login: "test@example.com", password: "password123" };
      mockUserService.validateUser.mockResolvedValue({ email: dto.login });
      mockAuthService.login.mockResolvedValue({
        accessToken: "jwt-token",
        refreshToken: "jwt-token",
      });

      const res = {
        cookie: vi.fn(),
      } as unknown as {
        cookie: (name: string, value: string, options: unknown) => void;
      };

      const result = await authController.login(dto, res as never);

      expect(mockUserService.validateUser).toHaveBeenCalledWith(dto.login, dto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.login);
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "jwt-token",
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(result).toEqual({ accessToken: "jwt-token" });
    });
  });

  describe("refreshTokens", () => {
    it("should return new tokens", async () => {
      mockAuthService.refreshTokens.mockResolvedValue({
        accessToken: "new-access",
        refreshToken: "new-refresh",
      });

      const req = {
        cookies: {
          refreshToken: "valid-token",
        },
      } as unknown as Request;

      const res = {
        cookie: vi.fn(),
      } as unknown as {
        cookie: (name: string, value: string, options: unknown) => void;
      };

      const result = await authController.refreshTokens(req as never, res as never);

      expect(mockAuthService.refreshTokens).toHaveBeenCalledWith("valid-token");
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "new-refresh",
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(result).toEqual({ accessToken: "new-access" });
    });
  });

  describe("logout", () => {
    it("should call authService.logout and return success", async () => {
      const email = "test@example.com";
      mockAuthService.logout.mockResolvedValue(undefined);

      const res = {
        clearCookie: vi.fn(),
      } as unknown as {
        clearCookie: (name: string, options: unknown) => void;
      };

      const result = await authController.logout(email, res as never);

      expect(mockAuthService.logout).toHaveBeenCalledWith(email);
      expect(res.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.objectContaining({
          httpOnly: true,
        }),
      );
      expect(result).toEqual({ success: true });
    });
  });
});
