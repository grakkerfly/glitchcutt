const cube=document.querySelector('#cube');
const projectHref=slug=>new URL(encodeURIComponent(slug)+'/',document.baseURI).href;
const rotations=['rotateY(0deg)','rotateY(90deg)','rotateY(180deg)','rotateY(-90deg)','rotateX(90deg)','rotateX(-90deg)'];
const faces=[];let projects=[];const wrap=document.querySelector('.cube-wrap'),home=document.querySelector('#home');
// Single-sided, separated plates on the six surfaces. No solid cubies.
for(const rotation of rotations){const surface=document.createElement('div');surface.className='plate-surface';surface.style.transform=rotation+' translateZ(136.8px)';const cells=[[0,0],[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]];for(const [xx,yy] of cells){const f=document.createElement('a');f.className='piece-face project-plate';f.style.transform=`translate3d(${xx*90}px,${yy*90}px,0)`;surface.append(f);faces.push(f)}cube.append(surface)}const sources=new Map();
const slides=[];
async function paint(){
 const projectImages=projects.map(project=>{const images=project.media.filter(m=>m.type==='image');const square=images.filter(m=>m.width&&m.height&&m.width/m.height>=.8&&m.width/m.height<=1.25);return {project,images:square.length?square:images}});
 // Shuffle slots once; every project receives two distinct plates.
 const slots=faces.map((_,i)=>i);for(let i=slots.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[slots[i],slots[j]]=[slots[j],slots[i]]}
 projectImages.slice(0,27).forEach(({project,images},index)=>{for(let copy=0;copy<2;copy++){const f=faces[slots[index*2+copy]];f.dataset.project=project.slug;f.href=projectHref(project.slug);f.setAttribute('aria-label',project.title);f.addEventListener('pointerenter',()=>{f.classList.add('plate-hover');cubeHovered=true;selectProject(project);showPlateInfo(project)});f.addEventListener('pointerleave',()=>{f.classList.remove('plate-hover');selectProject(null);showPlateInfo(null)});const usable=images.length?images:projectImages.find(p=>p.images.length)?.images||[];if(!usable.length)continue;images=usable;const first=copy%images.length;const img=new Image();img.fetchPriority="high";img.decoding="async";img.src=images[first].preview||images[first].src;img.alt='';img.draggable=false;f.append(img);if(images.length>1)slides.push({face:f,images,index:first,elapsed:0,duration:8000+(index%5)*500+copy*1100})}});
 faces.forEach(f=>{if(!f.dataset.project){f.classList.add('empty-plate');f.removeAttribute('href');f.setAttribute('aria-hidden','true')}});
}
let cubeHovered=false;
cube.addEventListener('pointerenter',()=>cubeHovered=true);cube.addEventListener('pointerleave',()=>{cubeHovered=false;selectProject(null);showPlateInfo(null);faces.forEach(f=>f.classList.remove('plate-hover'))});let px=.68,py=.46,vx=0,vy=0,lastTexture=0;let x=-25+Math.random()*50,y=Math.random()*360,dragging=false,lastX=0,lastY=0,selected=null,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,previous=0;
const toggle=document.querySelector('#motion-toggle');
function setPaused(){document.body.classList.toggle('paused',paused);toggle.textContent=paused?'resume motion ▷':'pause motion ‖';toggle.setAttribute('aria-pressed',String(paused))}setPaused();toggle.onclick=()=>{paused=!paused;setPaused()};
let dragDistance=0,pressedPlate=null;
cube.addEventListener('pointerdown',e=>{e.preventDefault();pressedPlate=e.target.closest(".project-plate[data-project]");dragDistance=0;dragging=true;lastX=e.clientX;lastY=e.clientY;cube.setPointerCapture(e.pointerId)});
cube.addEventListener('pointermove',e=>{if(!dragging)return;dragDistance+=Math.abs(e.clientX-lastX)+Math.abs(e.clientY-lastY);y+=(e.clientX-lastX)*.4;x-=(e.clientY-lastY)*.4;lastX=e.clientX;lastY=e.clientY});
cube.addEventListener('pointerup',e=>{dragging=false;if(dragDistance<5&&pressedPlate?.href){const destination=pressedPlate.href;pressedPlate=null;location.href=destination}else pressedPlate=null});for(const event of ['pointercancel','lostpointercapture'])cube.addEventListener(event,()=>{dragging=false;pressedPlate=null});
cube.addEventListener('dragstart',e=>e.preventDefault());
cube.addEventListener('click',e=>{if(dragDistance>4){e.preventDefault();e.stopPropagation()}},true);
cube.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();y+=e.key==='ArrowRight'?10:e.key==='ArrowLeft'?-10:0;x+=e.key==='ArrowUp'?10:e.key==='ArrowDown'?-10:0});
function animate(time){const delta=Math.min((time-previous)/1000,.05);previous=time;updateSlides(delta);const w=home.clientWidth,h=home.clientHeight,margin=Math.min(w*.35,205);if(!dragging&&!paused&&!cubeHovered&&selected===null&&!home.hidden){y+=delta*9.91875;x+=delta*9.91875;px+=vx*delta/w;py+=vy*delta/h;if(px*w<margin||px*w>w-margin){vx=-vx;px=Math.max(margin/w,Math.min(1-margin/w,px))}if(py*h<190||py*h>h-190){vy=-vy;py=Math.max(Math.min(190/h,.5),Math.min(Math.max(1-190/h,.5),py))}}wrap.style.left=px*w+'px';wrap.style.top=py*h+'px';cube.style.transform=`rotateX(${x}deg) rotateY(${y}deg)`;cube.setAttribute('aria-valuenow',String(Math.round((y%360+360)%360)));if(time-lastTexture>80){lastTexture=time;document.querySelectorAll('.piece-face canvas').forEach(c=>{const v=sources.get(c.dataset.source);if(v?.readyState>=2){const sz=Math.min(v.videoWidth,v.videoHeight);c.getContext('2d').drawImage(v,(v.videoWidth-sz)/2,(v.videoHeight-sz)/2,sz,sz,0,0,160,160)}})}requestAnimationFrame(animate)}requestAnimationFrame(animate);
function selectProject(project){selected=project?.slug??null;cube.classList.toggle('has-selection',selected!==null);faces.forEach(f=>f.classList.toggle('selected',selected!==null&&f.dataset.project===selected));}async function init(){try{const response=await fetch('projects.json');if(!response.ok)throw Error('Projects unavailable');projects=await response.json();document.querySelector('#project-count').textContent=String(projects.length).padStart(2,'0');const slug=document.documentElement.dataset.project||new URLSearchParams(location.search).get('project');if(slug){const project=projects.find(p=>p.slug===slug||p.folder===slug);document.querySelector('#home').hidden=true;document.querySelector('#project-page').hidden=false;document.querySelector('#detail-title').textContent=project?.title||'signal lost.';document.querySelector('#detail-code').textContent=project?project.category:'';document.querySelector('#detail-description').textContent=project?.description||'This transmission could not be found.';document.querySelector('#detail-year').textContent=project?.year||'';document.title='glitchcut - '+(project?.title||'Signal lost');createProjectRoom(project);return}paint(null);projects.forEach((p,i)=>{const a=document.createElement('a');a.className='project-link';a.href=projectHref(p.slug);const number=document.createElement('span');number.className='number';number.textContent=String(i+1).padStart(2,'0');const content=document.createElement('span');const title=document.createElement('span');title.className='name';title.textContent=p.title;const meta=document.createElement('span');meta.className='meta';meta.textContent='';content.append(title,meta);const arrow=document.createElement('span');arrow.className='arrow';arrow.textContent='↗';a.append(number,content,arrow);a.onmouseenter=()=>selectProject(p,i);a.onfocus=()=>selectProject(p,i);a.onmouseleave=()=>selectProject(null,null);a.onblur=()=>selectProject(null,null);document.querySelector('#projects').append(a)})}catch(error){document.querySelector('#projects').textContent='Start the local server to load the archive.';console.error(error)}}init();







function updateSlides(delta){if(paused||cubeHovered||selected!==null||document.hidden||home.hidden)return;for(const slide of slides){slide.elapsed+=delta*1000;if(slide.elapsed<slide.duration||slide.loading)continue;slide.elapsed=0;slide.loading=true;const nextIndex=(slide.index+1)%slide.images.length;const next=new Image();next.alt='';next.draggable=false;next.className='slide-next';next.onload=()=>{slide.face.append(next);requestAnimationFrame(()=>requestAnimationFrame(()=>next.classList.add('slide-visible')));setTimeout(()=>{for(const child of Array.from(slide.face.children))if(child!==next)child.remove();next.className='';slide.index=nextIndex;slide.loading=false},1400)};next.onerror=()=>{slide.loading=false};next.decoding="async";next.src=slide.images[nextIndex].preview||slide.images[nextIndex].src}}

function createProjectRoom(project){
 document.body.classList.add('project-room-page');if(sessionStorage.getItem('gallery-enter')){sessionStorage.removeItem('gallery-enter');document.body.classList.add('gallery-enter');setTimeout(()=>document.body.classList.remove('gallery-enter'),800)}const nextProject=projects[(projects.findIndex(p=>p.slug===project?.slug)+1)%projects.length];const nextGallery=document.createElement('a');nextGallery.className='next-gallery';nextGallery.textContent='next gallery →';nextGallery.href=projectHref(nextProject.slug);nextGallery.onclick=e=>{e.preventDefault();if(document.body.classList.contains('gallery-exit'))return;document.body.classList.add('gallery-exit');sessionStorage.setItem('gallery-enter','1');setTimeout(()=>location.href=nextGallery.href,matchMedia('(prefers-reduced-motion: reduce)').matches?0:550)};document.querySelector('#project-page').append(nextGallery);const gallery=document.querySelector('#gallery');gallery.replaceChildren();const room=document.createElement('div');room.className='media-room puzzle-room';gallery.append(room);document.querySelector('#detail-description').hidden=true;
 const media=project?.media||[],tiles=[];let pointerX=0,pointerY=0;
 const hint=document.createElement('div');hint.className='room-toolbar';hint.textContent='move to explore / click to view';gallery.append(hint);
 media.forEach((m,i)=>{const tile=document.createElement('button');tile.className='room-tile puzzle-tile';tile.setAttribute('aria-label','Open media '+(i+1));const el=document.createElement(m.type==='video'?'video':'img');el.src=m.src;el.draggable=false;el.alt='';if(m.type==='video'){el.muted=true;el.loop=true;el.playsInline=true;el.preload='metadata';el.autoplay=true;el.addEventListener('loadedmetadata',layout);const icon=document.createElement('span');icon.className='room-play';icon.textContent='▷';tile.append(icon)}else el.addEventListener('load',layout);tile.append(el);tile.onclick=()=>openMedia(m);room.append(tile);tiles.push({tile,el,index:i})});
 function layout(){const w=gallery.clientWidth,h=gallery.clientHeight,pad=window.innerWidth<600?22:50,top=65,bottom=50,availableW=w-pad*2,availableH=h-top-bottom;if(!tiles.length)return;const cols=Math.max(1,Math.ceil(Math.sqrt(tiles.length*availableW/availableH))),rows=Math.ceil(tiles.length/cols);const cw=availableW/cols,ch=availableH/rows,gap=Math.max(8,Math.min(25,cw*.12));const cells=[];const baseCount=Math.floor(tiles.length/rows),extra=tiles.length%rows;for(let row=0;row<rows;row++){const count=baseCount+(row<extra?1:0);const offset=(cols-count)/2;for(let col=0;col<count;col++){const centeredCol=col+offset;cells.push({col:centeredCol,row,d:Math.pow(centeredCol-(cols-1)/2,2)+Math.pow(row-(rows-1)/2,2)})}}cells.sort((a,b)=>a.d-b.d||a.row-b.row||a.col-b.col);tiles.forEach(({tile,el,index},i)=>{const c=cells[i],ratio=(el.naturalWidth||el.videoWidth||1)/(el.naturalHeight||el.videoHeight||1);const maxW=(cw-gap)*.88,maxH=(ch-gap)*.88;const tw=Math.min(maxW,maxH*ratio),th=tw/ratio;const jitterX=((index*7)%5-2)*Math.min(4,cw*.015),jitterY=((index*11)%5-2)*Math.min(4,ch*.015);tile.style.width=tw+'px';tile.style.height=th+'px';tile.style.left=(pad+(c.col+.5)*cw-tw/2+jitterX)+'px';tile.style.top=(top+(c.row+.5)*ch-th/2+jitterY)+'px';tile.dataset.depth=String(4+(index%4)*3);tile.dataset.curveX=String((c.col-(cols-1)/2)/Math.max(1,(cols-1)/2));tile.dataset.curveY=String((c.row-(rows-1)/2)/Math.max(1,(rows-1)/2))});parallax()}
 function parallax(){tiles.forEach(({tile,index})=>{const depth=Number(tile.dataset.depth)||4;tile.style.transform=`translate3d(${pointerX*depth}px,${pointerY*depth}px,0) rotateX(${Number(tile.dataset.curveY)*20-pointerY*3}deg) rotateY(${Number(tile.dataset.curveX)*-24+pointerX*4}deg)`})}
 function hitMedia(clientX,clientY){return tiles.find(({tile})=>{const rect=tile.getBoundingClientRect();return clientX>=rect.left&&clientX<=rect.right&&clientY>=rect.top&&clientY<=rect.bottom})?.tile||null}
 function highlightMedia(clientX,clientY){const hit=hitMedia(clientX,clientY);tiles.forEach(({tile})=>tile.classList.toggle('media-hover',tile===hit));gallery.style.cursor=hit?'pointer':'default';return hit}
 let pointerPressed=false,pressedTile=null,startPX=0,startPY=0;gallery.addEventListener('pointerdown',e=>{pointerPressed=true;pressedTile=highlightMedia(e.clientX,e.clientY);startPX=e.clientX;startPY=e.clientY});gallery.addEventListener('pointerup',e=>{pointerPressed=false;if(Math.hypot(e.clientX-startPX,e.clientY-startPY)<6){const hit=pressedTile||tiles.find(({tile})=>{const r=tile.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom})?.tile;if(hit)hit.click();pressedTile=null}});window.addEventListener('pointerup',()=>{pointerPressed=false;pressedTile=null});gallery.addEventListener('pointermove',e=>{highlightMedia(e.clientX,e.clientY);if(pointerPressed)return;const r=gallery.getBoundingClientRect();pointerX=(e.clientX-r.left)/r.width*2-1;pointerY=(e.clientY-r.top)/r.height*2-1;parallax()});gallery.addEventListener('pointerleave',()=>{tiles.forEach(({tile})=>tile.classList.remove('media-hover'));gallery.style.cursor='default';pointerX=pointerY=0;parallax()});window.addEventListener('resize',layout);layout();
 if(!media.length){const empty=document.createElement('p');empty.className='room-empty';empty.textContent='No media yet.';gallery.append(empty)}
 const dialog=document.createElement('dialog');dialog.className='media-viewer';dialog.setAttribute('aria-label','Project media viewer');
 const close=document.createElement('button');close.className='viewer-close';close.textContent='close ×';close.setAttribute('aria-label','Close media viewer');
 const previous=document.createElement('button');previous.className='viewer-prev';previous.textContent='previous';previous.setAttribute('aria-label','Previous media');
 const next=document.createElement('button');next.className='viewer-next';next.textContent='next';next.setAttribute('aria-label','Next media');
 const counter=document.createElement('span');counter.className='viewer-counter';counter.setAttribute('aria-live','polite');
 const content=document.createElement('div');content.className='viewer-content';dialog.append(close,previous,content,next,counter);document.body.append(dialog);let mediaIndex=0,openedAt=0;
 function renderMedia(){content.querySelector('video')?.pause();content.replaceChildren();const m=media[mediaIndex];if(!m)return;const el=document.createElement(m.type==='video'?'video':'img');el.src=m.src;if(m.type==='video'){el.controls=true;el.setAttribute("controlsList","nodownload noremoteplayback");el.disablePictureInPicture=true;el.playsInline=true;el.autoplay=true}else el.alt=project.title+' — '+(mediaIndex+1);content.append(el);counter.textContent=(mediaIndex+1)+' / '+media.length;previous.hidden=next.hidden=media.length<2}
 function moveMedia(step){mediaIndex=(mediaIndex+step+media.length)%media.length;renderMedia()}
 previous.onclick=()=>moveMedia(-1);next.onclick=()=>moveMedia(1);close.onclick=()=>dialog.close();
 dialog.addEventListener('click',e=>{if(performance.now()-openedAt>300&&(e.target===dialog||e.target===content))dialog.close()});
 dialog.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();moveMedia(e.key==='ArrowLeft'?-1:1)}});
 dialog.addEventListener('close',()=>{content.querySelector('video')?.pause();content.replaceChildren()});
 function openMedia(m){mediaIndex=media.indexOf(m);renderMedia();if(!dialog.open){openedAt=performance.now();dialog.showModal()}}}
const plateInfo=document.createElement('div');plateInfo.className='plate-info';plateInfo.hidden=true;document.querySelector('#home').append(plateInfo);
function showPlateInfo(project){plateInfo.hidden=!project;plateInfo.textContent=project?project.title+' ↗':''}
window.addEventListener('pointermove',e=>{const lightX=e.clientX/innerWidth*100,lightY=e.clientY/innerHeight*100;document.documentElement.style.setProperty('--light-x',lightX+'%');document.documentElement.style.setProperty('--light-y',lightY+'%')});












document.addEventListener('contextmenu',event=>{if(event.target.closest('img,video,.project-plate,.room-tile,.viewer-content'))event.preventDefault()});
document.addEventListener('dragstart',event=>{if(event.target.closest('img,video,.project-plate,.room-tile,.viewer-content'))event.preventDefault()});








