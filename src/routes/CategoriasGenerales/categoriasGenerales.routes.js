import { Router } from "express";
const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";

//SELECT
router.get("/", async (req, res) => {
  const db = await connect();
  const result = await db.collection("catGenerales").find({}).toArray();
  res.json(result[0].data);
});

//INSERT TEST
// router.post("/", async (req, res) =>{
//   const db = await connect();
//   const data = req.body
//   const result = await db.collection('catGenerales').insertOne({data});

//   res.json(result)
// })

export default router;
