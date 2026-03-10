import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { typeDefs } from "@/graphql/schema/typeDefs";
import { resolvers } from "@/graphql/resolvers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest } from "next/server";

const server = new ApolloServer({ typeDefs, resolvers });
const handler = startServerAndCreateNextHandler<NextRequest>(server, {
  context: async (req) => {
    const session = await getServerSession(authOptions);
    return { user: session?.user ?? null, req };
  },
});

export { handler as GET, handler as POST };
