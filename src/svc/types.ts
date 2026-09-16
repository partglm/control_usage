import { UUID } from "crypto";
import { Router, type Express } from "express";

export interface ServiceConfig  {
  enabled: boolean;
  name: string;
  icon: string;
};

export type RoleName = "server_manager" | "devices" | "server"

export type ServerConfig = {
  server: {
    host: string;
    port: number;
  };

  role: {
    name: RoleName;
    host: string;
    port: number;
  };

  manager: {
    name: string;
    refreshInterval: number;
  };

  services: Record<string, ServiceConfig>;
};

export interface Service extends ServiceConfig {
  api: Router,
  app: Express
}

export type listServices = {name: string, params: ServiceConfig}[]

export type DataDevices = {
  name: string
  uuid: UUID
  time_last_refresh: string
  information: any
}

export type DataService = {
  service: string
  information: any
}