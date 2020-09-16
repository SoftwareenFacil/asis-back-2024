import jwt, { verify } from "jsonwebtoken";
import config from "../config";

export const createToken = (objToEncrypt) => {
   return jwt.sign(objToEncrypt, config.SECRET);
};

export const verifyToken = async (token) => {
   try {
      return jwt.verify(token, config.SECRET);
   } catch (error) {
      return {}
   }
}