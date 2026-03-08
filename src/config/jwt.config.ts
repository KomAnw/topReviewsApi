import { ConfigService } from "@nestjs/config";
import type { JwtModuleOptions } from "@nestjs/jwt";
import type { StringValue } from "ms";

const getJwtConfig = async (configService: ConfigService): Promise<JwtModuleOptions> => {
  const secret = configService.getOrThrow<string>("JWT_SECRET");
  const expiresIn = (configService.getOrThrow<string>("JWT_EXPIRES_IN") ?? "1h") as StringValue;

  return {
    secret,
    signOptions: { expiresIn },
  };
};

export default getJwtConfig;
