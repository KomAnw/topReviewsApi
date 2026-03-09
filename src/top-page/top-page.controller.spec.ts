import { Test, type TestingModule } from "@nestjs/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TOP_PAGE_CONSTANTS } from "./top-page.constants";
import { TopPageController } from "./top-page.controller";
import { TopLevelCategory } from "./top-page.model";
import { TopPageService } from "./top-page.service";

describe("TopPageController", () => {
  let topPageController: TopPageController;

  const mockTopPageService = {
    getById: vi.fn(),
    getByAlias: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
    find: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [TopPageController],
      providers: [{ provide: TopPageService, useValue: mockTopPageService }],
    }).compile();

    topPageController = app.get<TopPageController>(TopPageController);
  });

  describe("get", () => {
    it("should call get with alias", async () => {
      const topPage = { alias: "test-alias", title: "Test" };
      mockTopPageService.getByAlias.mockResolvedValue(topPage);

      const result = await topPageController.get("test-alias");

      expect(mockTopPageService.getByAlias).toHaveBeenCalledWith("test-alias");
      expect(result).toEqual(topPage);
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
      const created = { _id: "507f1f77bcf86cd799439011", ...dto };
      mockTopPageService.create.mockResolvedValue(created);

      const result = await topPageController.create(dto);

      expect(mockTopPageService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });
  });

  describe("delete", () => {
    it("should call delete with id", async () => {
      const id = "507f1f77bcf86cd799439011";
      mockTopPageService.delete.mockResolvedValue({ _id: id });

      const result = await topPageController.delete(id);

      expect(mockTopPageService.delete).toHaveBeenCalledWith(id);
      expect(result).toEqual({ id, message: TOP_PAGE_CONSTANTS.DELETION_SUCCESS });
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
      const updated = { ...dto };
      mockTopPageService.update.mockResolvedValue(updated);

      const result = await topPageController.update("507f1f77bcf86cd799439011", dto);

      expect(mockTopPageService.update).toHaveBeenCalledWith("507f1f77bcf86cd799439011", dto);
      expect(result).toEqual(updated);
    });
  });

  describe("find", () => {
    it("should call find with dto", async () => {
      const dto = { firstCategory: TopLevelCategory.Courses };
      const found = [{ _id: "1", title: "Page" }];
      mockTopPageService.find.mockResolvedValue(found);

      const result = await topPageController.find(dto);

      expect(mockTopPageService.find).toHaveBeenCalledWith(dto);
      expect(result).toEqual(found);
    });
  });
});
