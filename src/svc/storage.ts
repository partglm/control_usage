import { DataService, Service, ServiceConfig } from "./types.js";
import config from "../config.js";

import si from 'systeminformation';
import { Router, type Express } from "express";
import { execFile } from 'child_process';
import { promisify } from 'util';
import { UUID } from "crypto";

const execFileAsync = promisify(execFile);

export class Storage implements Service {
    app: Express;
    api: Router;
    config: ServiceConfig;
    enabled: boolean;
    name: string;
    icon: string;
    status: number = 500;
    refresh_interval: number;
    uuid: UUID;
    constructor(app: Express, uuid: UUID) {
        this.app = app
        this.api = this.app.router

        this.config = config.services.devices
        this.refresh_interval = config.manager.refreshInterval
        this.enabled = this.config.enabled
        this.icon = this.config.icon
        this.name = this.config.name
        this.uuid = uuid

        if (!this.enabled) return
        this.status = this.load()
    }

    load(): number {
        this.api.post('data', async (req,res) => {
            const data: DataService = await this.refresh()
            
            res.json(data)
        })

        this.app.use('/storage', this.app)

        return 200
    }

    async powershell(command: string): Promise<any> {
        const { stdout } = await execFileAsync(
            'powershell.exe',
            [
                '-NoProfile',
                '-NonInteractive',
                '-ExecutionPolicy',
                'Bypass',
                '-Command',
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
    }

    async refresh(): Promise<DataService> {
        const [
            disks,
            partitions,
            filesystems,
            globalDiskIO
        ] = await Promise.all([
            si.diskLayout(),
            si.blockDevices(),
            si.fsSize(),
            si.disksIO()
        ]);

        //perf des volumes 

        const filesystemPerformance = await Promise.all(
            filesystems.map(async filesystem => {
                try {
                    const performance = await si.diskIO(filesystem.mount);

                    return {
                        mountPoint: filesystem.mount,

                        readOperations: performance.rIO,
                        writeOperations: performance.wIO,

                        readBytes: performance.rBytes,
                        writeBytes: performance.wBytes,

                        totalOperations: performance.tIO,
                        totalBytes: performance.tBytes,

                        busyTime: performance.bIO,
                        queueLength: performance.q
                    };
                } catch {
                    return {
                        mountPoint: filesystem.mount,

                        readOperations: null,
                        writeOperations: null,

                        readBytes: null,
                        writeBytes: null,

                        totalOperations: null,
                        totalBytes: null,

                        busyTime: null,
                        queueLength: null
                    };
                }
            })
        );
        //disk physique

        const windowsPhysicalDisks = await this.powershell(`
            Get-PhysicalDisk |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);
        //partition 

        const windowsDisks = await this.powershell(`
            Get-Disk |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);


        const windowsPartitions = await this.powershell(`
            Get-Partition |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);
        //volumes

        const windowsVolumes = await this.powershell(`
            Get-Volume |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);
        //fiabilié des disk

        const storageReliability = await this.powershell(`
            Get-PhysicalDisk |
            Get-StorageReliabilityCounter |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);
        //compteur de perf

        const performanceCounters = await this.powershell(`
            Get-Counter '
                \\PhysicalDisk(*)\\Disk Read Bytes/sec,
                \\PhysicalDisk(*)\\Disk Write Bytes/sec,
                \\PhysicalDisk(*)\\Disk Reads/sec,
                \\PhysicalDisk(*)\\Disk Writes/sec,
                \\PhysicalDisk(*)\\Current Disk Queue Length,
                \\PhysicalDisk(*)\\% Disk Time,
                \\PhysicalDisk(*)\\Avg. Disk sec/Read,
                \\PhysicalDisk(*)\\Avg. Disk sec/Write,
                \\PhysicalDisk(*)\\Avg. Disk sec/Transfer
            ' |
            Select-Object -ExpandProperty CounterSamples |
            Select-Object Path, InstanceName, CookedValue |
            ConvertTo-Json -Depth 10 -Compress
        `);
        //info smart

        const smartInformation = await this.powershell(`
            Get-CimInstance -Namespace root/wmi -ClassName MSStorageDriver_FailurePredictStatus |
            Select-Object * |
            ConvertTo-Json -Depth 10 -Compress
        `);

        //obj final
        const information = {

            disks: disks.map(disk => ({
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

                windowsInformation:
                    Array.isArray(windowsPhysicalDisks)
                        ? windowsPhysicalDisks.find(
                            (windowsDisk: any) =>
                                windowsDisk.SerialNumber === disk.serialNum
                        )
                        : windowsPhysicalDisks,

                reliability:
                    Array.isArray(storageReliability)
                        ? storageReliability.find(
                            (reliability: any) =>
                                reliability.SerialNumber === disk.serialNum
                        )
                        : storageReliability

            })),

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
                        : null;
                return {
                    device: partition.name,
                    label: partition.label,

                    type: partition.type,
                    filesystem: partition.fstype,

                    mountPoint: partition.mount,
                    size: partition.size,

                    physical: partition.physical,
                    uuid: partition.uuid,

                    logicalBlockSize: partition.logicalBlockSize,
                    physicalBlockSize: partition.physicalBlockSize,

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
                        : null;

                const performance =
                    filesystemPerformance.find(
                        performance =>
                            performance.mountPoint === filesystem.mount
                    );

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
                readOperations: globalDiskIO.rIO,
                writeOperations: globalDiskIO.wIO,

                readBytes: globalDiskIO.rBytes,
                writeBytes: globalDiskIO.wBytes,

                totalOperations: globalDiskIO.tIO,
                totalBytes: globalDiskIO.tBytes,

                busyTime: globalDiskIO.bIO,
                queueLength: globalDiskIO.q,

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

                smartInformation
            }
        };


        const data: DataService = {

            service: 'storage',

            information

        };


        return data;
    }
}