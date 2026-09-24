import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'yaml'

import type { ServerConfig } from './svc/types.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const configPath = path.join(__dirname, '../config.yaml')

const configFile = fs.readFileSync(configPath, 'utf-8')
const config: ServerConfig = yaml.parse(configFile)

config.dirname = __dirname

export default config