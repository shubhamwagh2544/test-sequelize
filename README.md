# Sequelize ORM Implementation

This is a simple implementation of Sequelize ORM in Node.js. It uses PostgreSQL as the database.

## Installation

1. Clone the repository
2. Run `npm install` to install the dependencies
3. Create a `.env` file in the root directory and add the following:

```
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_DIALECT=your_db_dialect
```

4. Run `npm start` to start the server
5. The server will be running on `http://localhost:3000`
6. You can now test the API using Postman or any other API testing tool

## API Endpoints

Here are all the API endpoints defined in your `src/index.js` file:

1. **POST** `/api/users` - Create a user
2. **GET** `/api/users` - Get all users
3. **GET** `/api/users/:id` - Get a user by ID
4. **PUT** `/api/users/:id` - Update a user by ID
5. **DELETE** `/api/users/:id` - Delete a user by ID
6. **POST** `/api/roles` - Create a role
7. **GET** `/api/roles` - Get all roles
8. **GET** `/api/roles/:id` - Get a role by ID
9. **PUT** `/api/roles/:id` - Update a role by ID
10. **DELETE** `/api/roles/:id` - Delete a role by ID
11. **POST** `/api/posts` - Create a post
12. **GET** `/api/posts` - Get all posts
13. **GET** `/api/posts/:id` - Get a post by ID
14. **PUT** `/api/posts/:id` - Update a post by ID
15. **DELETE** `/api/posts/:id` - Delete a post by ID
16. **GET** `/api/users/:id/posts` - Get all posts by a user
17. **GET** `/api/posts/:id/user` - Get the user of a post
18. **GET** `/api/users/:id/profile` - Get the profile of a user
19. **GET** `/api/profiles/:id/user` - Get the user of a profile
20. **POST** `/api/users/:id/profile/upload` - Upload profile picture for a user
21. **GET** `/api/users/:id/profile/download` - Download user profile
22. **POST** `/api/user/:userId/role/:roleId/assign` - Assign role to a user


