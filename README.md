# dpdzero-challenge
dpdzero hiring challenge to create REST APIs 

## Technologies
- [Node.js](https://nodejs.org/en) - An open-source, cross-platform JavaScript runtime environment.
- [Express.js](https://expressjs.com/) - Fast, unopinionated, minimalist web framework for Node.js
- MySQL - [Railway](https://railway.app/)
- [Prisma](https://www.prisma.io/) - ORM for Node.js
- [Docker](https://www.docker.com/get-started/) - Develop faster. Run anywhere.

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

#### How to setup using Docker

- Install Docker on your machine [Guide](https://docs.docker.com/desktop/)
- Start the docker container
```sh
docker-compose up
```
These two containers will start running <br />
<img src="https://github.com/Jaay7/dpdzero-challenge/assets/73716175/66df57b2-297e-421d-b62e-8caec3a597a7" alt="dock1" width=500 />

- Now we have to modify a few things

1. Open the ```prisma-mysql-api``` container and go to the terminal
2. Run the Prisma Migrate command
```sh
npx prisma migrate dev --name init
```
<img src="https://github.com/Jaay7/dpdzero-challenge/assets/73716175/7ccb0245-1a60-4dbf-ae8a-26aedb67bef5" alt="dock2" width=350 />


3. Restart the container
  
<img src="https://github.com/Jaay7/dpdzero-challenge/assets/73716175/e4f15c69-1e9d-4df7-8970-f22036a3efd9" alt="dock3" width=200 />
