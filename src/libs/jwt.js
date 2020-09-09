import jwt from "jsonwebtoken";
import config from "../config";

export const createToken = (objToEncrypt) => {
   return jwt.sign(objToEncrypt, config.SECRET);
};