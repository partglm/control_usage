import type { Express } from 'express';
import si from 'systeminformation';
import { UUID } from 'crypto';

import { DataDevices, listServices, RoleName } from './types.js';
import config from '../config.js';
import Devices from './devices.js';
import Usage from './usage.js';

export default class indexSvc {
    app: Express
    listServices: listServices
    role_name: RoleName
    status: number
    static Usage: Usage;
    static time_last_refresh: string
    static Devices: Devices;

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
        
        //add here the load of Services: indexSvc.a = new Services()
        indexSvc.Devices = new Devices(this.app)
        indexSvc.Usage = new Usage(this.app)
        
        return 200
    }

    static async refresh (uuid: UUID): Promise<DataDevices> {
        const name: string = (await si.osInfo()).hostname

        this.time_last_refresh = new Date().toLocaleString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });

        const data: DataDevices = {
            name: name,
            uuid: this.Devices.uuid,
            time_last_refresh: this.time_last_refresh,
            information: {}
        }

        //ajouter a information ici le contenue du service sous format: name: {data}
        data.information['usage'] = this.Usage.refresHandler()
        
        return data
    }
}