import {
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { JwtGuard } from "src/auth/guards/jwt.guard";
import { FileElementResponse } from "./dto/file-element.response";
import { FilesService } from "./files.service";

@UseGuards(JwtGuard)
@Controller("files")
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post("upload-public")
  @HttpCode(200)
  @UseInterceptors(FileInterceptor("file"))
  async uploadFilesPublic(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<FileElementResponse[]> {
    return this.filesService.saveFilesPublic([file]);
  }
}
