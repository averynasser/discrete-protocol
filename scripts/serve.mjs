import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../out');
const mime={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.txt':'text/plain','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.ico':'image/x-icon'};
try{await stat(path.join(root,'index.html'))}catch{console.error('Build belum tersedia. Jalankan npm install lalu npm run build.');process.exit(1)}
const server=http.createServer(async(req,res)=>{try{const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);let filename=path.resolve(root,'.'+pathname);if(filename!==root&&!filename.startsWith(root+path.sep)){res.writeHead(403);res.end();return}if((await stat(filename)).isDirectory())filename=path.join(filename,'index.html');const data=await readFile(filename);res.writeHead(200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(data)}catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('Halaman tidak ditemukan.')}});
let port=4173;
server.on('error',error=>{if(error.code==='EADDRINUSE'&&port<4183){port++;server.listen(port,'127.0.0.1')}else{console.error(error.message);process.exit(1)}});
server.on('listening',()=>{const url=`http://127.0.0.1:${port}`;console.log(`\nDISCRETE PROTOCOL siap dipakai: ${url}\nBiarkan jendela ini terbuka. Ctrl+C untuk berhenti.\n`);if(process.argv.includes('--open')){if(process.platform==='win32')spawn('cmd.exe',['/d','/c','start','',url],{windowsHide:true,stdio:'ignore'});else if(process.platform==='darwin')spawn('open',[url],{stdio:'ignore'});else spawn('xdg-open',[url],{stdio:'ignore'})}});
server.listen(port,'127.0.0.1');
