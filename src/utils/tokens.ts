import jwt from '@tsndr/cloudflare-worker-jwt';

export const NOT_SO_SECRET_MOCK_PRIVATE_KEY :JsonWebKeyWithKid = {
  "kid": "mock-key",
  "crv": "P-256",
  "d": "fRNO9OWTyUp5kDB_Ij9cK7Oo6Rq1uRdylDCi8BRzRWY",
  "ext": true,
  "key_ops": [
    "sign"
  ],
  "kty": "EC",
  "x": "rKYjIw25sMyTlTYW0YxeLoHeOobv150JjqxIfXENgvM",
  "y": "1UhFJRo8A4SNdoaQclL1OQJz3gLxbV7d99paYk7s4Sg"
}

export async function createJwt(payload :any): Promise<any> {
    return await jwt.sign(payload, NOT_SO_SECRET_MOCK_PRIVATE_KEY, {algorithm: "ES256", header:{"kid": NOT_SO_SECRET_MOCK_PRIVATE_KEY.kid}});
}

export async function verifyJwt(token :string): Promise<any> {
    return jwt.verify(token, NOT_SO_SECRET_MOCK_PRIVATE_KEY);
}