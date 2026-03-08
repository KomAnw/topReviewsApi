import { JwtService } from "@nestjs/jwt";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;

  const mockJwtService = {
    signAsync: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockJwtService.signAsync.mockResolvedValue("jwt-token");

    const app: TestingModule = await Test.createTestingModule({
      providers: [AuthService, { provide: JwtService, useValue: mockJwtService }],
    }).compile();

    authService = app.get<AuthService>(AuthService);
  });

  describe("login", () => {
    it("should call signAsync with payload and return access_token", async () => {
      const email = "user@example.com";

      const result = await authService.login(email);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ email });
      expect(result).toEqual({ access_token: "jwt-token" });
    });

    it("should return token from JwtService", async () => {
      mockJwtService.signAsync.mockResolvedValue("another-token");

      const result = await authService.login("other@test.com");

      expect(result).toEqual({ access_token: "another-token" });
    });
  });
});
