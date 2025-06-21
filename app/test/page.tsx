import { checkRole } from '@/utils/roles';
import { redirect } from 'next/navigation';
import React from 'react';

async function page() {
  const isAdmin = await checkRole('admin');
  console.log({ isAdmin });
  if (!isAdmin) {
    redirect('/');
  }
  return <div>Test page</div>;
}

export default page;
