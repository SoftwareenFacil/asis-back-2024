import MongoClient from "mongodb";
import { MONGODB_CONNECTION_DEV, MONGODB_CLIENT_DEV } from "./constant/var";

export async function connect(){
    try {
        const mongoUri = 'mongodb://localhost/local-db-asis';
        // const connextionMongodb = process.env.MONGODB_CONNECTION_PROD || MONGODB_CONNECTION_DEV;
        // const mongoUri = 'mongodb+srv://admin:Karla2021@cluster0.3pzmz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
        const client = await MongoClient.connect(mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        const db = client.db('asis-db');
        console.log('DB connected')
        return db;

    } catch (error) {
        console.log(error)
        return null;
    }
}
