import { NotFoundException } from "@nestjs/common";
import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CreateReviewDto } from "./dto/create-review.dto";
import { REVIEW_CONSTANTS } from "./review.constants";
import { ReviewController } from "./review.controller";
import { ReviewService } from "./review.service";

describe("ReviewController", () => {
  let reviewController: ReviewController;

  const mockReviewService = {
    create: vi.fn(),
    delete: vi.fn(),
    deleteAllByProductId: vi.fn(),
    findByProductId: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReviewController],
      providers: [
        {
          provide: ReviewService,
          useValue: mockReviewService,
        },
      ],
    }).compile();

    reviewController = app.get<ReviewController>(ReviewController);
  });

  describe("create", () => {
    it("should create a review and return result", async () => {
      const dto: CreateReviewDto = {
        name: "John",
        title: "Great",
        description: "Amazing",
        rating: 5,
        productId: "507f1f77bcf86cd799439011",
      };
      const savedReview = { _id: "review-id", ...dto };
      mockReviewService.create.mockResolvedValue(savedReview);

      const result = await reviewController.create(dto);

      expect(mockReviewService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(savedReview);
    });
  });

  describe("delete", () => {
    it("should delete review and return result", async () => {
      const id = "507f1f77bcf86cd799439011";
      const deletedReview = { _id: id };
      mockReviewService.delete.mockResolvedValue(deletedReview);

      const result = await reviewController.delete(id);

      expect(mockReviewService.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({
        id: "507f1f77bcf86cd799439011",
        message: REVIEW_CONSTANTS.DELETION_SUCCESS,
      });
    });

    it("should throw NotFoundException when review not found", async () => {
      mockReviewService.delete.mockResolvedValue(null);

      await expect(reviewController.delete("invalid-id")).rejects.toThrow(NotFoundException);
      await expect(reviewController.delete("invalid-id")).rejects.toThrow(
        REVIEW_CONSTANTS.NOT_FOUND_BY_ID,
      );
    });
  });

  describe("deleteAllByProductId", () => {
    it("should delete all reviews by product id", async () => {
      const productId = "507f1f77bcf86cd799439011";
      const deletedResult = { deletedCount: 2 };
      mockReviewService.deleteAllByProductId.mockResolvedValue(deletedResult);

      const result = await reviewController.deleteAllByProductId(productId);

      expect(mockReviewService.deleteAllByProductId).toHaveBeenCalledWith(productId);
      expect(result).toEqual(deletedResult);
    });

    it("should throw NotFoundException when no reviews found for product", async () => {
      mockReviewService.deleteAllByProductId.mockResolvedValue(null);

      await expect(reviewController.deleteAllByProductId("invalid-product")).rejects.toThrow(
        NotFoundException,
      );
      await expect(reviewController.deleteAllByProductId("invalid-product")).rejects.toThrow(
        REVIEW_CONSTANTS.NOT_FOUND_BY_PRODUCT_ID,
      );
    });
  });

  describe("getByProductId", () => {
    it("should return reviews by product id", async () => {
      const productId = "507f1f77bcf86cd799439011";
      const reviews = [
        { _id: "r1", productId },
        { _id: "r2", productId },
      ];
      mockReviewService.findByProductId.mockResolvedValue(reviews);

      const result = await reviewController.getByProductId(productId);

      expect(mockReviewService.findByProductId).toHaveBeenCalledWith(productId);
      expect(result).toEqual(reviews);
    });
  });
});
