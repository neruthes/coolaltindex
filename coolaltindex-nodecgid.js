#!/usr/bin/node

const fs = require('fs');
const http = require('http');
const ejs = require('ejs');


const tmplFilePath = __dirname + '/index.ejs';

const server = http.createServer(function (req, res) {
    const wwwroot = req.headers.wwwroot;    
    const wwwpath = decodeURIComponent(req.url);
    const fspath = wwwroot + wwwpath;

    // Parse arguments

    let pageChain = null;
    let pageTitle = '(Root)';
    if (wwwpath !== '/') {
        const wwwpathArr = wwwpath.split('/');
        pageChain = wwwpathArr.slice(1, -2);
        pageTitle = wwwpathArr.slice(-2, -1);
    };

    // Load configuration

    const config = {
        siteName: 'File Server',
        copyrightLine: 'Copyright &copy; Website Owner.'
    };
    configPath = `${wwwroot}/.coolaltindexconfig.json`;
    try {
        if (fs.existsSync(configPath)) {
            let userConfig = JSON.parse(fs.readFileSync(configPath));
            Object.keys(userConfig).map(function (x) {
                config[x] = userConfig[x];
            });
        };
    } catch (e) {
        // Do nothing?
    };

    // Generate list of dirs and files

    let filesList;
    let dirsList;

    const getFilesOrDirsList = function (source, needDir) {
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(node => (needDir ? node.isDirectory() : !node.isDirectory()))
            .map(node => node.name)
            .filter(nodeName => nodeName[0] !== '.');
    };
    if (fs.existsSync(fspath)) {
        filesList = getFilesOrDirsList(fspath, false);
        dirsList = getFilesOrDirsList(fspath, true);
    } else {
        res.writeHead(404);
        res.end('404 Not Found.')
        return 0;
    };

    // Render EJS with data

    const ejsData = {
        runtime: {
            env: process.env
        },
        pageChain: pageChain,
        pageTitle: pageTitle,
        config: config,
        wwwpath: wwwpath,
        fspath: fspath,
        filesList: filesList,
        dirsList: dirsList
    };
    ejs.renderFile(tmplFilePath, ejsData, {
        cache: true,
        filename: tmplFilePath
    }, function (err, str) {
        if (err) {
            res.writeHead(500);
            res.end('500 Internal Server Error. Failed rendering EJS.');
        } else {
            res.writeHead(200, {
                'content-type': 'text/html'
            });
            res.end(str);
        };
    });
});

server.listen(0, '127.0.0.1');

server.on('listening', function () {
    const port = server.address().port;
    console.log(`[INFO] Listening port ${port}`);
    fs.writeFileSync(`/tmp/nodecgid.env.coolaltindex`, JSON.stringify(server.address(), 4));
    fs.writeFileSync(process.env.cgi_portfile, port.toString());
});
