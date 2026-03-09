import "dotenv/config";
import { fakerRU as faker } from "@faker-js/faker";
import mongoose, { Types } from "mongoose";
import { ProductModel, ProductSchema } from "../src/product/product.model";
import { ReviewModel, ReviewSchema } from "../src/review/review.model";
import { TopLevelCategory, TopPageModel, TopPageSchema } from "../src/top-page/top-page.model";

const CATEGORIES = ["Электроника", "Ноутбуки", "Смартфоны", "Аудио", "Книги", "Курсы", "Услуги"];
const PRODUCT_COUNT = 15;
const REVIEWS_PER_PRODUCT = 3;
const TOP_PAGE_COUNT = 8;

function getMongoUri(): string {
  const user = process.env.MONGO_USER;
  const password = process.env.MONGO_PASSWORD;
  const host = process.env.MONGO_HOST ?? "localhost";
  const port = process.env.MONGO_PORT ?? "27017";
  const db = process.env.MONGO_DB ?? "top-api";
  if (user && password) {
    return `mongodb://${user}:${password}@${host}:${port}/${db}`;
  }
  return `mongodb://${host}:${port}/${db}`;
}

async function seed(): Promise<void> {
  const uri = getMongoUri();
  await mongoose.connect(uri);

  const Product = mongoose.model(ProductModel.name, ProductSchema);
  const Review = mongoose.model(ReviewModel.name, ReviewSchema);
  const TopPage = mongoose.model(TopPageModel.name, TopPageSchema);

  await Product.deleteMany({});
  await Review.deleteMany({});
  await TopPage.deleteMany({});

  const productIds: Types.ObjectId[] = [];
  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const price = faker.number.int({ min: 5000, max: 150000 });
    const product = await Product.create({
      image: faker.image.url(),
      title: faker.commerce.productName(),
      price,
      oldPrice: faker.datatype.boolean(0.3)
        ? price + faker.number.int({ min: 1000, max: 10000 })
        : undefined,
      credit: Math.round(price / 12),
      description: faker.commerce.productDescription(),
      advantages: faker.lorem.sentences(2),
      disadvantages: faker.lorem.sentence(),
      categories: faker.helpers.arrayElements(CATEGORIES, { min: 1, max: 3 }),
      tags: faker.helpers.arrayElements(
        ["новинка", "скидка", "хит", "рекомендуем", "качество", "доставка", "гарантия"].concat(
          faker.helpers.uniqueArray(() => faker.commerce.productAdjective(), 4),
        ),
        { min: 2, max: 6 },
      ),
      characteristics: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => ({
        name: faker.helpers.arrayElement(["Диагональ", "Процессор", "ОЗУ", "Память", "Вес", "Материал"]),
        value: faker.helpers.arrayElement(["15.6\"", "16 ГБ", "256 ГБ", "1.8 кг", "Пластик", "Металл"]),
      })),
    });
    productIds.push(product._id as Types.ObjectId);
  }

  const reviews: Array<Record<string, unknown>> = [];
  for (const productId of productIds) {
    for (let r = 0; r < REVIEWS_PER_PRODUCT; r++) {
      reviews.push({
        name: faker.person.firstName(),
        title: faker.lorem.sentence(4),
        description: faker.lorem.paragraph(),
        rating: faker.number.int({ min: 1, max: 5 }),
        productId,
      });
    }
  }
  await Review.insertMany(reviews);

  const topPageCategories = Object.values(TopLevelCategory).filter(
    (v) => typeof v === "number",
  ) as TopLevelCategory[];
  const topPages: Array<Record<string, unknown>> = [];
  const secondCategoriesRu = ["курсы", "услуги", "книги", "товары", "обучение", "консультации"];
  const tagsRu = ["обучение", "онлайн", "видео", "практика", "сертификат", "поддержка"];
  for (let i = 0; i < TOP_PAGE_COUNT; i++) {
    topPages.push({
      firstCategory: faker.helpers.arrayElement(topPageCategories),
      secondCategory: faker.helpers.arrayElement(secondCategoriesRu),
      alias: `alias-${faker.string.alphanumeric(8).toLowerCase()}-${i}`,
      title: faker.commerce.productName(),
      category: faker.commerce.department(),
      tagsTitle: faker.helpers.arrayElement(["Популярные теги", "Категории", "Направления"]),
      tags: faker.helpers.arrayElements(tagsRu, { min: 2, max: 5 }),
      seoText: faker.lorem.paragraphs(2),
      hh: {
        count: faker.number.int({ min: 100, max: 2000 }),
        juniorSalary: faker.number.int({ min: 50000, max: 100000 }),
        seniorSalary: faker.number.int({ min: 150000, max: 300000 }),
      },
      advantages: [
        { title: faker.lorem.sentence(2), description: faker.lorem.sentence() },
        { title: faker.lorem.sentence(2), description: faker.lorem.sentence() },
      ],
    });
  }
  await TopPage.insertMany(topPages);

  console.log("Seed completed.");
  console.log(`  Products: ${productIds.length}`);
  console.log(`  Reviews: ${productIds.length * REVIEWS_PER_PRODUCT}`);
  console.log(`  TopPages: ${TOP_PAGE_COUNT}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(() => mongoose.disconnect());
