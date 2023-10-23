#! /usr/bin/env node
import cli from "./cli.js";
import logger from "./logger/logger.js";

// @TODO Make me an argument, or make whoever is using NAT have this set
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
logger.info(`Node Aria Tools`);
const start = Date.now();

await cli();

logger.info(`Total time: ${(Date.now() - start) / 1000}s`);
