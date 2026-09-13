import express, { Router, type Express } from "express";

import config from "../config.js";
import type { Service, ServiceConfig } from "./types.js";

export default class Devices implements Service {
    app: Express
    api: Router
    config: ServiceConfig
    enabled: boolean;
    name: string;
    icon: string;
    status: number

    constructor() {
        this.app = express()
        this.api = this.app._router
        this.config = config.services.devices
        this.enabled = this.config.enabled
        this.icon = 'toFind'
        this.name = 'Devices'

        if (!this.enabled) this.status = 401

        this.status = this.start()
    }

    start (): number {
        return 200
    }
}