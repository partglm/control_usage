import express from 'express'

import config from "./config.js";

const app = express()
const port: number = config.server.port
const host: string = config.server.host

app.listen(port, host)