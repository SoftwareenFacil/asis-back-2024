import MongoClient from "mongodb";
import { MONGODB_CONNECTION_DEV, MONGODB_CONNECTION_STAGING, MONGODB_CONNECTION_PROD } from "./constant/var";

export async function connect(){
    try {
        const MONGO_DEV = MONGODB_CONNECTION_DEV;
        const MONGO_STAGING = MONGODB_CONNECTION_STAGING;
        const MONGO_PROD = MONGODB_CONNECTION_PROD;

        const client = await MongoClient.connect(MONGO_PROD, {
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
