(()=>{
const $=s=>document.querySelector(s);
const el=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
const SESI=[
{kode:"s1",mulai:"07.30",akhir:"09.50",jam:[["07.30","08.40",1],["08.40","09.50",2]]},
{kode:"s2",mulai:"10.40",akhir:"13.00",jam:[["10.40","11.50",5],["11.50","13.00",6]]}
];
const BULAN=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
const SINGKAT={senin:"Sen",selasa:"Sel",rabu:"Rab",kamis:"Kam",jumat:"Jum"};
const TINGKAT=[["ALL","Semua"],["7","Kelas 7"],["8","Kelas 8"],["9","Kelas 9"]];
const SALAT={m:"09.50",a:"10.10",judul:"Salat Dhuha",sub:"Jam ke-3",jenis:"umum",tag:"Ibadah"};
const ISTIRAHAT={m:"10.10",a:"10.40",judul:"Istirahat",sub:"Jam ke-4",jenis:"umum",tag:"Rehat"};
const PEMBUKA={m:"07.00",a:"07.30",judul:"Morning Greeting",sub:"Sapaan pagi",jenis:"umum",tag:"Pembuka"};

HARI.forEach(h=>{h.t={s1:h.s1.split(" "),s2:h.s2.split(" ")}});

const state={hari:HARI[0].id,kelas:"ALL",tingkat:"ALL",cari:""};
const menit=t=>{const p=t.split(".");return +p[0]*60+ +p[1]};
const tgl=iso=>{const p=iso.split("-");return +p[2]+" "+BULAN[+p[1]-1]+" "+p[0]};
const hariDari=id=>HARI.find(h=>h.id===id);
const ambil=(h,k,i)=>{const t=h.t[k][i];if(!t||t==="x")return null;if(PRAKTIK[t])return{tipe:"praktik",kode:t};return{tipe:"tulis",n:t.split("-").map(Number)}};

const fmtJkt=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Jakarta",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});
const fmtLabel=new Intl.DateTimeFormat("id-ID",{timeZone:"Asia/Jakarta",weekday:"long",day:"numeric",month:"long",year:"numeric"});
function sekarang(){const o={};fmtJkt.formatToParts(new Date()).forEach(x=>{o[x.type]=x.value});return{tgl:o.year+"-"+o.month+"-"+o.day,menit:+o.hour*60+ +o.minute+ +o.second/60,jam:o.hour+":"+o.minute+":"+o.second}}

function agenda(h,kelas){
const i=KELAS.indexOf(kelas);const out=[PEMBUKA];let ada=false;
const tambah=s=>{
const t=ambil(h,s.kode,i);if(!t)return;ada=true;
if(t.tipe==="praktik"){const p=PRAKTIK[t.kode];out.push({m:s.mulai,a:s.akhir,judul:p.nama,sub:"Praktik · Jam ke-"+s.jam[0][2]+" sampai "+s.jam[1][2],jenis:"praktik",kode:t.kode,tag:"Praktik"})}
else s.jam.forEach((j,x)=>out.push({m:j[0],a:j[1],judul:MAPEL[t.n[x]],sub:"Mapel No. "+t.n[x]+" · Jam ke-"+j[2],jenis:"tulis",tag:"Jam "+j[2]}))
};
tambah(SESI[0]);
if(h.id!=="jumat"){out.push(SALAT,ISTIRAHAT);tambah(SESI[1])}
return{ada,out}
}

function statistik(h){
let pr=0,tu=0;const kl=new Set();
KELAS.forEach((k,i)=>SESI.forEach(s=>{if(h.id==="jumat"&&s.kode==="s2")return;const t=ambil(h,s.kode,i);if(!t)return;kl.add(k);if(t.tipe==="praktik")pr++;else tu++}));
return{pr,tu,kl:kl.size}
}

function hitung(e,target){
const mulai=performance.now();const dur=650;
const f=n=>{const p=Math.min(1,(n-mulai)/dur);e.textContent=Math.round(target*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)};
requestAnimationFrame(f)
}

function toast(teks){
let t=$(".toast");if(!t){t=el("div","toast");document.body.appendChild(t)}
t.textContent=teks;t.classList.add("tampil");clearTimeout(toast.id);toast.id=setTimeout(()=>t.classList.remove("tampil"),2200)
}

function bangunTabs(){
const w=$("#tabs");
HARI.forEach(h=>{
const b=el("button","tab");b.type="button";b.setAttribute("role","tab");b.dataset.id=h.id;
b.append(el("span","tab-n",SINGKAT[h.id]),el("b","tab-t",h.nama),el("span","tab-d",tgl(h.tanggal).split(" ").slice(0,2).join(" ")));
b.appendChild(el("i","hi"));
b.addEventListener("click",()=>{state.hari=h.id;render()});
w.appendChild(b)
})
}

function bangunTingkat(){
const w=$("#segTingkat");
TINGKAT.forEach(([v,l])=>{
const b=el("button","seg-b",l);b.type="button";b.dataset.v=v;
b.addEventListener("click",()=>{state.tingkat=v;if(state.kelas!=="ALL"&&v!=="ALL"&&state.kelas[0]!==v)state.kelas="ALL";render()});
w.appendChild(b)
})
}

function bangunChips(){
const w=$("#chips");
const semua=el("button","chip semua","Semua kelas");semua.type="button";semua.dataset.k="ALL";
semua.addEventListener("click",()=>{state.kelas="ALL";render()});
w.appendChild(semua);
KELAS.forEach(k=>{
const b=el("button","chip",k);b.type="button";b.dataset.k=k;b.dataset.t=k[0];
b.addEventListener("click",()=>{state.kelas=k;simpan();render()});
w.appendChild(b)
})
}

function simpan(){try{localStorage.setItem("smpbss-kelas",state.kelas)}catch(e){}}

function sinkron(){
try{history.replaceState(null,"","#"+state.hari+(state.kelas!=="ALL"?"/"+state.kelas:""))}catch(e){}
}

function sesiBaris(h,s,i){
const t=ambil(h,s.kode,i);
const r=el("div","sesi");r.dataset.m=s.mulai;r.dataset.a=s.akhir;
const k=el("div","sesi-k");
k.append(el("b","","Jam "+s.jam[0][2]+"–"+s.jam[1][2]),el("span","",s.mulai+" – "+s.akhir));
const v=el("div","sesi-v");
if(!t){v.appendChild(el("span","kosong","Tidak ada"))}
else if(t.tipe==="praktik"){const p=PRAKTIK[t.kode];const b=el("span","lencana-p",p.nama);b.style.setProperty("--pc",p.warna);v.append(b,el("small","","Praktik"))}
else t.n.forEach((n,x)=>{const c=el("span","mp");c.append(el("i","","J"+s.jam[x][2]),document.createTextNode(MAPEL[n]));v.appendChild(c)});
r.append(k,v);
return r
}

function cocok(h,i){
const q=state.cari.trim().toLowerCase();if(!q)return true;
let s=KELAS[i].toLowerCase();
SESI.forEach(x=>{if(h.id==="jumat"&&x.kode==="s2")return;const t=ambil(h,x.kode,i);if(!t)return;
if(t.tipe==="praktik")s+=" praktik "+PRAKTIK[t.kode].nama.toLowerCase()+" "+t.kode.toLowerCase()+" "+PRAKTIK[t.kode].penuh.toLowerCase();
else t.n.forEach(n=>{s+=" "+MAPEL[n].toLowerCase()})});
return s.includes(q)
}

function tampilSemua(v,h){
const g=el("div","grid");let n=0;
KELAS.forEach((k,i)=>{
if(state.tingkat!=="ALL"&&k[0]!==state.tingkat)return;
if(!cocok(h,i))return;
const c=el("article","kartu kelas");c.dataset.t=k[0];c.style.setProperty("--i",n++);
const hd=el("header","kelas-h");
hd.append(el("h3","",k),el("span","","Kelas "+k[0]));
const bd=el("div","kelas-b");
SESI.forEach(s=>{if(h.id==="jumat"&&s.kode==="s2")return;bd.appendChild(sesiBaris(h,s,i))});
const ft=el("button","lihat","Lihat linimasa");ft.type="button";
ft.addEventListener("click",()=>{state.kelas=k;simpan();render();window.scrollTo({top:0,behavior:"smooth"})});
c.append(hd,bd,ft);g.appendChild(c)
});
if(!n){const e=el("div","kosong-besar");e.append(el("h3","","Tidak ada hasil"),el("p","","Coba kata kunci lain atau ganti filter kelas."));v.appendChild(e);return}
v.appendChild(g)
}

function tampilKelas(v,h,k){
const a=agenda(h,k);
const kp=el("div","kartu kepala-kelas");kp.dataset.t=k[0];
const kiri=el("div","");kiri.append(el("span","lencana","Kelas "+k[0]),el("h2","",k),el("p","",h.nama+", "+tgl(h.tanggal)));
const bk=el("button","btn","Semua kelas");bk.type="button";
bk.addEventListener("click",()=>{state.kelas="ALL";render()});
kp.append(kiri,bk);v.appendChild(kp);
if(!a.ada){
const e=el("div","kosong-besar");e.append(el("h3","","Tidak ada jadwal"),el("p","","Kelas "+k+" tidak memiliki kegiatan SAT Praktik pada hari "+h.nama+"."));v.appendChild(e);return
}
const ul=el("ol","garis");
a.out.forEach((e,i)=>{
const li=el("li","ev "+e.jenis);li.dataset.m=e.m;li.dataset.a=e.a;li.style.setProperty("--i",i);
if(e.kode)li.style.setProperty("--pc",PRAKTIK[e.kode].warna);
const w=el("div","ev-w");w.append(el("b","",e.m),el("span","",e.a));
const d=el("div","ev-d");d.appendChild(el("i",""));
const b=el("div","ev-b");
b.append(el("span","ev-tag",e.tag),el("h3","",e.judul),el("p","",e.sub));
const bar=el("div","bar");bar.appendChild(el("i",""));b.appendChild(bar);
li.append(w,d,b);ul.appendChild(li)
});
v.appendChild(ul)
}

function render(){
const h=hariDari(state.hari);
document.querySelectorAll(".tab").forEach(b=>b.setAttribute("aria-selected",b.dataset.id===state.hari));
document.querySelectorAll(".seg-b").forEach(b=>b.classList.toggle("on",b.dataset.v===state.tingkat));
document.querySelectorAll(".chip").forEach(b=>{
const k=b.dataset.k;
b.hidden=k!=="ALL"&&state.tingkat!=="ALL"&&k[0]!==state.tingkat;
b.classList.toggle("on",k===state.kelas)
});
const st=statistik(h);
const sw=$("#statistik");sw.replaceChildren();
[["Sesi praktik",st.pr],["Sesi mapel",st.tu],["Kelas terlibat",st.kl]].forEach(([l,n])=>{
const c=el("div","stat");const b=el("b","","0");c.append(b,el("span","",l));sw.appendChild(c);hitung(b,n)
});
const v=$("#view");v.replaceChildren();
if(state.kelas==="ALL")tampilSemua(v,h);else tampilKelas(v,h,state.kelas);
sinkron();perbaruiAktif()
}

function perbaruiAktif(){
const now=sekarang();const h=hariDari(state.hari);const hariIni=h.tanggal===now.tgl;
document.querySelectorAll(".ev,.sesi").forEach(e=>{
const m=menit(e.dataset.m),a=menit(e.dataset.a);
const aktif=hariIni&&now.menit>=m&&now.menit<a;
const lewat=hariIni&&now.menit>=a;
e.classList.toggle("aktif",aktif);e.classList.toggle("lewat",lewat);
const bar=e.querySelector(".bar i");
if(bar)bar.style.width=aktif?((now.menit-m)/(a-m)*100).toFixed(1)+"%":(lewat?"100%":"0%")
});
document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("hari-ini",hariDari(b.dataset.id).tanggal===now.tgl));
perbaruiStatus(now)
}

function perbaruiStatus(now){
const s=$("#status");s.replaceChildren();
const idx=HARI.findIndex(x=>x.tanggal===now.tgl);
if(idx>=0){
s.appendChild(el("span","chip-s live","Hari ini · "+HARI[idx].nama+", "+tgl(HARI[idx].tanggal)));
if(state.kelas!=="ALL"){
const a=agenda(HARI[idx],state.kelas).out.find(e=>now.menit>=menit(e.m)&&now.menit<menit(e.a));
s.appendChild(el("span","chip-s",state.kelas+" · "+(a?"Sekarang: "+a.judul:"Tidak ada kegiatan saat ini")))
}
return
}
const depan=HARI.find(x=>x.tanggal>now.tgl);
if(depan){
const sel=Math.round((Date.parse(depan.tanggal)-Date.parse(now.tgl))/864e5);
s.appendChild(el("span","chip-s",sel+" hari lagi · "+depan.nama+", "+tgl(depan.tanggal)))
}else s.appendChild(el("span","chip-s","SAT Praktik telah selesai"))
}

function tick(){
const now=sekarang();
$("#jam").textContent=now.jam;
$("#jamTgl").textContent=fmtLabel.format(new Date());
}

function bangunLegenda(){
const w=$("#legendaIsi");
w.appendChild(el("h3","","Praktik"));
const a=el("ul","leg");
Object.keys(PRAKTIK).forEach(k=>{
const p=PRAKTIK[k];const li=el("li");const b=el("span","lencana-p",p.nama);b.style.setProperty("--pc",p.warna);
li.appendChild(b);if(p.penuh)li.appendChild(el("small","",p.penuh));a.appendChild(li)
});
w.appendChild(a);
w.appendChild(el("h3","","Nomor mata pelajaran"));
const b=el("ul","leg");
Object.keys(MAPEL).forEach(n=>{const li=el("li");li.append(el("span","no",n),el("small","",MAPEL[n]));b.appendChild(li)});
w.appendChild(b);
w.appendChild(el("p","cat","Angka pada tabel jadwal menunjukkan nomor mata pelajaran. Angka pertama untuk jam pertama sesi, angka kedua untuk jam kedua."))
}

function tema(){
const r=document.documentElement;
let t=null;try{t=localStorage.getItem("smpbss-tema")}catch(e){}
if(!t)t=matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";
r.dataset.theme=t;
$("#btnTema").addEventListener("click",()=>{
const n=r.dataset.theme==="dark"?"light":"dark";r.dataset.theme=n;
try{localStorage.setItem("smpbss-tema",n)}catch(e){}
})
}

function muatAwal(){
const now=sekarang();
const idx=HARI.findIndex(x=>x.tanggal===now.tgl);
if(idx>=0)state.hari=HARI[idx].id;
else if(now.tgl>HARI[HARI.length-1].tanggal)state.hari=HARI[HARI.length-1].id;
const p=location.hash.replace("#","").split("/");
if(p[0]&&hariDari(p[0]))state.hari=p[0];
if(p[1]&&KELAS.includes(p[1]))state.kelas=p[1];
else if(!p[0]){try{const k=localStorage.getItem("smpbss-kelas");if(k&&KELAS.includes(k))state.kelas=k}catch(e){}}
}

function partikel(){
const c=$("#partikel");
if(!c||matchMedia("(prefers-reduced-motion: reduce)").matches)return;
const x=c.getContext("2d");let w,h,pts;
const ukur=()=>{w=c.width=innerWidth;h=c.height=innerHeight;const n=Math.min(70,Math.floor(w*h/22000));pts=Array.from({length:n},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.6+.6}))};
const loop=()=>{
const col=getComputedStyle(document.documentElement).getPropertyValue("--partikel").trim()||"rgba(160,180,255,.5)";
x.clearRect(0,0,w,h);
pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.fillStyle=col;x.beginPath();x.arc(p.x,p.y,p.r,0,6.283);x.fill()});
for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){
const dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=dx*dx+dy*dy;
if(d<14000){x.globalAlpha=1-d/14000;x.strokeStyle=col;x.lineWidth=.6;x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke();x.globalAlpha=1}
}
requestAnimationFrame(loop)
};
ukur();addEventListener("resize",ukur);loop()
}

function init(){
tema();bangunTabs();bangunTingkat();bangunChips();bangunLegenda();muatAwal();
$("#cari").addEventListener("input",e=>{state.cari=e.target.value;if(state.kelas!=="ALL"&&state.cari){state.kelas="ALL"}render()});
$("#btnLegenda").addEventListener("click",()=>$("#legenda").showModal());
$("#tutup").addEventListener("click",()=>$("#legenda").close());
$("#legenda").addEventListener("click",e=>{if(e.target.id==="legenda")e.target.close()});
$("#btnCetak").addEventListener("click",()=>window.print());
$("#btnBagikan").addEventListener("click",async()=>{
const u=location.href;
if(navigator.share){try{await navigator.share({title:document.title,url:u});return}catch(e){}}
try{await navigator.clipboard.writeText(u);toast("Tautan disalin")}catch(e){toast("Salin tautan dari bilah alamat")}
});
addEventListener("keydown",e=>{
if(e.target.tagName==="INPUT")return;
const i=HARI.findIndex(x=>x.id===state.hari);
if(e.key==="ArrowRight"&&i<HARI.length-1){state.hari=HARI[i+1].id;render()}
if(e.key==="ArrowLeft"&&i>0){state.hari=HARI[i-1].id;render()}
if(e.key==="/"){e.preventDefault();$("#cari").focus()}
});
tick();render();
setInterval(tick,1000);
setInterval(perbaruiAktif,15000);
partikel()
}

init()
})();
