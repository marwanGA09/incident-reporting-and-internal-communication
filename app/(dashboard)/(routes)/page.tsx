// import { auth, currentUser } from '@clerk/nextjs/server';
import HomePage from "./_components/Homepage";
export default async function Home() {
  // const someThing = await auth();
  // console.log({ someThing });
  // const curUser = await currentUser();
  // console.log({ curUser });
  return (
    <div>
      <div><HomePage /></div>
    </div>
  );
}
