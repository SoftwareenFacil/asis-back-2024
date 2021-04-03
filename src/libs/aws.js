import { AWS_ACCESS_KEY, AWS_SECRET_KEY } from "../constant/var";

const AWS = require('aws-sdk');

export const s3 = new AWS.S3({
  accessKeyId: AWS_ACCESS_KEY,
  secretAccessKey: AWS_SECRET_KEY
});

export const uploadFileToS3 = (paramsFile) => {
  const aux = s3.upload(paramsFile, (error, data) => {
    if(error){
      return {
        code: 99,
        msg: 'Ha ocurrido un error',
        err: error,
        data
      }
    }
    else{
      return {
        code: 10,
        msg: 'Archivo subido',
        err: null,
        data
      }
    }
  });

  return aux;
};

export const getObjectFromS3 = (paramsFile) => {
  s3.getObject(paramsFile, (error, data) => {
    if(error){
      data
    }
    else{
      console.log('return file', data)
      return data
    };
  });
};