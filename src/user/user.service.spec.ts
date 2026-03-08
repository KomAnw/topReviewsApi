import { UnauthorizedException } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { USER_CONSTANTS } from "./user.constants";
import { UserModel } from "./user.model";
import { UserService } from "./user.service";

vi.mock("bcryptjs", () => ({
  genSalt: vi.fn(),
  hash: vi.fn(),
  compare: vi.fn(),
}));

import { compare, genSalt, hash } from "bcryptjs";

describe("UserService", () => {
  let userService: UserService;
  let mockFindOne: ReturnType<typeof vi.fn>;
  let mockExec: ReturnType<typeof vi.fn>;
  let mockSave: ReturnType<typeof vi.fn>;
  let MockUserModel: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.mocked(genSalt).mockResolvedValue("salt" as never);
    vi.mocked(hash).mockResolvedValue("hashed-password" as never);
    vi.mocked(compare).mockResolvedValue(true as never);

    mockExec = vi.fn().mockResolvedValue(null);
    mockFindOne = vi.fn().mockReturnValue({ exec: mockExec });
    mockSave = vi.fn().mockResolvedValue({
      _id: "user-id",
      email: "test@example.com",
      passwordHash: "hashed-password",
    });

    MockUserModel = vi.fn().mockImplementation(function (
      this: { save: ReturnType<typeof vi.fn> },
      data: object,
    ) {
      Object.assign(this, data);
      this.save = mockSave;
      return this;
    });
    (MockUserModel as unknown as { findOne: ReturnType<typeof vi.fn> }).findOne = mockFindOne;

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getModelToken(UserModel.name),
          useValue: MockUserModel,
        },
      ],
    }).compile();

    userService = app.get<UserService>(UserService);
  });

  describe("findUser", () => {
    it("should return user when found", async () => {
      const user = { _id: "id", email: "a@b.com", passwordHash: "h" };
      mockExec.mockResolvedValue(user);

      const result = await userService.findUser("a@b.com");

      expect(mockFindOne).toHaveBeenCalledWith({ email: "a@b.com" });
      expect(result).toEqual(user);
    });

    it("should return null when user not found", async () => {
      mockExec.mockResolvedValue(null);

      const result = await userService.findUser("nonexistent@test.com");

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should hash password and save user with email and passwordHash", async () => {
      const result = await userService.createUser("new@example.com", "plainPassword");

      expect(genSalt).toHaveBeenCalledWith(10);
      expect(hash).toHaveBeenCalledWith("plainPassword", "salt");
      expect(MockUserModel).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "new@example.com",
          passwordHash: "hashed-password",
        }),
      );
      expect(mockSave).toHaveBeenCalled();
      expect(result).toMatchObject({ email: "test@example.com", passwordHash: "hashed-password" });
    });
  });

  describe("validateUser", () => {
    it("should return user when password is correct", async () => {
      const user = { _id: "id", email: "u@u.com", passwordHash: "stored-hash" };
      mockExec.mockResolvedValue(user);
      vi.mocked(compare).mockResolvedValue(true as never);

      const result = await userService.validateUser("u@u.com", "correct-password");

      expect(mockFindOne).toHaveBeenCalledWith({ email: "u@u.com" });
      expect(compare).toHaveBeenCalledWith("correct-password", "stored-hash");
      expect(result).toEqual(user);
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockExec.mockResolvedValue(null);
      vi.mocked(compare).mockClear();

      await expect(userService.validateUser("missing@test.com", "any")).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(userService.validateUser("missing@test.com", "any")).rejects.toMatchObject({
        message: USER_CONSTANTS.USER_NOT_FOUND,
      });
      expect(compare).not.toHaveBeenCalled();
    });

    it("should throw UnauthorizedException when password is wrong", async () => {
      const user = { _id: "id", email: "u@u.com", passwordHash: "stored-hash" };
      mockExec.mockResolvedValue(user);
      vi.mocked(compare).mockResolvedValue(false as never);

      await expect(userService.validateUser("u@u.com", "wrong-password")).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(userService.validateUser("u@u.com", "wrong-password")).rejects.toMatchObject({
        message: USER_CONSTANTS.INVALID_PASSWORD,
      });
    });
  });
});
