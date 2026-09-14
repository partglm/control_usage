import express, { Router, type Express } from "express";
import { randomUUID, UUID } from "crypto";

import config from "../config.js";
import type { Service, ServiceConfig } from "./types.js";

export default class Devices implements Service {
    app: Express;
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    status: number;
    refresh_rate: number;

    constructor() {
        this.app = express()
        this.app.use(express.json());

        this.api = this.app._router
        this.config = config.services.devices
        this.enabled = this.config.enabled
        this.icon = this.config.icon
        this.name = this.config.name
        this.refresh_rate = config.manager.refreshInterval //idk if i will use it

        if (!this.enabled) this.status = 401

        this.status = this.start()
    }

    start (): number {
        this.api.put('add', (req,res) => {
            const uuid: UUID = !req.body.uuid ? req.body.uuid:  randomUUID()
        
            res.json({uuid: uuid})

        })
//ajouter un handler par devices 
        return 200
    }
}