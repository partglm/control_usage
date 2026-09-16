import express from 'express'
import { UUID } from 'node:crypto';

import config from "./config.js";
import Devices from './svc/devices.js';
import { DataDevices } from './svc/types.js';
import indexSvc from './svc/index.js';

const app = express()
const port: number = config.server.port
const host: string = config.server.host
const role_name = config.role.name
const role_port = config.role.port
const role_host = config.role.host
const refresh_rate = config.manager.refreshInterval


app.listen(port, host)

//to add here the refreshIntervale for roleDevices

const roleServerManager = async () => {
    Devices
}

//if roleServer:             //envoyés ses infos au roleServerManager (fetch post ) AND get uuid                                DONE
//if roleServerManager:      //envoyé ses infos auX roleServer (ajout de ses infos dans infos devices) et crée son uuid
//if roleDevices:            //envoyé ses infos au roleServerManager AND get uuid