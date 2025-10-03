// import { auth, currentUser } from '@clerk/nextjs/server';

export default async function Home() {
  // const someThing = await auth();
  // console.log({ someThing });
  // const curUser = await currentUser();
  // console.log({ curUser });
  return (
    <div className="w-full flex justify-center items-center h-full">
      <div>Root page</div>
    </div>
  );
}
