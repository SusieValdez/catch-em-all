import {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
  NextPage,
} from "next";
import { createProxySSGHelpers } from "@trpc/react-query/ssg";
import superjson from "superjson";
import { appRouter } from "y/server/api/root";
import { createInnerTRPCContext } from "y/server/api/trpc";
import { api } from "y/utils/api";

export const getServerSideProps = async (
  context: GetServerSidePropsContext<{ username: string }>
) => {
  const ssg = createProxySSGHelpers({
    router: appRouter,
    ctx: await createInnerTRPCContext({ session: null }),
    transformer: superjson,
  });

  const username = context.params?.username as string;
  await ssg.users.getByUsername.prefetch({ username });
  return { props: { trpcState: ssg.dehydrate(), username } };
};

const ProfilePage: NextPage<
  InferGetServerSidePropsType<typeof getServerSideProps>
> = ({ username }) => {
  const getUser = api.users.getByUsername.useQuery({ username });
  const user = getUser.data;
  if (!user) {
    return <div>Loading</div>;
  }
  return <div>Im your mom, {user.name}</div>;
};

export default ProfilePage;
