import { Router } from "express";
import { comparePassword } from "../../libs/bcrypt";
import { createToken } from "../../libs/jwt";

const router = Router();

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";


//Login de usuario
router.post('/', async (req, res) => {
    const { rut, password, categoria } = req.body;
    const db = await connect();
    const gi = await db.collection('gi').findOne({ rut: rut, categoria: categoria });

    if (!gi) return res.json({ code: 'ASIS01', msg: 'Usuario no encontrado.' });

    if (!gi.password) return res.json({ code: 'ASIS02', msg: 'Este usuario no contiene contraseña.' });

    const passwordIsValid = await comparePassword(password, gi.password);

    if (!passwordIsValid) return res.json({ code: 'ASIS03', msg: 'Password incorrecta' });

    const token = createToken({
        id: gi._id,
        rut: gi.rut,
        razon_social: gi.razon_social,
    });

    res.status(200).json(
        { 
            code: 'ASIS99', 
            msg: 'Usuario logeado correctamente',
            token,
            gi,
        }
    );
});




export default router;