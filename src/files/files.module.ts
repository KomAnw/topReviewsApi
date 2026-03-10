import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { FILE_STORAGE } from "./storage/file-storage.interface";
import { MinioStorage } from "./storage/minio.storage";

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: FILE_STORAGE,
      useClass: MinioStorage,
    },
  ],
})
export class FilesModule {}
