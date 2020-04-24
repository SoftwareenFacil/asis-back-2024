import { Router } from "express";
const router = Router();

router.get('/', (req, res) =>{
    res.send('Welcome to REST API ASIS System')
});

export default router;