import type { Express } from 'express';
import si from 'systeminformation';
import { UUID } from 'crypto';

import { DataDevices, listServices, RoleName } from './types.js';
import config from '../config.js';
import Devices from './devices.js';

export default class indexSvc {
    app: Express
    listServices: listServices
    role_name: RoleName
    status: number
    static time_last_refresh: string
    constructor(app: Express) {
        this.app = app
        this.listServices = []
        this.role_name = config.role.name
        this.status = this.load()
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

    static async refresh (uuid: UUID): Promise<DataDevices> {
        const name: string = (await si.osInfo()).hostname

        const data: DataDevices = {
            name: name,
            uuid: uuid,
            time_last_refresh: this.time_last_refresh,
            information: {}
        }

        this.time_last_refresh = new Date().toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        //ajouter a information ici le contenue du service sous format: name: {data}
        
        
        return data
    }
}