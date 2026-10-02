import { DataService, Service, ServiceConfig } from "./types.js";
import config from "../config.js";

import si from "systeminformation";
import { Router, type Express } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import fs, { cpSync } from "fs";
import { info } from "console";

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
        const disk = (await this.powershell(`
            Get-CimInstance Win32_PerfFormattedData_PerfDisk_PhysicalDisk |
            Where-Object Name -eq "_Total" |
            Select-Object PercentDiskTime, DiskReadBytesPerSec, DiskWriteBytesPerSec |
            ConvertTo-Json -Compress`))
        const net = await this.getNetworkUsage()
        const file = fs.readFileSync(config.dirname + '/data/usage.jsonl', 'utf8').trim().split("\n");

        const usageLines = file.filter(line => line.length > 0);
        const history = usageLines.map(line => JSON.parse(line))

        const information = {
            cpu: {
                usage: (await si.currentLoad()).cpus[0].load, 
                freq: (await si.cpuCurrentSpeed()).avg
            },
            ram: {
                used: ram.used,
                dispo: ram.available,
                total: ram.total,
                usage: Math.round((ram.used / ram.total) * 100)
            },
            gpu: {
                usage: gpu.utilizationGpu ?? 0,
                vram_used: gpu.memoryUsed,
                vram_dispo: gpu.memoryFree,
                vram_total: gpu.memoryTotal
            },
            disk: {
                usage: disk.PercentDiskTime,
                read: disk.DiskReadBytesPerSec,
                write: disk.DiskWriteBytesPerSec,

            },
            network: {
                in: net.received,
                out: net.sent
            },
            history: [] as any[]
        }

        const data = {
            information,
            time_last_refresh: Date.now()
        };

        fs.appendFileSync(config.dirname + '/data/usage.jsonl', JSON.stringify(data) + '\n')

        information.history = history ?? []

        return {information: data.information,
                time_last_refresh: data.time_last_refresh,
                service: 'Usage'};
    }

    private async getNetworkUsage(): Promise<{ received: number; sent: number; }> {
        const a = await this.powershell(`
            Get-NetAdapterStatistics |
            Select-Object Name, ReceivedBytes, SentBytes |
            ConvertTo-Json -Compress
        `);

        await new Promise(r => setTimeout(r, 1000));

        const b = await this.powershell(`
            Get-NetAdapterStatistics |
            Select-Object Name, ReceivedBytes, SentBytes |
            ConvertTo-Json -Compress
        `);

        const r = b.find((n: any) => n.Name === "Wi-Fi").ReceivedBytes
                - a.find((n: any) => n.Name === "Wi-Fi").ReceivedBytes;

        const s = b.find((n: any) => n.Name === "Wi-Fi").SentBytes
                - a.find((n: any) => n.Name === "Wi-Fi").SentBytes;

        return { received: r, sent: s };
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