//ajout ici le manage de devices

import type { Express } from 'express';
import { DataDevices, listServices, RoleName } from './types.js';
import config from '../config.js';
import Devices from './devices.js';

export default class indexSvc {
    app: Express
    listServices: listServices
    role_name: RoleName
    constructor(app: Express) {
        this.app = app
        this.listServices = []
        this.role_name = config.role.name
    }

    load (): number {
        Object.entries(config.services).forEach(element => {
            this.listServices.push({name: element[0], params: element[1]})
        });
        //load Devices
        if (this.role_name == 'server_manager') new Devices(this.app).startManagerServer()
        if (this.role_name == 'server') new Devices(this.app).startServer()
        
        //add here the load of Services:    const a = new Services()
        return 200
    }

    refresh (): DataDevices {
        // Services.refresh() => static func ? 
    }
}