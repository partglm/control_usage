import type { Express } from 'express'
import { ServiceConfig } from './types.js';

export default class Home implements ServiceConfig {
    app: Express
    enabled: boolean;
    icon: string;
    name: string;
    constructor(app: Express)
}
