import { ApolloServer, BaseContext} from "@apollo/server";
import Fastify from "fastify";
import fastifyApollo, { fastifyApolloDrainPlugin, ApolloFastifyContextFunction } from "@as-integrations/fastify";
import { addBook, getAuthor, getAuthorByName, getBooks, getBooksOfAuthor } from "./dal/data-manager.js";
import { GraphQLError } from "graphql";

// Schemas
const typeDefs = `#graphql
    """
    The Book definition
    """
    type Book {
        title: String!
        author: Author!
    }
    """
    The Author definition
    """
    type Author {
        name: String!
        books: [Book!]!
    }
    """
    Implementing BookInput type since it does not match the Book Schemas
    """
    input BookInput {
        title: String!
        authorName: String!
    }

    type Query {
        books: [Book]
        author(authorName: String!): Author
    }

    type Mutation {
        addBook(book: BookInput!): Book
    }
`;

// Define resolvers
const resolvers = {
    Query: {
        books: () => getBooks(),
        author: (parent, args, context, info) => getAuthorByName(args.authorName),
    },
    Book: {
        author: (parent, args, context, info) => getAuthor(parent.authorId)
    },
    Author: {
        books: (parent, args, context, info) => getBooksOfAuthor(parent.id),
    },

    Mutation: {
        addBook: (parent, args, context, info) => {
            if (context.token === "authorized") {
                return addBook(args.book.title, args.book.authorName)
            } else {
                throw new GraphQLError("UNAUTHORIZED");
            }
        }
    }
};

// Define a useful context for your server
interface AppContext extends BaseContext {
    token: String
}
const contextFunction: ApolloFastifyContextFunction<AppContext> = async (request, reply) => {
    return {
        token: request.headers.authorization
    }
}

const fastify = Fastify();
console.log("Initiating the server");
// Create appollo server instance
const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers,
    plugins: [fastifyApolloDrainPlugin(fastify)],
});

await server.start();
await fastify.register(fastifyApollo(server), {
    context: contextFunction
});
try {
    await fastify.listen({ port: 8080 })
    const address = fastify.server.address();
    console.log(`ADDRESS: ${JSON.stringify(address)}`);
} catch (err) {
    console.log(err)
    process.exit(1)
}
