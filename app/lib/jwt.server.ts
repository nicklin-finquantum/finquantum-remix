import crypto from 'crypto';

import jwt, { type SignOptions } from 'jsonwebtoken';

const secretKey = process.env.JWT_SECRET_KEY as string;

const encode = (
  payload: string | object | Buffer,
  options: SignOptions = {},
): string => {
  if (Object.keys(options).length) {
    return jwt.sign(payload, secretKey, options);
  }
  return jwt.sign(payload, secretKey);
};

const decode = (token: string): any => {
  if (!token) {
    return {};
  }
  return jwt.verify(token, secretKey);
};

const createSalt = (): string => crypto.randomBytes(128).toString('hex');

const hash = (input: string, salt: string): string => {
  const hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
  return [salt, hashed.toString('hex')].join('$');
};

const JWT = {
  encode,
  decode,
  hash,
  createSalt,
};

export default JWT;
