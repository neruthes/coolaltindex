#!/usr/bin/node

const fs = require('fs');
const http = require('http');
const ejs = require('ejs');


const tmplFilePath = __dirname + '/index.ejs';

const server = http.createServer(function (req, res) {
    const myUrlObj = new URL(req.url, `http://${req.headers.host}`);
    const wwwprefix = req.headers['wwwprefix'] || '';
    const wwwroot = req.headers.wwwroot;    
    const wwwpath = decodeURIComponent(myUrlObj.pathname);
    const fspathOld = wwwroot + wwwpath;
    const fspath = wwwroot + wwwpath;

    // Parse arguments

    const wwwprefixArr = wwwprefix === '' ? [] : wwwprefix.split('/');
    
    let wwwpathArr;
    let pageChain = null;
    let pageTitle = '(Root)';
    if (wwwprefix + wwwpath !== '/') {
        wwwpathArr = wwwpath.split('/');
        pageChain = wwwprefixArr.concat(wwwpathArr.slice(1, -2));
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
        // Feature: Disable indexing by placing a '.noindex' file (when its content does not match param 'token')
        if (
            fs.existsSync(`${fspath}/.noindex`) &&
            fs.readFileSync(`${fspath}/.noindex`).toString().trim() !== myUrlObj.searchParams.get('token')
        ) {
            res.writeHead(403);
            res.end('Indexing is not permitted here.');
            return 0;
        };
        filesList = getFilesOrDirsList(fspath, false);
        dirsList = getFilesOrDirsList(fspath, true);
    } else {
        res.writeHead(404);
        res.end('404 Not Found. Requested path "' + fspath + '" does not exist on filesystem.');
        return 0;
    };

    // Render EJS with data

    const ejsData = {
        runtime: {
            env: process.env
        },
        req: req,
        pageChain: pageChain,
        pageTitle: pageTitle,
        config: config,
        wwwprefix: wwwprefix,
        wwwprefixArr: wwwprefixArr,
        wwwpath: wwwpath,
        wwwpathArr: wwwpathArr,
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
    fs.writeFileSync(process.env.cgi_portfile, port.toString());
});
