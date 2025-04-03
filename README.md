## Project Title:  
ReviewHub – a simple book catalog and review platform  

## Team Members
- Rita-Maria Oladokun - N01638768

## Dataset Chosen:  
This project will use a custom dataset that includes:  
- Users (for authentication and profile/dashboard management) 
```json
{
  "userId": "u12345",
  "name": "John Doe",
  "email": "johndoe@example.com",
  "passwordHash": "hashedpassword",
  "createdAt": "2024-04-03T12:00:00Z",
  "updatedAt": "2024-04-03T12:00:00Z"
}

``` 
- Books (with details like title, author, genre, and ratings) 
```json
{
  "bookId": "b001",
  "user": "User",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic",
  "rating": 4.2,
  "createdAt": "2024-04-01T10:00:00Z",
  "updatedAt": "2024-04-03T12:00:00Z"
}
``` 
- Reviews (for feedback on books)  
```json
{
  "reviewId": "r001",
  "userId": "u12345",
  "bookId": "b001",
  "rating": 5,
  "comment": "A masterpiece!",
  "createdAt": "2024-04-02T18:00:00Z",
  "updatedAt": "2024-04-03T12:00:00Z"
}

```

## Features & Task Distribution:  

### User Authentication & Profiles  
 - Users can sign up, log in, and log out securely.  
 - Users have a profile/dashboard with their name, email, and saved books and ratings they've written.  
- Task Assigned To: Rita  

### Book Catalog (CRUD Operations & Filtering)  
- Admins can add, update, and delete books from the catalog.  
- Users can add books to their "Reading List."
- Users can search for books by author and title.  
- Task Assigned To: Rita 

### Reviews & Ratings System  
- Users can create, edit, and delete book reviews.  
- Books display an average rating based on reviews.  
- Task Assigned To: Rita  

### Github repository
- [repo link](https://github.com/Riri202/ReviewHub.git)
 
