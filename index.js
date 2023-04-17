import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import asyncHandler from "express-async-handler";

const app = express();

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const PORT = 6969;

//DataBase Connection
const DataBaseURL = `mongodb://127.0.0.1:27017/cruddb`;
async function connectMongo() {
  try {
    const dbConnect = await mongoose.connect(DataBaseURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    if (dbConnect) console.log("DataBase is Connected to localhost");
  } catch (error) {
    console.log(error);
  }
}

//Schema for User
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

/**
 * Route :: `/createUser`
 * Control :: Create User Object with unique Email Field
 * Method :: POST
 */
app.post(
  "/createUser",
  asyncHandler(async (req, res) => {
    if (!req.body) {
      res.status(400).json({ status: false, msg: "Invalid Query is passed" });
      throw new Error("Invalid Query is passed");
    }

    const userExists = await User.findOne({ email: req.body.email });

    if (userExists) {
      res
        .status(400)
        .json({ status: false, msg: "Already User exists on email" });
      throw new Error("Already User exists on email");
    }

    const user = User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });

    if (user) {
      res
        .status(201)
        .json({ status: true, msg: "User is created successfully"});
    } else {
      res.status(400).json({ status: false, msg: "Server Overloaded" });
      throw new Error("Server Overloaded");
    }
  })
);

/**
 * Route :: `/getUser/:id`
 * Control :: Retrive User Object using id key
 * Method :: GET
 */
app.get(
  "/getUser/:id",
  asyncHandler(async (req, res) => {
    let id = req.params.id;

    if (id) {
      const user = await User.findById(id);

      if (user) {
        res
          .status(200)
          .json({ status: true, msg: `User retrived using id :: ${id}`, user });
      } else {
        res
          .status(400)
          .json({ status: false, msg: "User not found in database" });
        throw new Error("User not found on ID");
      }
    } else {
      res.status(400).json({ status: false, msg: "Invalid ID is passed" });
      throw new Error("Invalid ID is passed");
    }
  })
);

/**
 * Route :: `/updateUser/:id`
 * Control :: Update User Object using id key
 * Method :: POST
 */

app.post(
  "/update/:id",
  asyncHandler(async (req, res) => {
    let id = req.params.id;
    const { name, email, password } = req.body;
    if (id) {
      const user = await User.findByIdAndUpdate(
        id,
        { name, email, password },
        { new: true }
      );

      if (user) {
        res
          .status(200)
          .json({ status: true, msg: `User Updated using id :: ${id}`, user });
      } else {
        res.status(400).json({ status: false, msg: "Invalid Updatation" });
        throw new Error("Invalid Updatation");
      }
    } else {
      res.status(400).json({ status: false, msg: "Invalid ID is passed" });
      throw new Error("Invalid ID is passed");
    }
  })
);


/**
 * Route :: `/deleteUser/:id`
 * Control :: Delete User Object using id key
 * Method :: POST
 */

app.get(
  "/deleteUser/:id",
  asyncHandler(async (req, res) => {
    let id = req.params.id;

    if (id) {
      const user = await User.findByIdAndRemove(id);
      if (user) {
        res
          .status(200)
          .json({ status: true, msg: `User Deleted using id :: ${id}`, user });
      } else {
        res
          .status(400)
          .json({ status: false, msg: "Invalid Delete Operation" });
        throw new Error("Invalid Delete Operation");
      }
    } else {
      res.status(400).json({ status: false, msg: "Invalid ID is passed" });
      throw new Error("Invalid ID is passed");
    }
  })
);

app.listen(PORT, () => {
  connectMongo();
  console.log(`Server is running on url http://localhost:${PORT}`);
});
