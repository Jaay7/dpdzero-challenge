# dpdzero-challenge
dpdzero hiring challenge to create REST APIs 

## Technologies
- [Node.js](https://nodejs.org/en) - An open-source, cross-platform JavaScript runtime environment.
- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- MySQL - [Railway](https://railway.app/)
- [Prisma](https://www.prisma.io/) - ORM for Node.js

## Instructions

#### How to setup

- Clone the repository
  
```sh
https://github.com/Jaay7/dpdzero-challenge.git
```

- Installing necessary packages
```sh
npm install
```

- Create a new MySQL project on [Railway](https://railway.app/)

- Create ```.env``` file with the following variables
```
DATABASE_URL="<DATABASE_URL>" # Paste the MySQL URL from the Railway project.
APP_SECRET="<APP_SECRET>"
```

- Now use the Prisma Migrate command to create the tables
```sh
npx prisma migrate dev --name init
```

#### How to run

- Run command
```sh
npm run dev
```

