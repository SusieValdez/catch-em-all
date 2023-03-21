import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "y/server/api/trpc";
import { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const getUserByUsername = async (
  prisma: PrismaClient,
  username: string
) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ username }, { id: username }] },
  });
  if (user === null) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: `User not found with username: ${username}`,
    });
  }
  return user;
};

export const usersRouter = createTRPCRouter({
  getByUsername: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input, ctx }) => {
      return await getUserByUsername(ctx.prisma, input.username);
    }),
});
