type ServiceConfig = {
  enabled: boolean;
  name: string;
  icon: string;
};

export type ServerConfig = {
  server: {
    host: string;
    port: number;
    role: "server_manager" | "devices" | "server";
  };

  manager: {
    name: string;
    refreshInterval: number;
  };

  services: Record<string, ServiceConfig>;
};