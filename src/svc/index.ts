import type { Express } from 'express';
import si from 'systeminformation';
import { UUID } from 'crypto';

import { DataDevices, listServices, RoleName } from './types.js';
import config from '../config.js';
import Devices from './devices.js';
import Storage from './storage.js';

export default class indexSvc {
    app: Express
    listServices: listServices
    role_name: RoleName
    status: number
    static Storage: Storage;
    static time_last_refresh: string

    constructor(app: Express) {
        this.app = app
        this.listServices = []
        this.role_name = config.role.name
        this.status = this.load()

        indexSvc.Storage = new Storage(app)
    }

    load (): number {
        Object.entries(config.services).forEach(element => {
            this.listServices.push({name: element[0], params: element[1]})
        });
        //load Devices
        new Devices(this.app)
        
        //add here the load of Services:    const a = new Services()
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
            uuid: uuid,
            time_last_refresh: this.time_last_refresh,
            information: {}
        }

        //ajouter a information ici le contenue du service sous format: name: {data}
        data.information['storage'] = this.Storage.refresHandler()
        
        return data
    }
}