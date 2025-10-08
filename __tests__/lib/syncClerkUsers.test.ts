import { syncClerkUsers } from '../../lib/syncClerkUsers';
import { clerkClient } from '../../lib/clerkClient';
import { prisma } from '../../app/lib/prisma';

// Mock both clerkClient and prisma
jest.mock('../../lib/clerkClient', () => ({
  clerkClient: {
    users: {
      getUserList: jest.fn(),
    },
  },
}));

jest.mock('../../app/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

describe('syncClerkUsers', () => {
  const mockClerkUsers = [
    {
      id: 'clerk-user-1',
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      imageUrl: 'https://example.com/avatar.jpg',
      emailAddresses: [{ emailAddress: 'john@example.com' }],
      publicMetadata: {
        role: 'user',
        position: 'lower',
        departmentId: 'dept-1',
      },
    },
    {
      id: 'clerk-user-2',
      firstName: 'Jane',
      lastName: 'Smith',
      username: 'janesmith',
      imageUrl: 'https://example.com/avatar2.jpg',
      emailAddresses: [{ emailAddress: 'jane@example.com' }],
      publicMetadata: {
        role: 'admin',
        position: 'higher',
        departmentId: 'dept-2',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync users from Clerk to database', async () => {
    // Mock clerk API response
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: mockClerkUsers,
      totalCount: 2,
    });

    // Mock user lookup - no users exist yet
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce(null) // First user doesn't exist
      .mockResolvedValueOnce(null); // Second user doesn't exist

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const result = await syncClerkUsers();

    expect(clerkClient.users.getUserList).toHaveBeenCalledWith({
      limit: 500,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.create).toHaveBeenCalledTimes(2);

    // Check that we're creating users with the correct data
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-user-1',
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        imageUrl: 'https://example.com/avatar.jpg',
        email: 'john@example.com',
        role: 'user',
        position: 'lower',
        departmentId: 'dept-1',
      },
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        imageUrl: 'https://example.com/avatar2.jpg',
        email: 'jane@example.com',
        role: 'admin',
        position: 'higher',
        departmentId: 'dept-2',
      },
    });

    expect(result).toEqual({ created: 2, total: 2 });
  });

  it('should only create users that do not exist in the database', async () => {
    // Mock clerk API response
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: mockClerkUsers,
      totalCount: 2,
    });

    // Mock user lookup - first user exists, second doesn't
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'db-user-1', clerkId: 'clerk-user-1' }) // Exists
      .mockResolvedValueOnce(null); // Doesn't exist

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const result = await syncClerkUsers();

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(2);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);

    // Only the second user should have been created
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-user-2',
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        imageUrl: 'https://example.com/avatar2.jpg',
        email: 'jane@example.com',
        role: 'admin',
        position: 'higher',
        departmentId: 'dept-2',
      },
    });

    expect(result).toEqual({ created: 1, total: 2 });
  });

  it('should handle users with missing optional fields', async () => {
    const mockClerkUserWithMissingFields = {
      id: 'clerk-user-3',
      firstName: null,
      lastName: undefined,
      username: null,
      imageUrl: null,
      emailAddresses: [],
      publicMetadata: {},
    };

    // Mock clerk API response with user having missing fields
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: [mockClerkUserWithMissingFields],
      totalCount: 1,
    });

    // Mock user lookup - user doesn't exist
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    await syncClerkUsers();

    // Check that undefined values are properly handled for optional fields
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        clerkId: 'clerk-user-3',
        firstName: undefined,
        lastName: undefined,
        username: undefined,
        imageUrl: undefined,
        email: undefined,
        role: 'user', // Default value since not provided in metadata
        position: 'lower', // Default value since not provided in metadata
        departmentId: undefined,
      },
    });
  });

  it('should throw error when clerk API fails', async () => {
    const mockError = new Error('Failed to fetch users from Clerk');

    (clerkClient.users.getUserList as jest.Mock).mockRejectedValue(mockError);

    await expect(syncClerkUsers()).rejects.toThrow('Failed to synchronize users');
  });

  it('should handle empty user list from Clerk', async () => {
    // Mock clerk API response with no users
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    const result = await syncClerkUsers();

    expect(result).toEqual({ created: 0, total: 0 });
  });
});