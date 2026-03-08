import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(email: string): Promise<{ access_token: string }> {
    const payload = { email };
    const access_token = await this.jwtService.signAsync(payload);

    return { access_token };
  }
}
