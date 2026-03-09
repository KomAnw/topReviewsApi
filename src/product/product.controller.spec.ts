import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PRODUCT_CONSTANTS } from "./product.constants";
import { ProductController } from "./product.controller";
import { ProductService } from "./product.service";

describe("ProductController", () => {
  let productController: ProductController;

  const mockProductService = {
    findById: vi.fn(),
    create: vi.fn(),
    deleteById: vi.fn(),
    updateById: vi.fn(),
    findWithReviews: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductService, useValue: mockProductService }],
    }).compile();

    productController = app.get<ProductController>(ProductController);
  });

  describe("get", () => {
    it("should call get with id", async () => {
      const product = { _id: "507f1f77bcf86cd799439011", title: "Product" };
      mockProductService.findById.mockResolvedValue(product);

      const result = await productController.get("507f1f77bcf86cd799439011");

      expect(mockProductService.findById).toHaveBeenCalledWith("507f1f77bcf86cd799439011");
      expect(result).toEqual(product);
    });
  });

  describe("create", () => {
    it("should call create with dto", async () => {
      const dto = {
        image: "image.png",
        title: "Product",
        price: 100,
        oldPrice: 120,
        credit: 10,
        description: "Description",
        calculatedRating: 4.5,
        advantages: "Pros",
        disadvantages: "Cons",
        categories: ["cat1"],
        tags: ["tag1"],
        characteristics: [],
      };
      const created = { _id: "507f1f77bcf86cd799439011", ...dto };
      mockProductService.create.mockResolvedValue(created);

      const result = await productController.create(dto);

      expect(mockProductService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe("delete", () => {
    it("should call delete with id", async () => {
      const id = "507f1f77bcf86cd799439011";
      mockProductService.deleteById.mockResolvedValue({ _id: id });

      const result = await productController.delete(id);

      expect(mockProductService.deleteById).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, message: PRODUCT_CONSTANTS.DELETION_SUCCESS });
    });
  });

  describe("update", () => {
    it("should call update with id and dto", async () => {
      const dto = {
        _id: "507f1f77bcf86cd799439011",
        image: "image.png",
        title: "Updated Product",
        price: 90,
        oldPrice: 100,
        credit: 9,
        description: "Updated",
        calculatedRating: 4.5,
        advantages: "Pros",
        disadvantages: "Cons",
        categories: ["cat1"],
        tags: ["tag1"],
        characteristics: [],
      };
      const updated = { ...dto };
      mockProductService.updateById.mockResolvedValue(updated);

      const result = await productController.update("507f1f77bcf86cd799439011", dto);

      expect(mockProductService.updateById).toHaveBeenCalledWith("507f1f77bcf86cd799439011", dto);
      expect(result).toEqual(updated);
    });
  });

  describe("find", () => {
    it("should call find with query dto", async () => {
      const dto = { category: "test", limit: 10 };
      const found = [{ _id: "1", title: "P1" }];
      mockProductService.findWithReviews.mockResolvedValue(found);

      const result = await productController.find(dto);

      expect(mockProductService.findWithReviews).toHaveBeenCalledWith(dto);
      expect(result).toEqual(found);
    });
  });
});
