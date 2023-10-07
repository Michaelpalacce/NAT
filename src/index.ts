#! /usr/bin/env node
import cli from "./cli.js";

// @TODO Make me an argument, or make whoever is using NAT have this set
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

cli();
