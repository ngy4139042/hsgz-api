import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import Post from "./models/Post.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

function asyncHandler(handler) {
  return async function (req, res) {
    try {
      await handler(req, res);
    } catch (e) {
      console.log(e.name);
      console.log(e.message);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };
}

app.get("/posts", async (req, res) => {
  const sort = req.query.sort;
  const count = Number(req.query.count) || 0;

  const sortOption = {
    createdAt: sort === "oldest" ? "asc" : "desc",
  };

  const posts = await Post.find().sort(sortOption).limit(count);

  res.send(posts);
});

app.get(
  "/posts/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);

    if (post) {
      res.send(post);
    } else {
      res.status(404).send({ message: "Cannot find given id. " });
    }
  })
);

app.post(
  "/posts",
  asyncHandler(async (req, res) => {
    const newPost = await Post.create(req.body);
    res.status(201).send(newPost);
  })
);

app.patch(
  "/posts/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const post = await Post.findById(id);

    if (post) {
      Object.keys(req.body).forEach((key) => {
        post[key] = req.body[key];
      });
      await post.save();
      res.send(post);
      post.updatedAt = new Date();
    } else {
      res.status(404).send({ message: "Cannot find given id. " });
    }
  })
);

app.delete(
  "/posts/:id",
  asyncHandler(async (req, res) => {
    const id = req.params.id;
    const post = await Post.findByIdAndDelete(id);

    if (post) {
      res.sendStatus(204);
    } else {
      res.status(404).send({ message: "Cannot find given id." });
    }
  })
);

app.listen(process.env.PORT || 3000, () => {
  console.log("Surver Started");
});
mongoose.connect(process.env.DATABASE_URL).then(() => {
  console.log("Connected to DB");
});
