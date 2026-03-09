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
import { PRODUCT_CONSTANTS } from "../src/product/product.constants";
import { ProductModel } from "../src/product/product.model";

const createProductDto = {
  image: "https://example.com/image.png",
  title: "Test Product",
  price: 100,
  credit: 10,
  description: "Test description",
  advantages: "Pros",
  disadvantages: "Cons",
  categories: ["Electronics"],
  tags: ["tag1", "tag2"],
  characteristics: [
    { name: "Color", value: "Black" },
    { name: "Weight", value: "1kg" },
  ],
};

describe("ProductController (e2e)", () => {
  let app: INestApplication<App>;
  let productModel: Model<ProductModel>;

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

    productModel = app.get<Model<ProductModel>>(getModelToken(ProductModel.name));
  });

  afterEach(async () => {
    await productModel.deleteMany({});
    await app.close();
  });

  describe("POST /product/create", () => {
    it("should create a product", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post("/product/create")
        .set("Content-Type", "application/json")
        .send(createProductDto);

      expect(status).toBe(201);
      expect(body).toMatchObject({
        title: createProductDto.title,
        price: createProductDto.price,
        description: createProductDto.description,
        categories: createProductDto.categories,
        tags: createProductDto.tags,
      });
      expect(body._id).toBeDefined();
      expect(body.characteristics).toHaveLength(createProductDto.characteristics.length);
    });
  });

  describe("GET /product/:id", () => {
    it("should return product by id", async () => {
      const created = await productModel.create(createProductDto);
      const id = created._id.toString();

      const { body, status } = await request(app.getHttpServer()).get(`/product/${id}`);

      expect(status).toBe(200);
      expect(body._id).toBe(id);
      expect(body.title).toBe(createProductDto.title);
    });

    it("should return 404 when product not found", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer()).get(`/product/${fakeId}`);

      expect(status).toBe(404);
      expect(body.message).toBe(PRODUCT_CONSTANTS.NOT_FOUND_BY_ID);
    });
  });

  describe("PATCH /product/:id", () => {
    it("should update product", async () => {
      const created = await productModel.create(createProductDto);
      const id = created._id.toString();

      const updateDto = { title: "Updated Title", price: 200 };
      const { body, status } = await request(app.getHttpServer())
        .patch(`/product/${id}`)
        .set("Content-Type", "application/json")
        .send(updateDto);

      expect(status).toBe(200);
      expect(body.title).toBe(updateDto.title);
      expect(body.price).toBe(updateDto.price);
    });

    it("should return 404 when updating non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer())
        .patch(`/product/${fakeId}`)
        .set("Content-Type", "application/json")
        .send({ title: "Updated" });

      expect(status).toBe(404);
      expect(body.message).toBe(PRODUCT_CONSTANTS.UPDATE_FAILED);
    });
  });

  describe("DELETE /product/:id", () => {
    it("should delete product", async () => {
      const created = await productModel.create(createProductDto);
      const id = created._id.toString();

      const { body, status } = await request(app.getHttpServer()).delete(`/product/${id}`);

      expect(status).toBe(200);
      expect(body.id).toBe(id);
      expect(body.message).toBe(PRODUCT_CONSTANTS.DELETION_SUCCESS);

      const found = await productModel.findById(id).exec();
      expect(found).toBeNull();
    });

    it("should return 404 when deleting non-existent product", async () => {
      const fakeId = "507f1f77bcf86cd799439011";
      const { status, body } = await request(app.getHttpServer()).delete(`/product/${fakeId}`);

      expect(status).toBe(404);
      expect(body.message).toBe(PRODUCT_CONSTANTS.DELETION_FAILED);
    });
  });

  describe("POST /product/find", () => {
    it("should return products with reviews by category", async () => {
      await productModel.create(createProductDto);

      const { body, status } = await request(app.getHttpServer())
        .post("/product/find")
        .query({ category: "Electronics", limit: 10 });

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThanOrEqual(1);
      expect(body[0]).toMatchObject({
        categories: expect.arrayContaining(["Electronics"]),
      });
      expect(body[0]).toHaveProperty("reviews");
      expect(body[0]).toHaveProperty("reviewsCount");
      expect(body[0]).toHaveProperty("reviewsAvgRating");
    });

    it("should return empty array when no products in category", async () => {
      const { body, status } = await request(app.getHttpServer())
        .post("/product/find")
        .query({ category: "NonExistentCategory", limit: 10 });

      expect(status).toBe(200);
      expect(Array.isArray(body)).toBe(true);
      expect(body).toHaveLength(0);
    });
  });
});
