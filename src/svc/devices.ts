import express, { Router, type Express } from "express";
import { randomUUID, UUID } from "crypto";

import type { Service, ServiceConfig, DataDevices, RoleName, ListDevices } from "./types.js";
import config from "../config.js";
import indexSvc from "./index.js";

export default class Devices implements Service {
    app: Express;
    service: Express
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    status: number = 500;
    devices: ListDevices;
    dataDevices: DataDevices[];
    role_host: string;
    role_port: number;
    role_name: RoleName;
    refresh_interval: number;
    uuid!: UUID;
    DevicesData: any;

    constructor(app: Express) {
        this.app = app
        this.service = express()
        this.service.use(express.json());
        this.api = this.app.router

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
        
        if (this.role_name == 'server' || this.role_name == 'devices') {
            fetch(`${this.role_host}:${this.role_port}/add`, {
                method: 'PUT'
            })
                .then(result => result.json())
                .then((uuid: UUID) => {
                    this.uuid = uuid
                })
        }

        if (this.role_name == 'server_manager') {
            this.uuid = randomUUID()
        }

        //Start

        if (this.role_name == "devices") {
            this.status = this.startDevices() }

        if (this.role_name == "server_manager") {
            this.status = this.startManagerServer() }

        if (this.role_name == "server") {
            void this.isManagerJoinable().then(joinable => {
                if (joinable) {
                    this.status = this.startServer()
                }else{
                    this.status = this.startServer()
                }
            })
        }
    }

    startManagerServer (): number {
        //services Handler
        this.service.put('add', (req,res) => {
            const name: string = req.body.name
            const uuid: UUID = this.devices.find(d => d.name === name)?.uuid ?? randomUUID();
            
            res.json({uuid: uuid})

            const exists = this.devices.some(d => d.name === name);
            if (exists) return
            this.devices.push({uuid: uuid, name: name, status: true, time_last_refresh: 0})
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
        this.service.get('')
        this.service.get('health', (req,res) => {
            res.sendStatus(200)
        })

        this.service.listen(this.role_port, this.role_host)

        //web handler
        this.api.post('data', (req,res) => {
            const data = this.dataDevices.find(device => device.uuid === req.body.uuid);
            res.json(data)
        })

        this.app.use('/devices', this.api)
        
        setInterval(async () => {
            //info handler for own devices
            const data: DataDevices = await indexSvc.refresh(this.uuid)

            this.dataDevices = this.dataDevices.filter(data => data.uuid !== this.uuid)
            this.dataDevices.push(data)
        
            //check status devices
            this.devices.forEach(device => {
                if (device.time_last_refresh !== 0 &&
                    (device.time_last_refresh + (this.refresh_interval * 2.5)) > Date.now()) {
                    this.devices.find(d => d.uuid === device.uuid)!.status = false;
                }
            })
        
        }, Math.abs(this.refresh_interval/2))

        return 200
    }

    startServer (): number {
        setInterval(async () => {
            const result = await fetch(`${this.role_host}:${this.role_port}/dataAll`)
            const json = await result.json()
            const data: DataDevices[] = json.data

            this.dataDevices = data
        }, Math.abs(this.refresh_interval/2))

        this.api.post('data', (req,res) => {
            const data = this.dataDevices.find(device => device.uuid === req.body.uuid);
            res.json(data)
        })

        this.app.use('/devices', this.api)
    
        this.setIntervalDataToManager()

        return 200
    }

    startDevices(): number {
        this.setIntervalDataToManager()

        return 200
    }

    private setIntervalDataToManager (): void {
        setInterval(async () => {
            const data: DataDevices = await indexSvc.refresh(this.uuid)

            const result = await fetch(`${this.role_host}:${this.role_port}/data`, {
                method: 'PATCH',
                body: JSON.stringify({data: data})
            })
    
        }, Math.abs(this.refresh_interval - 100))
    }

    private async isManagerJoinable(): Promise<boolean> {
        try {
            const response = await fetch(`${this.role_host}:${this.role_port}/health`, {
                signal: AbortSignal.timeout(2000)
            });
            return response.ok;
        } catch {
            return false;
        }        
    }

    //getDevices (): UUID[] {
    //    return this.devices
    //}
}