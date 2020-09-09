import bcrypt from "bcryptjs";

export const encrypPassword = async (password) =>{
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
};

export const comparePassword = async (password, password_db) => {
    return bcrypt.compare(password, password_db);
}