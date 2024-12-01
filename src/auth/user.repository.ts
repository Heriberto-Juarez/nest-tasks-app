import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { DataSource, Repository } from 'typeorm';
import { User } from './user.entity';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PasswordService } from 'src/services/PasswordService';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly pwdService: PasswordService,
  ) {
    super(User, dataSource.createEntityManager());
  }

  async createUser(authCredentials: AuthCredentialsDto): Promise<void> {
    const user = this.create(authCredentials);
    user.password = await this.pwdService.encrypt(user.password);

    try {
      await this.save(user);
    } catch (error) {
      if (error.code === '23505') {
        // duplicate
        throw new ConflictException(`Username already exists`);
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}
