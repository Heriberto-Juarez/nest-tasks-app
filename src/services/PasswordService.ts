import * as bcrypt from 'bcrypt';

export class PasswordService {
  async encrypt(password) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async isPassword(password: string, hash: string) {
    return await bcrypt.compare(password, hash);
  }
}
