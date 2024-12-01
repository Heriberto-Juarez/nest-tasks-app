import { PasswordService } from 'src/services/PasswordService';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './dto/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
    return await this.userRepository.createUser(authCredentialsDto);
  }

  async generateToken(username: string) {
    const payload: JwtPayload = { username };
    const token = await this.jwtService.sign(payload);
    return token;
  }

  async signIn(
    authCredentialsDto: AuthCredentialsDto,
  ): Promise<{ accessToken: string }> {
    const { username, password } = authCredentialsDto;

    const user = await this.userRepository.findOne({
      where: { username: username },
    });

    if (
      user &&
      (await this.passwordService.isPassword(password, user.password))
    ) {
      const accessToken = await this.generateToken(username);
      return {
        accessToken,
      };
    } else {
      throw new UnauthorizedException(`Check your credentials`);
    }
  }
}
