import { Router, type Express } from 'express'
import { DataService, ListDevices, Service, ServiceConfig } from './types.js';
import config from '../config.js';
import indexSvc from './index.js';
import Devices from './devices.js';

export default class Home implements Service {
    app: Express
    enabled: boolean;
    name: string;
    api: Router
    config: ServiceConfig
    status: number
    constructor(app: Express) {
        this.app = app
        this.api = Router()

        this.config = config.services.home
        this.enabled = this.config.enabled
        this.name = this.config.name

        this.status = this.load()
    }

    load (): number {
        this.api.get('/', (req,res) => {
            res.sendFile(config.dirname + "/src/public/home" + "/home.html")
        })

        this.api.post('/data', async (req,res) =>{
            const data: DataService[] = await this.refresh()

            res.json(data)
        })

        this.api.post('/devices', (req,res) => {
            const data: ListDevices = Devices.devices

            res.json({data: data})
        })

        this.app.use('/', this.api)
        
        return 200
    }

    async refresh (): Promise<DataService[]> {
        const dataStorage = await indexSvc.Usage.refresHandler()

        const data: DataService[] = [
        {
            service: dataStorage.service,
            time_last_refresh: dataStorage.time_last_refresh,
            information: {
                
            }
        },
        
    
        ]

        return data
    }
}
