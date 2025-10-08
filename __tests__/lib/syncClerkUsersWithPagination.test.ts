import { syncClerkUsersWithPagination } from '../../lib/syncClerkUsers';
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

describe('syncClerkUsersWithPagination', () => {
  const mockClerkUserBatch1 = [
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

  const mockClerkUserBatch2 = [
    {
      id: 'clerk-user-3',
      firstName: 'Bob',
      lastName: 'Johnson',
      username: 'bobjohnson',
      imageUrl: 'https://example.com/avatar3.jpg',
      emailAddresses: [{ emailAddress: 'bob@example.com' }],
      publicMetadata: {
        role: 'user',
        position: 'middle',
        departmentId: 'dept-3',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sync users with pagination when multiple batches are needed', async () => {
    // To test pagination, the first batch should return 500 users (the limit)
    // Then the second batch should return fewer than 500 to indicate the end
    const mockClerkUserBatch1 = Array(500).fill(null).map((_, i) => ({
      id: `clerk-user-${i + 1}`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      username: `user${i + 1}`,
      imageUrl: `https://example.com/avatar${i + 1}.jpg`,
      emailAddresses: [{ emailAddress: `user${i + 1}@example.com` }],
      publicMetadata: {
        role: 'user',
        position: 'lower',
        departmentId: 'dept-1',
      },
    }));

    const mockClerkUserBatch2 = [
      {
        id: 'clerk-user-501',
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        imageUrl: 'https://example.com/avatar3.jpg',
        emailAddresses: [{ emailAddress: 'bob@example.com' }],
        publicMetadata: {
          role: 'user',
          position: 'middle',
          departmentId: 'dept-3',
        },
      },
    ];

    // Mock first batch response with 500 users (equals limit, so continue)
    (clerkClient.users.getUserList as jest.Mock)
      .mockResolvedValueOnce({
        data: mockClerkUserBatch1,
        totalCount: 501,
      })
      .mockResolvedValueOnce({
        data: mockClerkUserBatch2,
        totalCount: 501,
      });

    // Mock user lookup - all users don't exist yet
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null); // Mock all to return null

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const result = await syncClerkUsersWithPagination();

    // Check that getUserList was called twice (for pagination)
    expect(clerkClient.users.getUserList).toHaveBeenCalledTimes(2);
    expect(clerkClient.users.getUserList).toHaveBeenNthCalledWith(1, {
      limit: 500,
      offset: 0,
    });
    expect(clerkClient.users.getUserList).toHaveBeenNthCalledWith(2, {
      limit: 500,
      offset: 500,
    });

    // Should check each user if it exists (500 from first batch + 1 from second batch = 501)
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(501);
    expect(prisma.user.create).toHaveBeenCalledTimes(501);

    expect(result).toEqual({ created: 501, total: 501 });
  });

  it('should only create users that do not exist in the database during pagination', async () => {
    // To test pagination, the first batch should return 500 users (the limit)
    const mockClerkUserBatch1 = Array(500).fill(null).map((_, i) => ({
      id: `clerk-user-${i + 1}`,
      firstName: `First${i + 1}`,
      lastName: `Last${i + 1}`,
      username: `user${i + 1}`,
      imageUrl: `https://example.com/avatar${i + 1}.jpg`,
      emailAddresses: [{ emailAddress: `user${i + 1}@example.com` }],
      publicMetadata: {
        role: 'user',
        position: 'lower',
        departmentId: 'dept-1',
      },
    }));

    const mockClerkUserBatch2 = [
      {
        id: 'clerk-user-501',
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        imageUrl: 'https://example.com/avatar3.jpg',
        emailAddresses: [{ emailAddress: 'bob@example.com' }],
        publicMetadata: {
          role: 'user',
          position: 'middle',
          departmentId: 'dept-3',
        },
      },
    ];

    // Mock first batch response with 500 users (equals limit, so continue)
    (clerkClient.users.getUserList as jest.Mock)
      .mockResolvedValueOnce({
        data: mockClerkUserBatch1,
        totalCount: 501,
      })
      .mockResolvedValueOnce({
        data: mockClerkUserBatch2,
        totalCount: 501,
      });

    // Mock user lookup - return existing user for first lookup, then null for all others
    (prisma.user.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'db-user-1', clerkId: 'clerk-user-1' }) // First user exists
      .mockResolvedValue(null); // All other users don't exist

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const result = await syncClerkUsersWithPagination();

    // Should check each user if it exists (500 from first batch + 1 from second batch = 501)
    expect(prisma.user.findUnique).toHaveBeenCalledTimes(501);
    // Should create 500 (first batch) - 1 (existing) + 1 (from second batch) = 500
    expect(prisma.user.create).toHaveBeenCalledTimes(500);

    expect(result).toEqual({ created: 500, total: 501 });
  });

  it('should stop pagination when batch size is less than limit', async () => {
    const mockClerkUserBatch = [
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
    ];

    // Mock response with only one user (less than limit), this should be the first call
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: mockClerkUserBatch,
      totalCount: 1,
    });

    // Mock user lookup - user doesn't exist
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    // Mock user creation
    (prisma.user.create as jest.Mock).mockResolvedValue({});

    const result = await syncClerkUsersWithPagination();

    // Should only call getUserList once since batch size < limit 
    expect(clerkClient.users.getUserList).toHaveBeenCalledTimes(1);
    expect(clerkClient.users.getUserList).toHaveBeenCalledWith({
      limit: 500,
      offset: 0,
    });

    expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.user.create).toHaveBeenCalledTimes(1);

    expect(result).toEqual({ created: 1, total: 1 });
  });

  it('should handle empty user list from Clerk', async () => {
    // Mock clerk API response with no users
    (clerkClient.users.getUserList as jest.Mock).mockResolvedValue({
      data: [],
      totalCount: 0,
    });

    const result = await syncClerkUsersWithPagination();

    expect(result).toEqual({ created: 0, total: 0 });
  });

  it('should throw error when clerk API fails', async () => {
    const mockError = new Error('Failed to fetch users from Clerk');

    (clerkClient.users.getUserList as jest.Mock).mockRejectedValue(mockError);

    await expect(syncClerkUsersWithPagination()).rejects.toThrow('Failed to synchronize users');
  });
});