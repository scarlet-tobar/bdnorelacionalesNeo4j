import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { Neo4jGraphQL } from "@neo4j/graphql";
import neo4j from "neo4j-driver";
import 'dotenv/config'

const typeDefs = `#graphql
    type Users {
    email: String!
    friend: [Users!]! @relationship(type: "FRIEND", direction: OUT)
    friendRequests: [Users!]! @relationship(type: "FRIEND_REQ", direction: OUT)
    }

    type Tags {
    name: String!
    }

    type Posts {
    idPrimary: String!
    likes: [Users!]! @relationship(type: "LIKES", direction: IN)
    dislikes: [Users!]! @relationship(type: "DISLIKES", direction: IN)
    tags: [Tags!]! @relationship(type: "TAGGED", direction: IN)
    }

    type Communities {
    name: String!
    members: [Users!]! @relationship(type: "MEMBER", direction: IN)
    tags: [Tags!]! @relationship(type: "TAGGED_COMMUNITY", direction: IN)
    }
    `;


const driver = neo4j.driver(
    process.env.LINK,
    neo4j.auth.basic("neo4j", process.env.PASS)
);

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

const server = new ApolloServer({
    schema: await neoSchema.getSchema(),
});

const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ req }),
    listen: { port: 5000 },
});

console.log(`🚀 Server ready at ${url}`);