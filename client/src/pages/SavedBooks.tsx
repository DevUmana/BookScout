import { useQuery, useMutation } from "@apollo/client";
import { Container, Card, Button, Row, Col } from "react-bootstrap";

import { GET_ME } from "../utils/queries";
import { REMOVE_BOOK } from "../utils/mutations";
import Auth from "../utils/auth";
import { removeBookId } from "../utils/localStorage";
import type { Book } from "../models/Book";

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const userData = data?.me || { SavedBooks: [] };

  const [deleteBook] = useMutation(REMOVE_BOOK, {
    update(cache, { data: { deleteBook } }) {
      if (deleteBook) {
        cache.modify({
          fields: {
            me(existingMeData = {}) {
              return {
                ...existingMeData,
                savedBooks: existingMeData.savedBooks.filter(
                  (book: Book) => book.bookId !== deleteBook.bookId
                ),
              };
            },
          },
        });
        removeBookId(deleteBook.bookId);
      }
    },
  });

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;
    if (!token) {
      return false;
    }

    try {
      const { data } = await deleteBook({
        variables: { bookId },
      });

      if (data && data.removeBook) {
        console.log("Book deleted successfully!");
        removeBookId(bookId);
      }
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  if (loading) {
    return <h2>LOADING...</h2>;
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? "book" : "books"
              }:`
            : "You have no saved books!"}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => {
            return (
              <Col md="4" key={book.bookId}>
                <Card border="dark">
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant="top"
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className="small">Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className="btn-block btn-danger"
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
