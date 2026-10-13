import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';
const root=path.dirname(fileURLToPath(import.meta.url));
const directory=path.join(root,'projects');
const entries=await fs.readdir(directory,{withFileTypes:true});
const previews=path.join(root,'cube-previews');
await fs.mkdir(previews,{recursive:true});
let bytes=0;
const projects=await Promise.all(entries.filter(e=>e.isDirectory()).sort((a,b)=>a.name.localeCompare(b.name,'en')).map(async entry=>{
 const folder=path.join(directory,entry.name);let info={};
 try{info=JSON.parse(await fs.readFile(path.join(folder,'project.json'),'utf8'))}catch(error){if(error.code!=='ENOENT')throw error}
 const files=await fs.readdir(folder,{withFileTypes:true});
 const media=[];
 for(const file of files.filter(f=>f.isFile()&&/\.(png|jpe?g|webp|gif|avif|mp4|webm)$/i.test(f.name)).sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}))){
  const source=path.join(folder,file.name),stat=await fs.stat(source);bytes+=stat.size;
  const item={type:/\.(mp4|webm)$/i.test(file.name)?'video':'image',src:'projects/'+encodeURIComponent(entry.name)+'/'+encodeURIComponent(file.name)};
  if(item.type==='image'){
   const metadata=await sharp(source).metadata();item.width=metadata.width;item.height=metadata.height;
   const previewName=entry.name+'--'+file.name+'.webp',destination=path.join(previews,previewName);
   let cached=false;try{cached=(await fs.stat(destination)).mtimeMs>=stat.mtimeMs}catch{}
   if(!cached)await sharp(source).rotate().resize({width:384,height:384,fit:'inside',withoutEnlargement:true}).webp({quality:92,effort:4}).toFile(destination);
   item.preview='cube-previews/'+encodeURIComponent(previewName);
  }
  media.push(item);
 }
 return {slug:entry.name.trim().replaceAll(',','').replace(/\s+/g,'-'),folder:entry.name,title:info.title||entry.name.replaceAll('-',' '),description:info.description||'',category:info.category||'',year:info.year||'2026',media};
}));
if(new Set(projects.map(p=>p.slug)).size!==projects.length)throw Error('Project names produce duplicate URLs. Rename one of the conflicting folders.');
await fs.writeFile(path.join(root,'projects.json'),JSON.stringify(projects));
const pages=path.join(root,'.pages');await fs.mkdir(pages,{recursive:true});
const html=await fs.readFile(path.join(root,'index.html'),'utf8');
for(const project of projects){
 if(['projects','cube-previews','.github','.pages','node_modules'].includes(project.slug))throw Error('Reserved project folder name: '+project.slug);
 const page=path.join(pages,project.slug);await fs.mkdir(page,{recursive:true});
 const escaped=project.slug.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
 await fs.writeFile(path.join(page,'index.html'),html.replace('<html lang="pt-BR">',`<html lang="pt-BR" data-project="${escaped}">`).replace('<head>','<head><base href="../">'));
}
console.log(`Catalog: ${projects.length} projects, ${projects.reduce((n,p)=>n+p.media.length,0)} media, ${(bytes/1024**3).toFixed(3)} GiB`);
if(bytes>950*1024**2)console.warn('Media are close to the GitHub Pages 1 GB published-site limit. Consider external media storage before adding more.');



