const dotenv = require('dotenv');
dotenv.config();

if(!process.env.MONGO_URI){
    throw new Error("MONGO_URI is not defined in environment variable");
}

if(!process.env.JWT_SECRET){
    throw new Error("JWT_SECRET is not defined in environment variable");
}

if(!process.env.GOOGLE_CLIENT_ID){
    throw new Error("GOOGLE_CLIENT_ID is not defined in environment variable");
}

if(!process.env.GOOGLE_CLIENT_SECRET){
    throw new Error("GOOGLE_CLIENT_SECRET is not defined in environment variable");
}

if(!process.env.GOOGLE_REFRESH_TOKEN){
    throw new Error("GOOGLE_REFRESH_TOKEN is not defined in environment variable");
}

if(!process.env.GOOGLE_USER){
    throw new Error("GOOGLE_USER is not defined in environment variable");
}

if(!process.env.EMAIL_USER){
    throw new Error("EMAIL_USER is not defined in environment variable");
}

if(!process.env.EMAIL_PASS){
    throw new Error("EMAIL_PASS is not defined in environment variable");
}

const stripQuotes = (val) => val ? val.replace(/^['"]|['"]$/g, '') : val;

const config = {
    MONGO_URI: stripQuotes(process.env.MONGO_URI),
    JWT_SECRET: stripQuotes(process.env.JWT_SECRET),
    GOOGLE_CLIENT_ID: stripQuotes(process.env.GOOGLE_CLIENT_ID),
    GOOGLE_CLIENT_SECRET: stripQuotes(process.env.GOOGLE_CLIENT_SECRET),
    GOOGLE_REFRESH_TOKEN: stripQuotes(process.env.GOOGLE_REFRESH_TOKEN),
    GOOGLE_USER: stripQuotes(process.env.GOOGLE_USER),
    EMAIL_USER: stripQuotes(process.env.EMAIL_USER),
    EMAIL_PASS: stripQuotes(process.env.EMAIL_PASS)
}

module.exports = config;