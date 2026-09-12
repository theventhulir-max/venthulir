import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'venthulir_jwt_secret_key_2026';

export function signToken(payload, expiresIn = '7d') {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(reqOrHeader) {
  try {
    let token = null;
    if (typeof reqOrHeader === 'string') {
      token = reqOrHeader.replace('Bearer ', '');
    } else if (reqOrHeader && reqOrHeader.headers) {
      const authHeader = reqOrHeader.headers.get?.('authorization') || reqOrHeader.headers['authorization'];
      if (authHeader) {
        token = authHeader.replace('Bearer ', '');
      } else {
        token = reqOrHeader.headers.get?.('x-auth-token') || reqOrHeader.headers['x-auth-token'];
      }
    }

    if (!token) return null;
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function requireAuth(req) {
  const user = verifyToken(req);
  if (!user) {
    return { error: 'Authentication required. Invalid or expired token.', status: 401, user: null };
  }
  return { error: null, user };
}

export function requireAdmin(req) {
  const authRes = requireAuth(req);
  if (authRes.error) return authRes;
  if (!authRes.user?.isAdmin) {
    return { error: 'Access denied. Administrator privileges required.', status: 403, user: authRes.user };
  }
  return { error: null, user: authRes.user };
}
