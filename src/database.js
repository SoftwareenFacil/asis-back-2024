import MongoClient from "mongodb";

export async function connect(){
    try {
        const local = 'mongodb://localhost/local-db-asis';
        // const atlasMongo = 'mongodb+srv://admin:asis2020@cluster0-ftqrl.mongodb.net/test?retryWrites=true&w=majority';
        const client = await MongoClient.connect(local, {
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
