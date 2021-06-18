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
  const conn = await connect();
  const db = conn.db('asis-db');

  const gi = await db.collection('gi').findOne({ rut: rut });

  if (!gi) return res.json({ err: 'ASIS01', msg: 'Usuario no encontrado.', res: null });

  if (!gi.password) return res.json({ err: 'ASIS02', msg: 'Este usuario no contiene una contraseña creada.', res: null });

  const passwordIsValid = await comparePassword(password, gi.password);

  if (!passwordIsValid) return res.json({ err: 'ASIS03', msg: 'Password incorrecta', res: null });

  const rol = (gi.rol) || '';

  const token = createToken({
    id: gi._id,
    rut: gi.rut,
    razon_social: gi.razon_social,
    rol: gi.rol.toLowerCase() || '',
  });


  //le paso la data de los roles
  try {
    const result = await db.collection('roles').find().toArray();
    let roles = (result, rol = '') => {
      switch (rol.toLowerCase()) {
        case 'clientes':
          return result[0].clientes
        case 'cmpleados':
          return result[0].empleados
        case 'colaboradores':
          return result[0].colaboradores
        case 'supervisor':
          return result[0].supervisor
        case 'admin':
          return result[0].admin
        default:
          return {}
      }
    }

    const objectRoles = roles(result, rol);
    console.log(objectRoles)
    const acciones = objectRoles.acciones;
    delete objectRoles.acciones || {};
    const clienteRoles = { ...objectRoles, ...acciones };

    return res.status(200).json(
      {
        err: null,
        msg: 'Usuario logeado correctamente',
        res: {
          token,
          rol: rol.toLowerCase(),
          gi,
          permisos: Object.keys(clienteRoles).filter(el => clienteRoles[el] === 1) || []
          // permisos: clienteRoles
        }
      }
    );
  } catch (error) {
    return res.status(500).json({
      err: String(error),
      msg: String(error),
      res: null
    })
  }
  finally {
    conn.close()
  }
});

//test
router.post('/crearrol/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await connect();
  const db = conn.db('asis-db');
  const roles = await db.collection('roles').find().toArray();

  const result = await db.collection('roles').updateOne({ _id: ObjectID(id) }, {
    $set: {
      admin: roles[0].colaboradores
    }
  });
  conn.close();
  return res.json({ msg: 'listo' });
})



export default router;