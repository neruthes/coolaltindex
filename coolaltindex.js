#!/usr/bin/node

const fs = require('fs');
const sh = require('child_process').execSync;
const ejs = require('ejs');


// Prase Arguments
const wwwpath = decodeURIComponent(process.env.url);
const fspath = process.env.wwwroot + wwwpath;

let pageChain = null;
let pageTitle = '(Root)';
if (wwwpath !== '/') {
    const wwwpathArr = wwwpath.split('/');
    pageChain = wwwpathArr.slice(1, -2);
    pageTitle = wwwpathArr.slice(-2, -1);
};

// Initialize configuration
const config = {
    siteName: 'File Server',
    copyrightLine: 'Copyright &copy; Website Owner.'
};
configPath = `${fspath}/.coolaltindexconfig.json`;
if (fs.existsSync(configPath)) {
    let userConfig = JSON.parse(fs.readFileSync(configPath));
    Object.keys(userConfig).map(function (x) {
        config[x] = userConfig[x];
    });
};


let filesList;
let dirsList;

const getFilesOrDirsList = function (source, needDir) {
    return fs.readdirSync(source, { withFileTypes: true })
        .filter(node => (needDir ? node.isDirectory() : !node.isDirectory()))
        .map(node => node.name);
};
if (fs.existsSync(fspath)) {
    filesList = getFilesOrDirsList(fspath, false);
    dirsList = getFilesOrDirsList(fspath, true);
    // filesList = [];
    // dirsList = [];
} else {
    console.log(fspath);
    console.log(`404 Not Found. '${fspath}'`);
    process.exit(0);
};

// console.log(filesList);
// console.log(dirsList);
// process.exit('');
console.log(ejs.render(fs.readFileSync(__dirname + '/index.ejs').toString(), {
    runtime: {
        env: process.env,
        fs: fs,
        sh: sh
    },
    pageChain: pageChain,
    pageTitle: pageTitle,
    config: config,
    wwwpath: wwwpath,
    fspath: fspath,
    filesList: filesList,
    dirsList: dirsList
}))

