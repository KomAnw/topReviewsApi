import type { INestApplication } from "@nestjs/common";
import { ValidationPipe } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Model } from "mongoose";
import request from "supertest";
import type { App } from "supertest/types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { HttpExceptionFilter } from "../src/common/http-exception.filter";
import { TOP_PAGE_CONSTANTS } from "../src/top-page/top-page.constants";
import { TopLevelCategory, TopPageModel } from "../src/top-page/top-page.model";

const createTopPageDto = {
  firstCategory: TopLevelCategory.Courses,
  secondCategory: "second",
  alias: "test-alias-e2e",
  title: "Test Top Page",
  category: "category",
  tagsTitle: "Tags",
  tags: ["tag1", "tag2"],
};

describe("TopPageController (e2e)", () => {
  let app: INestApplication<App>;
  let topPageModel: Model<TopPageModel>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    topPageModel = app.get<Model<TopPageModel>>(getModelToken(TopPageModel.name));
  });

  afterEach(async () => {
    await topPageModel.deleteMany({});
    await app.close();
  });

  describe("POST /top-page/create", () => {
    it("should create a top page", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post("/top-page/create")
        .set("Content-Type", "application/json")
        .send(createTopPageDto);

      expect(status).toBe(201);
      expect(body).toMatchObject({
        firstCategory: createTopPageDto.firstCategory,
        secondCategory: createTopPageDto.secondCategory,
        alias: createTopPageDto.alias,
        title: createTopPageDto.title,
        category: createTopPageDto.category,
        tagsTitle: createTopPageDto.tagsTitle,
        tags: createTopPageDto.tags,
      });
      expect(body._id).toBeDefined();
    });
  });

  describe("GET /top-page/:id", () => {
    it("should return top page by id", async () => {
      const created = await topPageModel.create(createTopPageDto);
      const id = created._id.toString();

      const { body, status } = await request(app.getHttpServer()).get(`/top-page/${id}`);

      expect(status).toBe(200);
      expect(body._id).toBe(id);
      expect(body.alias).toBe(createTopPageDto.alias);
    });

    it("should return 404 when top page not found", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer()).get(`/top-page/${fakeId}`);

      expect(status).toBe(404);
      expect(body.message).toBe(TOP_PAGE_CONSTANTS.NOT_FOUND);
    });
  });

  describe("GET /top-page/getByAlias/:alias", () => {
    it("should return top page by alias", async () => {
      await topPageModel.create(createTopPageDto);

      const { body, status } = await request(app.getHttpServer()).get(
        `/top-page/getByAlias/${createTopPageDto.alias}`,
      );

      expect(status).toBe(200);
      expect(body.alias).toBe(createTopPageDto.alias);
      expect(body.title).toBe(createTopPageDto.title);
    });
  });

  describe("PATCH /top-page/:id", () => {
    it("should update top page", async () => {
      const created = await topPageModel.create(createTopPageDto);
      const id = created._id.toString();

      const updateDto = { title: "Updated Title", seoText: "Updated seo" };
      const { body, status } = await request(app.getHttpServer())
        .patch(`/top-page/${id}`)
        .set("Content-Type", "application/json")
        .send(updateDto);

      expect(status).toBe(200);
      expect(body.title).toBe(updateDto.title);
      expect(body.seoText).toBe(updateDto.seoText);
    });

    it("should return 404 when updating non-existent top page", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer())
        .patch(`/top-page/${fakeId}`)
        .set("Content-Type", "application/json")
        .send({ title: "Updated" });

      expect(status).toBe(404);
      expect(body.message).toBe(TOP_PAGE_CONSTANTS.UPDATE_FAILED);
    });
  });

  describe("DELETE /top-page/:id", () => {
    it("should delete top page", async () => {
      const created = await topPageModel.create(createTopPageDto);
      const id = created._id.toString();

      const { body, status } = await request(app.getHttpServer()).delete(`/top-page/${id}`);

      expect(status).toBe(200);
      expect(body.id).toBe(id);
      expect(body.message).toBe(TOP_PAGE_CONSTANTS.DELETION_SUCCESS);

      const found = await topPageModel.findById(id).exec();
      expect(found).toBeNull();
    });

    it("should return 404 when deleting non-existent top page", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer()).delete(`/top-page/${fakeId}`);

      expect(status).toBe(404);
      expect(body.message).toBe(TOP_PAGE_CONSTANTS.DELETION_FAILED);
    });
  });

  describe("POST /top-page/find", () => {
    it("should return top pages by firstCategory", async () => {
      await topPageModel.create(createTopPageDto);

      const { body, status } = await request(app.getHttpServer())
        .post("/top-page/find")
        .set("Content-Type", "application/json")
        .send({ firstCategory: TopLevelCategory.Courses });

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0]).toMatchObject({
        firstCategory: TopLevelCategory.Courses,
        alias: createTopPageDto.alias,
      });
    });

    it("should return empty array when no matching top pages", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post("/top-page/find")
        .set("Content-Type", "application/json")
        .send({ firstCategory: TopLevelCategory.Books });

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });
  });
});
