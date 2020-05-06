import express from "express";
import morgan from "morgan";
import cors from "cors";
//---------------------IMPORTS ROUTES
import IndexRoute from "./routes/index.routes";
import GIRoute from "./routes/GI/gi.routes";
import SolicitudesRoute from "./routes/solicitudes/solicitudes.routes";
import ReservasRoute from "./routes/Reservas/reservas.routes";
import CalendarioRoute from "./routes/Calendario/calendario.routes";
import EvaluacionesRoute from "./routes/evaluaciones/evaluaciones.routes";

const app = express();

//Settings
app.set('port', process.env.PORT || 3000);

//Middlewares
app.use(cors())
app.use(morgan('dev'))
app.use(express.json())

//Routes
app.use(IndexRoute);
app.use('/gi', GIRoute)
app.use('/solicitudes', SolicitudesRoute)
app.use('/reservas', ReservasRoute)
app.use('/calendario', CalendarioRoute)
app.use('/evaluaciones', EvaluacionesRoute)

export default app;
