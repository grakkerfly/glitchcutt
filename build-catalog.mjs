import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const directory=path.join(root,'projects');
const entries=await fs.readdir(directory,{withFileTypes:true});
let bytes=0;
const projects=await Promise.all(entries.filter(e=>e.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,'en')).map(async entry=>{
 const folder=path.join(directory,entry.name);let info={};
 try{info=JSON.parse(await fs.readFile(path.join(folder,'project.json'),'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 const files=await fs.readdir(folder,{withFileTypes:true});
 const media=await Promise.all(files.filter(f=>f.isFile()&&/\.(png|jpe?g|webp|gif|avif|mp4|webm)$/i.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true})).map(async file=>{const stat=await fs.stat(path.join(folder,file.name));bytes+=stat.size;return {type:/\.(mp4|webm)$/i.test(file.name)?'video':'image',src:'projects/'+encodeURIComponent(entry.name)+'/'+encodeURIComponent(file.name)}}));
 return {slug:entry.name,title:info.title||entry.name.replaceAll('-',' '),description:info.description||'',category:info.category||'',year:info.year||'2026',media};
}));
await fs.writeFile(path.join(root,'projects.json'),JSON.stringify(projects));
console.log(`Catalog: ${projects.length} projects, ${projects.reduce((n,p)=>n+p.media.length,0)} media, ${(bytes/1024**3).toFixed(3)} GiB`);
if(bytes>950*1024**2)console.warn('Media are close to the GitHub Pages 1 GB published-site limit. Consider external media storage before adding more.');

