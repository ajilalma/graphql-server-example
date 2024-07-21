import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { addBook, getAuthor, getAuthorByName, getBooks, getBooksOfAuthor } from "./dal/data-manager.js";

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
        addBook: (parent, args, context, info) => addBook(args.book.title, args.book.authorName)
    }
};

// Define a useful context for your server
interface AppContext {
    token: String
}

// Create appollo server instance
const server = new ApolloServer<AppContext>({
    typeDefs,
    resolvers
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
    context: async ({ req }) => ({ token: req.headers.token as String }),
    listen: { port: 8080}
});
console.log(`Server running at ${url}`)
