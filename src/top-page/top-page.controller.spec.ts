import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it } from "vitest";
import { TopPageController } from "./top-page.controller";
import { TopLevelCategory } from "./top-page.model";

describe("TopPageController", () => {
  let topPageController: TopPageController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [TopPageController],
    }).compile();

    topPageController = app.get<TopPageController>(TopPageController);
  });

  describe("get", () => {
    it("should call get with alias", async () => {
      const result = await topPageController.get("test-alias");
      expect(result).toBeUndefined();
    });
  });

  describe("create", () => {
    it("should call create with dto", async () => {
      const dto = {
        firstCategory: TopLevelCategory.Courses,
        secondCategory: "Programming",
        alias: "programming-courses",
        title: "Programming Courses",
        category: "courses",
        tagsTitle: "Tags",
        tags: ["programming", "courses"],
      };
      const result = await topPageController.create(dto);
      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("should call delete with id", async () => {
      const result = await topPageController.delete("507f1f77bcf86cd799439011");
      expect(result).toBeUndefined();
    });
  });

  describe("update", () => {
    it("should call update with id and dto", async () => {
      const dto = {
        _id: "507f1f77bcf86cd799439011",
        firstCategory: TopLevelCategory.Courses,
        secondCategory: "Programming",
        alias: "programming-courses",
        title: "Updated Title",
        category: "courses",
        tagsTitle: "Tags",
        tags: ["programming"],
      };
      const result = await topPageController.update("507f1f77bcf86cd799439011", dto);
      expect(result).toBeUndefined();
    });
  });

  describe("find", () => {
    it("should call find with dto", async () => {
      const dto = { firstCategory: TopLevelCategory.Courses };
      const result = await topPageController.find(dto);
      expect(result).toBeUndefined();
    });
  });
});
