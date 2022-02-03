#!/usr/bin/node

const fs = require('fs');
const http = require('http');
const ejs = require('ejs');


const indexEjsTempl = fs.readFileSync(__dirname + '/index.ejs').toString();
let renderIndex = ejs.compile(indexEjsTempl, { async: false });
setTimeout(function () {
    renderIndex = ejs.compile(indexEjsTempl, { async: false });
}, 120*1000);


const server = http.createServer(function (req, res) {
    const wwwroot = req.headers.wwwroot;    
    const wwwpath = decodeURIComponent(req.url);

    const fspath = wwwroot + wwwpath;

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
    if (fs.existsSync(configPath)) {
        let userConfig = JSON.parse(fs.readFileSync(configPath));
        Object.keys(userConfig).map(function (x) {
            config[x] = userConfig[x];
        });
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
        console.log(fspath);
        console.log(`404 Not Found. '${fspath}'`);
        return 0;
    };


    let outputHtml = renderIndex({
        runtime: {
            env: process.env,
            fs: fs
        },
        pageChain: pageChain,
        pageTitle: pageTitle,
        config: config,
        wwwpath: wwwpath,
        fspath: fspath,
        filesList: filesList,
        dirsList: dirsList
    });
    res.writeHead(200, {
        'content-type': 'text/html'
    });
    res.end(outputHtml);
});

server.listen(0, '127.0.0.1');

server.on('listening', function () {
    const port = server.address().port;
    console.log(`[INFO] Listening port ${port}`);
    fs.writeFileSync(`/tmp/nodecgid.env.coolaltindex`, JSON.stringify(server.address(), 4));
    fs.writeFileSync(process.env.cgi_portfile, port.toString());
});