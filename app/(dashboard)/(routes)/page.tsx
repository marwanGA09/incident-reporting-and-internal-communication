// import { auth, currentUser } from '@clerk/nextjs/server';
import HomePage from "./_components/Homepage";
export default async function Home() {
  // const someThing = await auth();

  // const curUser = await currentUser();

  return <HomePage />;
}
