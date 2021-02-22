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
  const gi = await db.collection('gi').findOne({ rut: rut });

  if (!gi) return res.json({ code: 'ASIS01', msg: 'Usuario no encontrado.' });

  if (!gi.password) return res.json({ code: 'ASIS02', msg: 'Este usuario no contiene una contraseña creada.' });

  const passwordIsValid = await comparePassword(password, gi.password);

  if (!passwordIsValid) return res.json({ code: 'ASIS03', msg: 'Password incorrecta' });

  const rol = (gi.rol) || '';

  const token = createToken({
    id: gi._id,
    rut: gi.rut,
    razon_social: gi.razon_social,
    rol: gi.rol || '',
  });


  //le paso la data de los roles
  try {
    const result = await db.collection('roles').find().toArray();
    let roles = (result, rol = '') => {
      switch (rol) {
        case 'Clientes':
          return result[0].clientes
        case 'Empleados':
          return result[0].empleados
        case 'Colaboradores':
          return result[0].colaboradores
        case 'admin':
          return result[0].admin
        default:
          return {}
      }
    }

    const objectRoles = roles(result, rol);
    const acciones = objectRoles.acciones;
    delete objectRoles.acciones || {};
    const clienteRoles = { ...objectRoles, ...acciones };

    return res.status(200).json(
      {
        code: 'ASIS99',
        msg: 'Usuario logeado correctamente',
        token,
        rol,
        gi,
        permisos: Object.keys(clienteRoles).filter(el => clienteRoles[el] === 1) || []
      }
    );
  } catch (error) {
    return res.status(500).json({
      msg: 'ha ocurrido un error inesperado',
      error
    })
  }
});

//test
router.post('/crearrol/:id', async (req, res) => {
  const { id } = req.params;
  const db = await connect();
  const roles = await db.collection('roles').find().toArray();

  const result = await db.collection('roles').updateOne({ _id: ObjectID(id) }, {
    $set: {
      admin: roles[0].colaboradores
    }
  });

  return res.json({ msg: 'listo' });
})



export default router;