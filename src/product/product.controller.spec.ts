import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { ProductController } from "./product.controller";

describe("ProductController", () => {
  let productController: ProductController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
    }).compile();

    productController = app.get<ProductController>(ProductController);
  });

  describe("get", () => {
    it("should call get with id", async () => {
      const result = await productController.get("507f1f77bcf86cd799439011");
      expect(result).toBeUndefined();
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
      const result = await productController.create(dto);
      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("should call delete with id", async () => {
      const result = await productController.delete("507f1f77bcf86cd799439011");
      expect(result).toBeUndefined();
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
      const result = await productController.update("507f1f77bcf86cd799439011", dto);
      expect(result).toBeUndefined();
    });
  });

  describe("find", () => {
    it("should call find with query dto", async () => {
      const dto = { category: "test", limit: 10 };
      const result = await productController.find(dto);
      expect(result).toBeUndefined();
    });
  });
});
