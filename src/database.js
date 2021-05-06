import MongoClient from "mongodb";
import { MONGODB_CONNECTION_DEV, MONGODB_CLIENT_DEV } from "./constant/var";

export async function connect(){
    try {
        // const local = 'mongodb://localhost/local-db-asis';
        const connextionMongodb = process.env.MONGODB_CONNECTION_PROD || MONGODB_CONNECTION_DEV;
        // const atlasMongo = 'mongodb+srv://admin:asis2020@cluster0-ftqrl.mongodb.net/test?retryWrites=true&w=majority';
        const client = await MongoClient.connect(connextionMongodb, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })

        const db = client.db(process.env.MONGODB_CLIENT_PROD || MONGODB_CLIENT_DEV);
        console.log('DB connected')
        return db;

    } catch (error) {
        console.log(error)
        return null;
    }
}
