import express from 'express'

import config from "./config.js";

const app = express()
const port: number = config.server.port
const host: string = config.server.host

app.listen(port, host)

//to add here the refreshIntervale for roleDevices

//if roleServer:             //envoyés ses infos au roleServerManager (fetch post ) AND get uuid
//if roleServerManager:      //envoyé ses infos auX roleServer (ajout de ses infos dans infos devices) et crée son uuid
//if roleDevices:            //envoyé ses infos au roleServerManager