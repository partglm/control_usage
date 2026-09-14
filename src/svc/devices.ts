import express, { Router, type Express } from "express";
import { randomUUID, UUID } from "crypto";

import config from "../config.js";
import type { Service, ServiceConfig, DataDevices, RoleName } from "./types.js";

export default class Devices implements Service {
    app: Express;
    service: Express
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    status: number = 500;
    devices: UUID[];
    dataDevices: DataDevices[];
    role_host: string;
    role_port: number;
    role_name: RoleName;
    refresh_interval: number;

    constructor(app: Express) {
        this.app = app
        this.service = express()
        this.service.use(express.json());
        this.api = this.app._router

        this.config = config.services.devices
        this.enabled = this.config.enabled
        this.icon = this.config.icon
        this.name = this.config.name
        this.role_host = config.role.host
        this.role_port = config.role.port
        this.role_name = config.role.name
        this.refresh_interval = config.manager.refreshInterval

        this.devices = []
        this.dataDevices = []

        if (!this.enabled) this.status = 401

        if (this.role_name == "devices") return 

        if (this.role_name == "server_manager") {
            this.status = this.startManagerServer() }

        if (this.role_name == "server") {
            this.status = this.startServer() }
    }

    startManagerServer (): number {
        this.service.put('add', (req,res) => {
            const uuid: UUID = !req.body.uuid ? req.body.uuid:  randomUUID()
            
            res.json({uuid: uuid})
            this.devices.push(uuid)
        })

        this.service.patch('data', (req,res) => {
            const data: DataDevices = req.body.data
            const uuid = data.uuid

            this.dataDevices = this.dataDevices.filter(data => data.uuid !== uuid)
            this.dataDevices.push(data)
        })

        this.service.get('dataAll', (req,res) => {
            res.json({data: this.dataDevices})
        })
        this.service.listen(this.role_port, this.role_host)



        this.api.post('data', (req,res) => {
            const data = this.dataDevices.find(device => device.uuid === req.body.uuid);
            res.json(data)
        })

        this.app.use('/devices', this.api)
        return 200
    }

    startServer (): number {
        setInterval(async () => {
            const result = await fetch(`${this.role_host}:${this.role_port}/dataAll`)
            const json = await result.json()
            const data: DataDevices[] = json.data

            this.dataDevices = data
        }, this.refresh_interval/2)

        this.api.post('data', (req,res) => {
            const data = this.dataDevices.find(device => device.uuid === req.body.uuid);
            res.json(data)
        })

        this.app.use('/devices', this.api)
        return 200
    }

    getDevices (): UUID[] {
        return this.devices
    }
}