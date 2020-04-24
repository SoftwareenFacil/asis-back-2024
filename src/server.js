import express from "express";
import morgan from "morgan";
import cors from "cors";
//---------------------IMPORTS ROUTES
import IndexRoute from "./routes/index.routes";
import GIRoute from "./routes/GI/gi.routes";

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

export default app;
