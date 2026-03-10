import { randomUUID } from "node:crypto";
import * as path from "node:path";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { format } from "date-fns";
import { Client as MinioClient } from "minio";
import type { FileUploadParams } from "./file-storage.interface";
import { FileStorage } from "./file-storage.interface";

@Injectable()
export class MinioStorage implements FileStorage {
  private readonly minioClient: MinioClient;
  private readonly bucketName: string;
  private readonly publicEndpoint: string;

  constructor(private readonly configService: ConfigService) {
    const endPoint = this.configService.getOrThrow<string>("MINIO_ENDPOINT");
    const port = Number(this.configService.getOrThrow<number>("MINIO_PORT"));
    const accessKey = this.configService.getOrThrow<string>("MINIO_ACCESS_KEY");
    const secretKey = this.configService.getOrThrow<string>("MINIO_SECRET_KEY");
    const bucketName = this.configService.getOrThrow<string>("MINIO_BUCKET");
    const publicEndpoint = this.configService.getOrThrow<string>("MINIO_PUBLIC_ENDPOINT");

    this.minioClient = new MinioClient({
      endPoint,
      port,
      useSSL: false,
      accessKey,
      secretKey,
    });

    this.bucketName = bucketName;
    this.publicEndpoint = publicEndpoint;
  }

  private buildObjectName(params: FileUploadParams): string {
    const now = new Date();
    const year = format(now, "yyyy");
    const month = format(now, "MM");
    const day = format(now, "dd");

    const ext = path.extname(params.filename).toLowerCase();
    const id = randomUUID();

    const tenantPart = params.tenantId ? `tenant-${params.tenantId}` : "public";
    const resourcePart = params.resourceType;
    const yearPart = String(year);
    const monthPart = month;
    const dayPart = day;
    const filePart = `${id}${ext}`;

    return `${tenantPart}/${resourcePart}/${yearPart}/${monthPart}/${dayPart}/${filePart}`;
  }

  private async ensureBucket(): Promise<void> {
    const exists = await this.minioClient.bucketExists(this.bucketName).catch(() => false);

    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName, "");
    }
  }

  async upload(params: FileUploadParams): Promise<string> {
    await this.ensureBucket();

    const objectName = this.buildObjectName(params);

    await this.minioClient.putObject(
      this.bucketName,
      objectName,
      params.buffer,
      params.buffer.length,
      {
        "Content-Type": params.mimetype,
      },
    );

    return `${this.publicEndpoint}/${this.bucketName}/${objectName}`;
  }
}
