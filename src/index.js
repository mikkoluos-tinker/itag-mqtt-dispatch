const dotenvResult = require('dotenv').config();

const log = require("winston");
log.level = process.env.LOG_LEVEL || "info";
log.debug("env variables: ");
log.debug(process.env);

const ITags = require("./services/ITags.js");
const mytags = new ITags(process.env);

