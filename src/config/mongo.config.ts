import { ConfigService } from "@nestjs/config";
import { MongooseModuleFactoryOptions, MongooseModuleOptions } from "@nestjs/mongoose";

const mongoOptions: MongooseModuleOptions = {
  retryAttempts: 5,
  retryDelay: 5000,
};

const getMongoConfig = (
  configService: ConfigService,
): Promise<MongooseModuleFactoryOptions> | MongooseModuleFactoryOptions => {
  const user = configService.get<string>("MONGO_USER");
  const password = configService.get<string>("MONGO_PASSWORD");
  const host = configService.get<string>("MONGO_HOST", "localhost");
  const port = configService.get<number>("MONGO_PORT", 27017);
  const db = configService.get<string>("MONGO_DB", "top-api");

  const mongoUri = `mongodb://${user}:${password}@${host}:${port}/${db}`;
  return {
    uri: mongoUri,
    ...mongoOptions,
  };
};

export default getMongoConfig;
