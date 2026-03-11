import * as fs from "node:fs";
import * as path from "node:path";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import sharp from "sharp";
import { FileElementResponse } from "./dto/file-element.response";
import { FILE_STORAGE, type FileStorage } from "./storage/file-storage.interface";

@Injectable()
export class FilesService {
  constructor(@Inject(FILE_STORAGE) private readonly storage: FileStorage) {}

  private static readonly IMAGE_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/avif",
    "image/tiff",
    "image/svg+xml",
  ]);

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

  async uploadImageWithVariants(file: Express.Multer.File): Promise<FileElementResponse[]> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    const mimetype = file.mimetype?.toLowerCase();
    if (!mimetype || !FilesService.IMAGE_MIME_TYPES.has(mimetype)) {
      throw new BadRequestException("Invalid image file type");
    }

    const sourceBuffer = file.buffer ?? fs.readFileSync(file.path);

    let fullBuffer: Buffer;
    let previewBuffer: Buffer;
    try {
      [fullBuffer, previewBuffer] = await Promise.all([
        sharp(sourceBuffer).webp({ quality: 100, effort: 4 }).toBuffer(),
        sharp(sourceBuffer).webp({ quality: 5, effort: 4 }).toBuffer(),
      ]);
    } catch {
      throw new BadRequestException("Image conversion failed");
    }

    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const fullName = `${baseName}.webp`;
    const previewName = `${baseName}-preview.webp`;

    const [url, previewUrl] = await Promise.all([
      this.storage.upload({
        buffer: fullBuffer,
        filename: fullName,
        mimetype: "image/webp",
        resourceType: "other",
      }),
      this.storage.upload({
        buffer: previewBuffer,
        filename: previewName,
        mimetype: "image/webp",
        resourceType: "other",
      }),
    ]);

    return [
      {
        url,
        previewUrl,
        name: fullName,
        size: fullBuffer.length,
        mimetype: "image/webp",
        fieldName: file.fieldname,
        encoding: file.encoding,
      },
    ];
  }
}
