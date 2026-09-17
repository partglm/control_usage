import express from 'express'

import config from "./config.js";
import indexSvc from './svc/index.js';

const app = express()
const port: number = config.server.port
const host: string = config.server.host

//new indexSvc(app)
//
//app.listen(port, host)

//if roleServer:             //envoyés ses infos au roleServerManager (fetch post ) AND get uuid                                DONE
//if roleServerManager:      //envoyé ses infos auX roleServer (ajout de ses infos dans infos devices) et crée son uuid         DONE
//if roleDevices:            //envoyé ses infos au roleServerManager AND get uuid                                               DONE

import fs from 'fs';
import { Storage } from './svc/storage.js';
import { randomUUID } from 'crypto';
const storage = new Storage(app, randomUUID());
const data = await storage.refresHandler();
console.log(data)
const data1 = await storage.refresHandler();
console.log(data1)