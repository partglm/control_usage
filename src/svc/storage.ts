import { DataService, Service, ServiceConfig } from "./types.js";
import config from "../config.js";

import si from "systeminformation";
import { Router, type Express } from "express";
import { execFile } from "child_process";
import { promisify } from "util";
import { UUID } from "crypto";

const execFileAsync = promisify(execFile);

export class Storage implements Service {
    cacheRefresh: DataService = {service: 'storage', information: {}, time_last_refresh: 0}
    status: number = 500;
    app: Express;
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    refresh_interval: number;
    uuid: UUID;
    constructor(app: Express, uuid: UUID) {
        this.app = app;
        this.api = this.app.router;

        this.config = config.services.storage;
        this.refresh_interval = config.manager.refreshInterval;
        this.enabled = this.config.enabled;
        this.icon = this.config.icon;
        this.name = this.config.name;
        this.uuid = uuid;

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

    private async refresh(): Promise<DataService> {
        const [
            disks,
            partitions,
            filesystems,
            globalDiskIO
        ] = await Promise.all([
            si.diskLayout(),
            si.blockDevices(),
            si.fsSize(),
            si.disksIO().catch(() => null)
        ]);
        //cmd
        const [
            windowsPhysicalDisks,
            windowsDisks,
            windowsPartitions,
            windowsVolumes,
            storageReliability,
            performanceCounters,
            logicalDiskPerformance,
            smartInformation
        ] = await Promise.all([
            this.powershell(`
                Get-PhysicalDisk |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-Disk |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-Partition |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-Volume |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `),


            this.powershell(`
                Get-PhysicalDisk |
                Get-StorageReliabilityCounter |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-Counter @(
                    "\\PhysicalDisk(*)\\Disk Read Bytes/sec",
                    "\\PhysicalDisk(*)\\Disk Write Bytes/sec",
                    "\\PhysicalDisk(*)\\Disk Reads/sec",
                    "\\PhysicalDisk(*)\\Disk Writes/sec",
                    "\\PhysicalDisk(*)\\Current Disk Queue Length",
                    "\\PhysicalDisk(*)\\% Disk Time",
                    "\\PhysicalDisk(*)\\Avg. Disk sec/Read",
                    "\\PhysicalDisk(*)\\Avg. Disk sec/Write",
                    "\\PhysicalDisk(*)\\Avg. Disk sec/Transfer"
                ) |
                Select-Object -ExpandProperty CounterSamples |
                Select-Object Path, InstanceName, CookedValue |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-Counter @(
                    "\\LogicalDisk(*)\\Disk Read Bytes/sec",
                    "\\LogicalDisk(*)\\Disk Write Bytes/sec",
                    "\\LogicalDisk(*)\\Disk Reads/sec",
                    "\\LogicalDisk(*)\\Disk Writes/sec",
                    "\\LogicalDisk(*)\\Current Disk Queue Length",
                    "\\LogicalDisk(*)\\% Disk Time",
                    "\\LogicalDisk(*)\\Avg. Disk sec/Read",
                    "\\LogicalDisk(*)\\Avg. Disk sec/Write",
                    "\\LogicalDisk(*)\\Avg. Disk sec/Transfer"
                ) |
                Select-Object -ExpandProperty CounterSamples |
                Select-Object Path, InstanceName, CookedValue |
                ConvertTo-Json -Depth 10 -Compress
            `),

            this.powershell(`
                Get-CimInstance `
                + `-Namespace root/wmi `
                + `-ClassName MSStorageDriver_FailurePredictStatus |
                Select-Object * |
                ConvertTo-Json -Depth 10 -Compress
            `)
        ]);

        const physicalDiskList = Array.isArray(windowsPhysicalDisks)
            ? windowsPhysicalDisks
            : windowsPhysicalDisks
                ? [windowsPhysicalDisks]
                : [];

        const reliabilityList = Array.isArray(storageReliability)
            ? storageReliability
            : storageReliability
                ? [storageReliability]
                : [];


        const information = {
            disks: disks.map(disk => {
                const windowsDisk = physicalDiskList.find(
                    (windowsDisk: any) =>
                        windowsDisk.SerialNumber &&
                        disk.serialNum &&
                        windowsDisk.SerialNumber === disk.serialNum
                );

                const reliability = reliabilityList.find(
                    (item: any) =>
                        item.SerialNumber &&
                        disk.serialNum &&
                        item.SerialNumber === disk.serialNum
                );

                const diskNumber =
                    windowsDisk?.DeviceId ??
                    windowsDisk?.Number ??
                    null;

                const performance =
                    Array.isArray(performanceCounters)
                        ? performanceCounters.filter(
                            (counter: any) =>
                                diskNumber !== null &&
                                (
                                    counter.InstanceName ===
                                    `${diskNumber}`
                                    ||
                                    counter.InstanceName?.includes(
                                        `${diskNumber}`
                                    )
                                )
                        )
                        : [];

                return {
                    device: disk.device,
                    name: disk.name,

                    type: disk.type,
                    vendor: disk.vendor,

                    size: disk.size,
                    firmwareRevision: disk.firmwareRevision,

                    serialNumber: disk.serialNum,
                    interfaceType: disk.interfaceType,

                    temperature: disk.temperature,
                    smartStatus: disk.smartStatus,

                    bytesPerSector: disk.bytesPerSector,
                    totalCylinders: disk.totalCylinders,

                    windowsInformation: windowsDisk,
                    reliability,

                    performance
                };
            }),

            partitions: partitions.map(partition => {
                const windowsPartition =
                    Array.isArray(windowsPartitions)
                        ? windowsPartitions.find(
                            (windowsPartition: any) =>
                                windowsPartition.DriveLetter &&
                                partition.mount &&
                                `${windowsPartition.DriveLetter}:`
                                    .toLowerCase() ===
                                partition.mount.toLowerCase()
                        )
                        : windowsPartitions;
                return {
                    device: partition.name,
                    label: partition.label,

                    type: partition.type,
                    filesystem: partition.fsType,

                    mountPoint: partition.mount,
                    size: partition.size,

                    physical: partition.physical,
                    uuid: partition.uuid,

                    windowsInformation: windowsPartition
                };
            }),

            filesystems: filesystems.map(filesystem => {
                const windowsVolume =
                    Array.isArray(windowsVolumes)
                        ? windowsVolumes.find(
                            (volume: any) =>
                                volume.DriveLetter &&
                                `${volume.DriveLetter}:`
                                    .toLowerCase() ===
                                filesystem.mount.toLowerCase()
                        )
                        : windowsVolumes;

                const performance =
                    Array.isArray(logicalDiskPerformance)
                        ? logicalDiskPerformance.filter(
                            (counter: any) =>
                                counter.InstanceName?.toLowerCase() ===
                                filesystem.mount
                                    .replace(":", "")
                                    .toLowerCase()
                        )
                        : [];
                return {
                    mountPoint: filesystem.mount,
                    filesystem: filesystem.fs,

                    type: filesystem.type,
                    size: filesystem.size,

                    usedSpace: filesystem.used,
                    availableSpace: filesystem.available,

                    usagePercentage: filesystem.use,
                    windowsInformation: windowsVolume,

                    performance
                };
            }),
            performance: {
                readOperations: globalDiskIO?.rIO ?? null,
                writeOperations: globalDiskIO?.wIO ?? null,
            
                totalOperations: globalDiskIO?.tIO ?? null,
                windowsCounters: performanceCounters
            },

            health: {
                reliabilityCounters: storageReliability,
                smartInformation
            },

            windows: {
                physicalDisks: windowsPhysicalDisks,
                disks: windowsDisks,

                partitions: windowsPartitions,
                volumes: windowsVolumes,

                storageReliability,
                performanceCounters,

                logicalDiskPerformance,
                smartInformation
            }
        };

        const data: DataService = {
            service: "storage",
            information,
            time_last_refresh: Date.now()
        };


        return data;
    }
}