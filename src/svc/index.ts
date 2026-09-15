//ajout ici le manage de devices

import type { Express } from 'express';

export default class indexSvc {
    app: Express
    constructor(app: Express) {
        this.app = app
    }

    load () {
        // for each config load name index et leur class
            //refresh func: for each SVC ask
    }
}