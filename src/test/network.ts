import { UUID } from "node:crypto"
import config from "../config.js"

export default class Test {
    uuid!: UUID
    nbTestDevices: number
    constructor(nb:number) {
        this.nbTestDevices = nb

        this.init()
    }

    init () {
        this.add()
    }
    
    async health (i=0) {
        const res = await fetch(`http://127.0.0.1:${config.role.port}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        if (res.status!=200) {
            i=i+1
            if (i==10) return
            await new Promise(resolve => setTimeout(resolve, 3000));
            await this.health(i)
        }
    }

    async add () {
        await this.health()

        const res = await fetch(`http://127.0.0.1:${config.role.port}/add`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: `Test-Devices-${this.nbTestDevices}`})
        })

        console.log(`created test device number ${this.nbTestDevices}`)
        const uuid = (await res.json()).uuid
        
        this.uuid = uuid
    }
}