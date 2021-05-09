import { Router } from "express";
const router = Router();

router.get('/', (req, res) =>{
    try {
        return res.send('Welcome to REST API ASIS System')
    } catch (error) {
        return res.send('error al cargar la api');
    }
});

export default router;