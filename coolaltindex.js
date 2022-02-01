#!/usr/bin/node

const fs = require('fs');
const sh = require('child_process').execSync;
const ejs = require('ejs')


// Prase Arguments
const ARG_FSPATH = process.argv[2];
const ARG_WWWPATH = process.argv[3];



