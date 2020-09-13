import { Router } from "express";
import { comparePassword } from "../../libs/bcrypt";
import { createToken } from "../../libs/jwt";

const router = Router();

const fun = (roles) => {

}

//database connection
import { connect } from "../../database";
import { ObjectID } from "mongodb";


//Login de usuario
router.post('/', async (req, res) => {
    const { rut, password } = req.body;
    const db = await connect();
    const gi = await db.collection('gi').findOne({ rut: rut, categoria: "Empresa/Organizacion" });

    if (!gi) return res.json({ code: 'ASIS01', msg: 'Usuario no encontrado.' });

    if (!gi.password) return res.json({ code: 'ASIS02', msg: 'Este usuario no contiene una contraseña creada.' });

    const passwordIsValid = await comparePassword(password, gi.password);

    if (!passwordIsValid) return res.json({ code: 'ASIS03', msg: 'Password incorrecta' });

    const rol = (gi.rol) || '';

    const token = createToken({
        id: gi._id,
        rut: gi.rut,
        razon_social: gi.razon_social,
    });

    //le paso la data de los roles
    const roles = await db.collection('roles').find().toArray();

    if (roles) {
        const acciones = roles[0].clientes.acciones;
        delete roles[0].clientes.acciones || {};
        const clienteRoles = { ...roles[0].clientes, ...acciones };

        return res.status(200).json(
            {
                code: 'ASIS99',
                msg: 'Usuario logeado correctamente',
                token,
                rol,
                gi,
                clientes_permisos: Object.keys(clienteRoles).filter(el => clienteRoles[el] === 1) || []
            }
        );
    };

    return res.status(200).json(
        {
            code: 'ASIS99',
            msg: 'Usuario logeado correctamente',
            token,
            rol,
            gi,
            clientes_permisos: []
        }
    );
});




export default router;