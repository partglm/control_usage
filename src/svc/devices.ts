import express, { Router, type Express } from "express";
import { randomUUID, UUID } from "crypto";

import config from "../config.js";
import type { Service, ServiceConfig, DataDevices } from "./types.js";

export default class Devices implements Service {
    app: Express;
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    status: number;
    refresh_rate: number;
    devices: UUID[]
    dataDevices: DataDevices[]

    constructor() {
        this.app = express()
        this.app.use(express.json());

        this.api = this.app._router
        this.config = config.services.devices
        this.enabled = this.config.enabled
        this.icon = this.config.icon
        this.name = this.config.name
        this.refresh_rate = config.manager.refreshInterval //idk if i will use it
        this.devices = []
        this.dataDevices = []

        if (!this.enabled) this.status = 401

        this.status = this.start()
    }

    start (): number {
        this.api.put('add', (req,res) => {
            const uuid: UUID = !req.body.uuid ? req.body.uuid:  randomUUID()
        
            res.json({uuid: uuid})
            this.devices.push(uuid)
        })

        this.api.post('data', (req,res) => {
            const data = this.dataDevices.find(device => device.uuid === req.body.uuid);
            res.json(data)
        })
//ajouter un handler par devices
//ajouter la récup d'info
        return 200
    }

    getDevices (): UUID[] {
        return this.devices
    }
}