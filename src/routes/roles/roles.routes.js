import { Router } from "express";
import { connect } from "../../database";

const router = Router();

//roles
router.get('/', async (req, res) => {
    const db = await connect();
    const result = await db.collection('roles').find().toArray();
    const roles = result.length > 0 ? result[0] : {};
    return res.json(roles);
});

export default router;