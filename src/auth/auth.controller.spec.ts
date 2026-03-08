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
    it("should validate user and return access_token", async () => {
      const dto = { login: "test@example.com", password: "password123" };
      mockUserService.validateUser.mockResolvedValue({ email: dto.login });
      mockAuthService.login.mockResolvedValue({ access_token: "jwt-token" });

      const result = await authController.login(dto);

      expect(mockUserService.validateUser).toHaveBeenCalledWith(dto.login, dto.password);
      expect(mockAuthService.login).toHaveBeenCalledWith(dto.login);
      expect(result).toEqual({ access_token: "jwt-token" });
    });
  });
});
