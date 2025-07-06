declare module 'jsonwebtoken' {
  export interface JwtPayload {
    id: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
  }

  export function sign(
    payload: string | Buffer | object,
    secretOrPrivateKey: string,
    options?: SignOptions
  ): string;

  export function verify(
    token: string,
    secretOrPublicKey: string,
    options?: VerifyOptions & { complete?: false }
  ): JwtPayload;

  export function decode(
    token: string,
    options?: DecodeOptions & { complete: true }
  ): null | { [key: string]: any } | string;

  export function decode(
    token: string,
    options?: DecodeOptions & { json: true }
  ): null | { [key: string]: any };

  export function decode(
    token: string,
    options?: DecodeOptions
  ): null | { [key: string]: any } | string;

  export interface SignOptions {
    algorithm?: string;
    expiresIn?: string | number;
    notBefore?: string | number;
    audience?: string | string[];
    issuer?: string;
    jwtid?: string;
    subject?: string;
    noTimestamp?: boolean;
    header?: object;
    keyid?: string;
    mutatePayload?: boolean;
  }

  export interface VerifyOptions {
    algorithms?: string[];
    audience?: string | RegExp | Array<string | RegExp>;
    complete?: boolean;
    issuer?: string | string[];
    ignoreExpiration?: boolean;
    ignoreNotBefore?: boolean;
    jwtFromRequest?: Function;
    jsonWebTokenOptions?: VerifyOptions;
    secretOrKey?: string | Buffer;
    secretOrKeyProvider?: (
      request: any,
      rawJwtToken: string,
      done: Function
    ) => void;
  }

  export interface DecodeOptions {
    complete?: boolean;
    json?: boolean;
  }
}
