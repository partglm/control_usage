import { DataService, Service, ServiceConfig } from "./types.js";
import config from "../config.js";

import si from "systeminformation";
import { Router, type Express } from "express";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export default class Storage implements Service {
    cacheRefresh: DataService = {service: 'storage', information: {}, time_last_refresh: 0}
    status: number = 500;
    app: Express;
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    refresh_interval: number;
    constructor(app: Express) {
        this.app = app;
        this.api = this.app.router;

        this.config = config.services.storage;
        this.refresh_interval = config.manager.refreshInterval;
        this.enabled = this.config.enabled;
        this.icon = this.config.icon;
        this.name = this.config.name;

        if (!this.enabled) return;

        this.status = this.load();
    }

    load(): number {
        this.api.post("data", async (req, res) => {
            const data: DataService = await this.refresHandler();

            res.json(data);
        });

        this.app.use("/storage", this.api);

        return 200;
    }

    async refresHandler(): Promise<DataService> {
        if ((this.cacheRefresh.time_last_refresh + this.refresh_interval) >= Date.now()) return this.cacheRefresh

        const data: DataService = await this.refresh()
        this.cacheRefresh = data

        return data
    }

    private async refresh(): Promise<DataService> {
        //Data see todo.md
        const ram = await si.mem()
        const gpu = (await si.graphics()).controllers[0]
        const disk = (await si.disksIO())

        const information = {
            cpu: {
                usage: (await si.currentLoad()).cpus[0].load , 
                freq: (await si.cpuCurrentSpeed()).avg
            },
            ram: {
                used: ram.used,
                dispo: ram.available,
                total: ram.total,
                usage: Math.round((ram.used / ram.total) * 100)
            },
            gpu: {
                usage: gpu.utilizationGpu,
                vram_used: gpu.memoryUsed,
                vram_dispo: gpu.memoryFree,
                vram_total: gpu.memoryTotal
            },
            disk: {
                read: disk.rWaitPercent,
                write: disk.wWaitPercent,
                usage: this.powershell("(Get-Counter '\PhysicalDisk(_Total)\% Disk Time').CounterSamples.CookedValue")
            }
        }


        const data: DataService = {
            service: "storage",
            information,
            time_last_refresh: Date.now()
        };


        return data;
    }

    async powershell(command: string): Promise<any> {
        try {
            const { stdout } = await execFileAsync(
                "powershell.exe",
                [
                    "-NoProfile",
                    "-NonInteractive",
                    "-ExecutionPolicy",
                    "Bypass",
                    "-Command",
                    command
                ],
                {
                    windowsHide: true,
                    maxBuffer: 50 * 1024 * 1024
                }
            );

            if (!stdout.trim()) {
                return null;
            }

            try {
                return JSON.parse(stdout);
            } catch {
                return stdout.trim();
            }
        } catch {
            return null;
        }
    }
}