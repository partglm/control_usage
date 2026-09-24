import type { Express, Router } from 'express'
import { DataService, Service, ServiceConfig } from './types.js';
import config from '../config.js';
import indexSvc from './index.js';

export default class Home implements Service {
    app: Express
    enabled: boolean;
    icon: string;
    name: string;
    api: Router
    config: ServiceConfig
    status: number
    constructor(app: Express) {
        this.app = app
        this.api = this.app.router

        this.config = config.services.home
        this.enabled = this.config.enabled
        this.icon = this.config.icon
        this.name = this.config.name

        this.status = this.load()
    }

    load (): number {
        this.api.get('/', (req,res) => {
            res.sendFile(config.dirname + "/public/home" + "/home.html")
        })

        this.api.post('data', async (req,res) =>{
            const data: DataService[] = await this.refresh()

            res.json(data)
        })


        this.app.use('/home', this.api)
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
