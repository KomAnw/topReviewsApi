import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateReviewDto } from "./dto/create-review.dto";
import { ReviewModel } from "./review.model";
import { ReviewService } from "./review.service";

describe("ReviewService", () => {
  let reviewService: ReviewService;
  let mockSave: ReturnType<typeof vi.fn>;
  let mockFindByIdAndDelete: ReturnType<typeof vi.fn>;
  let mockFind: ReturnType<typeof vi.fn>;
  let mockDeleteMany: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    mockSave = vi.fn().mockResolvedValue({ _id: "review-id", name: "Test" });
    const MockReviewModel = class {
      save = mockSave;
    };

    mockFindByIdAndDelete = vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue({ _id: "deleted-id" }),
    });
    mockFind = vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue([{ _id: "r1" }]),
    });
    mockDeleteMany = vi.fn().mockReturnValue({
      exec: vi.fn().mockResolvedValue({ deletedCount: 2 }),
    });

    const mockReviewModel = Object.assign(MockReviewModel, {
      findByIdAndDelete: mockFindByIdAndDelete,
      find: mockFind,
      deleteMany: mockDeleteMany,
    });

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: getModelToken(ReviewModel.name),
          useValue: mockReviewModel,
        },
      ],
    }).compile();

    reviewService = app.get<ReviewService>(ReviewService);
  });

  describe("create", () => {
    it("should create and save a review", async () => {
      const dto: CreateReviewDto = {
        name: "John",
        title: "Great product",
        description: "Amazing",
        rating: 5,
        productId: "507f1f77bcf86cd799439011",
      };
      const result = await reviewService.create(dto);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: "review-id", name: "Test" });
    });
  });

  describe("delete", () => {
    it("should delete review by id", async () => {
      const id = "507f1f77bcf86cd799439011";
      const result = await reviewService.delete(id);
      expect(mockFindByIdAndDelete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ _id: "deleted-id" });
    });
  });

  describe("findByProductId", () => {
    it("should find reviews by product id", async () => {
      const productId = "507f1f77bcf86cd799439011";
      const result = await reviewService.findByProductId(productId);
      expect(mockFind).toHaveBeenCalled();
      expect(result).toEqual([{ _id: "r1" }]);
    });
  });

  describe("deleteAllByProductId", () => {
    it("should delete all reviews by product id", async () => {
      const productId = "507f1f77bcf86cd799439011";
      const result = await reviewService.deleteAllByProductId(productId);
      expect(mockDeleteMany).toHaveBeenCalled();
      expect(result).toEqual({ deletedCount: 2 });
    });
  });
});
