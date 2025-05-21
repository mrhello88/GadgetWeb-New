import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  token: string;
  iat?: number;
  exp?: number;
}

interface ExistTokenData {
  name: string;
  email: string;
  isAdmin: boolean;
  jwtToken: string;
}

interface TokenResult {
  message: string;
  success: boolean;
  data?: ExistTokenData; // Include user data if token is valid
}

export const getUserFromToken = async (authHeader: string | undefined): Promise<TokenResult> => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      message: 'Unauthorized: Token not provided or malformed',
      success: false,
    };
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    return {
      message: 'Authorized',
      success: true,
      data: {
        name: decoded.name,
        email: decoded.email,
        isAdmin: decoded.isAdmin,
        jwtToken: token
      }
    };
  } catch (error) {
    return {
      message: 'Unauthorized: Token is invalid or expired',
      success: false,
    };
  }
};
