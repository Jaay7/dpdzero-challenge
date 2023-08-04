import express from 'express'
import bodyParser from 'body-parser';
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const prisma = new PrismaClient()
const app = express()

app.use(bodyParser.json());
app.use(cors());

app.post("/api/register_user", async (req, res) => {
  const { username, email, password, full_name, age, gender } = req.body

  if (!username || !email || !password || !full_name) {
    res.status(400)
    res.json({
      status: "error",
      code: "INVALID_REQUEST",
      message: "Invalid request. Please provide all required fields: username, email, password, full_name."
    })
  } else {
    const userExists = await prisma.user.findFirst({
      where: {
        username: username
      }
    })

    const emailExists = await prisma.user.findFirst({
      where: {
        email: email
      }
    })

    if (userExists) {
      res.status(400)
      res.json({
        status: "error",
        code: "USERNAME_EXISTS",
        message: "The provided username is already taken. Please choose a different username."
      })
    } else if (emailExists) {
      res.status(400)
      res.json({
        status: "error",
        code: "EMAIL_EXISTS",
        message: "The provided email is already taken. Please use a different email address."
      })
    } else if (password.length < 8 || !password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/)) {
      res.status(400)
      res.json({
        status: "error",
        code: "INVALID_PASSWORD",
        message: "The provided password does not meet the requirements. Password must be at least 8 characters long and contain a mix of uppercase and lowercase letters, numbers, and special characters."
      })
    } else if (age < 0 || !Number.isInteger(age)) {
      res.status(400)
      res.json({
        status: "error",
        code: "INVALID_AGE",
        message: "Invalid age value. Age must be a positive integer."
      })
    } else if (!gender) {
      res.status(400)
      res.json({
        status: "error",
        code: "GENDER_REQUIRED",
        message: "Gender field is required. Please specify the gender (e.g., male, female, non-binary)."
      })
    } else {

      try {
        const user = await prisma.user.create({
          data: {
            username,
            email,
            password,
            full_name,
            age,
            gender
          },
        })
        res.status(201)
        res.json({
          status: "success",
          message: "User successfully registered!",
          data: {
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "age": user.age,
            "gender": user.gender
          }
        })
      } catch (error) {
        res.status(500)
        res.json({
          status: "error",
          code: "INTERNAL_SERVER_ERROR",
          message: "An internal server error occurred. Please try again later."
        })
      }
    }
  }
})

app.post("/api/token", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400)
    res.json({
      status: "error",
      code: "MISSING_FIELDS",
      message: "Missing fields. Please provide both username and password."
    })
  } else {
    try {
      const user = await prisma.user.findFirst({
        where: {
          AND: [
            {
              username: username
            },
            {
              password: password
            }
          ]
        }
      })

      if (!user) {
        res.status(400).json({
          status: "error",
          code: "INVALID_CREDENTIALS",
          message: "Invalid credentials. The provided username or password is incorrect."
        })
      } else {
        // generate token
        const token = await jwt.sign({ username, email: user.email, full_name: user.full_name, id: user.id }, process.env.APP_SECRET, {
          expiresIn: "1d"
        });

        res.status(200).json({
          status: "success",
          message: "Access token generated successfully.",
          data: {
            "access_token": token,
            "expires_in": "1d"
          }
        })
      }
    } catch (error) {
      res.status(500).json({
        status: "error",
        code: "INTERNAL_ERROR",
        message: "Internal server error occurred. Please try again later."
      })
    }
  }
})

app.post("/api/data", async (req, res) => {
  const { key, value } = req.body;
  const token = req.headers.authorization.split(" ")[1];

  const user = await jwt.verify(token, process.env.APP_SECRET);

  if (!token || !user) {
    res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided"
    })
  } else {
    if (!key || !key.trim()) {
      res.status(400).json({
        status: "error",
        code: "INVALID_KEY",
        message: "The provided key is not valid or missing."
      })
    } else if (!value || !value.trim()) {
      res.status(400).json({
        status: "error",
        code: "INVALID_VALUE",
        message: "The provided value is not valid or missing."
      })
    } else {
      try {
        const isKeyExists = await prisma.keyData.findFirst({
          where: {
            key: key
          }
        })

        if (isKeyExists) {
          res.status(400).json({
            status: "error",
            code: "KEY_EXISTS",
            message: "The provided key already exists. Please use a different key."
          })
        } else {
          const storingData = await prisma.keyData.create({
            data: {
              key,
              value
            }
          })

          res.status(201).json({
            status: "success",
            message: "Data successfully stored!",
          })
        }
      } catch (error) {
        res.status(500).json({
          status: "error",
          code: "INTERNAL_ERROR",
          message: "Internal server error occurred. Please try again later."
        })
      }
    }
  }
})

app.get("/api/data/:key", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const user = await jwt.verify(token, process.env.APP_SECRET);

    const data = await prisma.keyData.findFirst({
      where: {
        key: req.params.key
      }
    })

    if (!data) {
      res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in database."
      })
    } else {
      res.status(200).json({
        status: "success",
        data: {
          "key": data.key,
          "value": data.value
        }
      })
    }
  } catch (error) {
    res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided"
    })
  }
})

app.put("/api/data/:key", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const user = await jwt.verify(token, process.env.APP_SECRET);

    const data = await prisma.keyData.findFirst({
      where: {
        key: req.params.key
      }
    })

    if (!data) {
      res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in database."
      })
    } else {
      const updatedData = await prisma.keyData.update({
        where: {
          key: req.params.key
        },
        data: {
          value: req.body.value
        }
      })

      res.status(200).json({
        status: "success",
        message: "Data updated successfully.",
      })
    }
  } catch (error) {
    res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided"
    })
  }
})

app.delete("/api/data/:key", async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];

  try {
    const user = await jwt.verify(token, process.env.APP_SECRET);

    const data = await prisma.keyData.findFirst({
      where: {
        key: req.params.key
      }
    })

    if (!data) {
      res.status(404).json({
        status: "error",
        code: "KEY_NOT_FOUND",
        message: "The provided key does not exist in database."
      })
    } else {
      const deletedData = await prisma.keyData.delete({
        where: {
          key: req.params.key
        }
      })

      res.status(200).json({
        status: "success",
        message: "Data deleted successfully.",
      })
    }
  } catch (error) {
    res.status(401).json({
      status: "error",
      code: "INVALID_TOKEN",
      message: "Invalid access token provided"
    })
  }
})

app.listen(3300, () =>
  console.log("Server ready at: http://localhost:3300")
)
