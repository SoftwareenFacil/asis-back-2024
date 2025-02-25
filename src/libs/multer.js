import multer from "multer";
import {v4} from "uuid";
import path from "path";

const storage = multer.diskStorage({
    destination: 'uploads',
    filename: (req, file, cb) =>{
        // cb(null, v4() + path.extname(file.originalname));
        cb(null, 'EXAMEN.pdf');
    }
})

export default multer({storage});