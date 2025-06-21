'use server';

import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

type MetadataInput = {
  role: 'admin' | 'regular';
  position: 'higher' | 'middle' | 'lower';
  departmentId: string;
};

export async function setUserMetadata({
  role,
  position,
  departmentId,
}: MetadataInput) {
  const { userId } = await auth();
  if (!userId) throw new Error('Not authenticated');
  try {
    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role, position, departmentId },
    });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    throw new Error('Failed to update user metadata');
  }
}
