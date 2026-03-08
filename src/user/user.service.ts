import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { compare, genSalt, hash } from "bcryptjs";
import { Model } from "mongoose";
import { USER_CONSTANTS } from "./user.constants";
import { UserModel } from "./user.model";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserModel>,
  ) {}

  async findUser(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async createUser(email: string, password: string): Promise<UserModel> {
    const salt = await genSalt(10);
    const passwordHash = await hash(password, salt);
    const user = new this.userModel({ email, passwordHash });
    return user.save();
  }

  async validateUser(
    email: string,
    password: string,
  ): Promise<Pick<UserModel, "email">> {
    const user = await this.findUser(email);

    if (!user) {
      throw new UnauthorizedException(USER_CONSTANTS.USER_NOT_FOUND);
    }

    const isPasswordCorrect = await compare(password, user.passwordHash);

    if (!isPasswordCorrect) {
      throw new UnauthorizedException(USER_CONSTANTS.INVALID_PASSWORD);
    }

    return user;
  }
}
