export const getSavedBookIds = () => {
  const savedBookIds = localStorage.getItem("saved_books")
    ? JSON.parse(localStorage.getItem("saved_books")!)
    : [];

  return savedBookIds;
};

export const saveBookIds = (bookIdArr: string[]) => {
  if (bookIdArr.length) {
    localStorage.setItem("saved_books", JSON.stringify(bookIdArr));
  } else {
    localStorage.removeItem("saved_books");
  }
};

export const removeBookId = (bookId: string) => {
  console.log("Removing book ID:", bookId);

  const savedBookIds = JSON.parse(localStorage.getItem("saved_books") || "[]");

  // Filter out the book to be removed
  const updatedSavedBookIds = savedBookIds.filter(
    (savedBookId: string) => savedBookId !== bookId
  );

  if (updatedSavedBookIds.length) {
    localStorage.setItem("saved_books", JSON.stringify(updatedSavedBookIds));
  } else {
    localStorage.removeItem("saved_books");
  }

  return true;
};
