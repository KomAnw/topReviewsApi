import * as fs from "node:fs";
import { Inject, Injectable } from "@nestjs/common";
import { FileElementResponse } from "./dto/file-element.response";
import { FILE_STORAGE, type FileStorage } from "./storage/file-storage.interface";

@Injectable()
export class FilesService {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  async saveFilesPublic(files: Express.Multer.File[]): Promise<FileElementResponse[]> {
    const uploaded: FileElementResponse[] = await Promise.all(
      files.map(async (file) => {
        const buffer = file.buffer ?? fs.readFileSync(file.path);

        const url = await this.storage.upload({
          buffer,
          filename: file.originalname,
          mimetype: file.mimetype,
          resourceType: "other",
        });

        return {
          url,
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          fieldName: file.fieldname,
          encoding: file.encoding,
        };
      }),
    );

    return uploaded;
  }
}
