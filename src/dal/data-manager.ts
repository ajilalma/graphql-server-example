import { GraphQLError } from "graphql"

// Data types for the DB
export interface BookDTO {
    id: String
    title: String
    authorId: String
}

export interface AuthorDTO {
    id: String
    name: String
}

// data set
const books: BookDTO[] = [];
const authors: AuthorDTO[] = [];

let id = 0;

export function addBook(bookName: String, authorName: String): BookDTO {
    const filteredAuthors = authors.filter(a => a.name === authorName);
    let author: AuthorDTO;
    if (filteredAuthors.length > 0) {
        author = filteredAuthors[0];
    } else {
        author = {
            id: String(id++),
            name: authorName,
        }
        authors.push(author);
    }
    const book: BookDTO = {
        id: String(id++),
        title: bookName,
        authorId: author.id
    }
    books.push(book);
    return book;
}

export function getBooks(): BookDTO[] {
    return books;
}

export function getBooksOfAuthor(authorId: String): BookDTO[] {
    return books.filter(b => b.authorId === authorId)
}

export function getAuthor(id: String): AuthorDTO {
    const filteredAuthors = authors.filter(a => a.id === id);
    return filteredAuthors.length ? filteredAuthors[0] : undefined
}

export function getAuthorByName(name: String): AuthorDTO {
    const filteredAuthors = authors.filter(a => a.name === name);
    if (filteredAuthors.length) {
        return filteredAuthors[0];
    } else {
        throw new GraphQLError("Author not found", {
            extensions: { code: "AU-0001", message: "AUTHOR_NOT_FOUND" }
        })
    }
}