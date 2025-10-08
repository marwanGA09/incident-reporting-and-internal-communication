import { checkRole } from '../../utils/roles';
import { auth } from '@clerk/nextjs/server';

// Mock the clerk auth function
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

describe('checkRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return true when user has the required role', async () => {
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: {
          role: 'admin',
        },
      },
    });

    const result = await checkRole('admin');
    expect(result).toBe(true);
  });

  it('should return false when user does not have the required role', async () => {
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: {
          role: 'user',
        },
      },
    });

    const result = await checkRole('admin');
    expect(result).toBe(false);
  });

  it('should return false when user has no role metadata', async () => {
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: {},
      },
    });

    const result = await checkRole('admin');
    expect(result).toBe(false);
  });

  it('should return false when session claims are null', async () => {
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: null,
    });

    const result = await checkRole('admin');
    expect(result).toBe(false);
  });

  it('should return false when user has undefined metadata', async () => {
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: undefined,
      },
    });

    const result = await checkRole('admin');
    expect(result).toBe(false);
  });

  it('should work with both admin and user roles', async () => {
    // Test with admin role
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: {
          role: 'admin',
        },
      },
    });

    const isAdmin = await checkRole('admin');
    expect(isAdmin).toBe(true);

    const isUser = await checkRole('user');
    expect(isUser).toBe(false);

    // Test with user role
    (auth as jest.Mock).mockResolvedValue({
      sessionClaims: {
        metadata: {
          role: 'user',
        },
      },
    });

    const isUser2 = await checkRole('user');
    expect(isUser2).toBe(true);

    const isAdmin2 = await checkRole('admin');
    expect(isAdmin2).toBe(false);
  });
});