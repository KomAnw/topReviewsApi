import type { INestApplication } from "@nestjs/common";
import { getModelToken } from "@nestjs/mongoose";
import { Test, type TestingModule } from "@nestjs/testing";
import type { Model } from "mongoose";
import request from "supertest";
import type { App } from "supertest/types";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AppModule } from "../src/app.module";
import { ProductModel } from "../src/product/product.model";
import { REVIEW_CONSTANTS } from "../src/review/review.constants";
import { ReviewModel } from "../src/review/review.model";

describe("ReviewController (e2e)", () => {
  let app: INestApplication<App>;
  let productModel: Model<ProductModel>;
  let reviewModel: Model<ReviewModel>;
  let productId: string;
  let authToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const testUser = { login: "e2e@test.com", password: "password123" };
    await request(app.getHttpServer()).post("/auth/register").send(testUser);
    const loginRes = await request(app.getHttpServer()).post("/auth/login").send(testUser);
    authToken = loginRes.body.access_token as string;

    productModel = app.get<Model<ProductModel>>(getModelToken(ProductModel.name));
    reviewModel = app.get<Model<ReviewModel>>(getModelToken(ReviewModel.name));
    const product = await productModel.create({
      title: "Test Product",
      price: 100,
      description: "Test description",
    });
    productId = product._id.toString();
  });

  afterEach(async () => {
    await reviewModel.deleteMany({});
    await productModel.deleteMany({});
    await app.close();
  });

  describe("POST /review/create", () => {
    it("should create a review", async () => {
      const dto = {
        name: "John",
        title: "Great product",
        description: "Very good",
        rating: 5,
        productId,
      };

      const { body, status } = await request(app.getHttpServer())
        .post("/review/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send(dto);

      expect(status).toBe(201);
      expect(body).toMatchObject({
        name: dto.name,
        title: dto.title,
        description: dto.description,
        rating: dto.rating,
      });
      expect(body.productId).toBe(productId);
      expect(body._id).toBeDefined();
    });
  });

  describe("GET /review/byProduct/:id", () => {
    it("should return reviews by product id", async () => {
      const dto = {
        name: "John",
        title: "Great",
        description: "Good",
        rating: 5,
        productId,
      };

      await request(app.getHttpServer())
        .post("/review/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send(dto);

      const { body, status } = await request(app.getHttpServer())
        .get(`/review/byProduct/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(1);
      expect(body[0]).toMatchObject({
        name: dto.name,
        title: dto.title,
        rating: dto.rating,
      });
    });

    it("should return empty array when no reviews for product", async () => {
      const { body, status } = await request(app.getHttpServer())
        .get(`/review/byProduct/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(status).toBe(200);
      expect(body).toEqual([]);
    });
  });

  describe("DELETE /review/:id", () => {
    it("should delete a review by id", async () => {
      const dto = {
        name: "John",
        title: "Great",
        description: "Good",
        rating: 5,
        productId,
      };

      const createRes = await request(app.getHttpServer())
        .post("/review/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send(dto);
      const reviewId = createRes.body._id;

      const { body, status } = await request(app.getHttpServer())
        .delete(`/review/${reviewId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(status).toBe(200);
      expect(body._id).toBe(reviewId);

      const byProduct = await request(app.getHttpServer())
        .get(`/review/byProduct/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(byProduct.body).toHaveLength(0);
    });

    it("should return 404 when review not found", async () => {
      const fakeId = "507f1f77bcf86cd799439011";

      const { status, body } = await request(app.getHttpServer())
        .delete(`/review/${fakeId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(status).toBe(404);
      expect(body.message).toBe(REVIEW_CONSTANTS.NOT_FOUND_BY_ID);
    });
  });

  describe("DELETE /review/deleteAllByProductId/:id", () => {
    it("should delete all reviews by product id", async () => {
      const dto = {
        name: "John",
        title: "Great",
        description: "Good",
        rating: 5,
        productId,
      };

      await request(app.getHttpServer())
        .post("/review/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send(dto);
      await request(app.getHttpServer())
        .post("/review/create")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ ...dto, name: "Jane" });

      const { status } = await request(app.getHttpServer())
        .delete(`/review/deleteAllByProductId/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(status).toBe(200);

      const byProduct = await request(app.getHttpServer())
        .get(`/review/byProduct/${productId}`)
        .set("Authorization", `Bearer ${authToken}`);
      expect(byProduct.body).toHaveLength(0);
    });
  });
});
