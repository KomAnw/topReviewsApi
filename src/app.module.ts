import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { AppController } from "./app.controller";
import { AuthModule } from "./auth/auth.module";
import getMongoConfig from "./config/mongo.config";
import { ProductModule } from "./product/product.module";
import { ReviewModule } from "./review/review.module";
import { TopPageModule } from "./top-page/top-page.module";
import { UserModule } from "./user/user.module";

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getMongoConfig,
      inject: [ConfigService],
    }),
    AuthModule,
    TopPageModule,
    ProductModule,
    ReviewModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
