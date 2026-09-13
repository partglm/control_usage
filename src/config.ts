import yaml from 'yaml'
import fs from 'fs'
import { ServerConfig } from './types.js'

const config: ServerConfig = yaml.parse('config.yaml')

export default config