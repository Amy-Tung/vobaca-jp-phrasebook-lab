(()=>{
  "use strict";
  const STORE={tags:"vobaca:preview:customTags:v1",links:"vobaca:preview:phraseTags:v1"};
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key));return v??fallback}catch{return fallback}};
  let customTags=read(STORE.tags,[]);
  let phraseTags=read(STORE.links,{});
  let activeCustomTag=null;
  const phraseId=p=>{let h=2166136261;for(let i=0;i<p.j.length;i++){h^=p.j.charCodeAt(i);h=Math.imul(h,16777619)}return `p-${(h>>>0).toString(36)}`};
  const save=()=>{try{localStorage.setItem(STORE.tags,JSON.stringify(customTags));localStorage.setItem(STORE.links,JSON.stringify(phraseTags));return true}catch{showToast("無法儲存，請確認瀏覽器允許網站資料");return false}};
  const tagById=id=>customTags.find(t=>t.id===id);
  const escAttr=s=>esc(String(s));

  const style=document.createElement("style");
  style.textContent=`
    .lab-badge{display:inline-flex;align-items:center;min-height:24px;padding:2px 8px;border-radius:7px;background:var(--orange-soft);color:var(--orange);font-size:12px;font-weight:760;white-space:nowrap}
    .custom-tags-bar{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-top:12px;margin-top:12px;border-top:1px solid var(--border)}
    .custom-tags-main{min-width:0;flex:1}.custom-tags-label{display:block;color:var(--muted);font-size:13px;font-weight:760;margin-bottom:7px}
    .custom-tag-filters{display:flex;gap:8px;overflow:auto;scrollbar-width:thin;padding-bottom:2px}.tag-filter,.manage-tags-btn,.assign-tag-btn,.dialog-btn{min-height:40px;border:1px solid var(--border);background:var(--bg);border-radius:9px;padding:0 12px;cursor:pointer;font-weight:650}
    .tag-filter{white-space:nowrap;color:var(--muted)}.tag-filter[aria-pressed="true"]{background:var(--green-soft);border-color:var(--green);color:var(--green)}
    .manage-tags-btn{flex:0 0 auto;color:var(--blue)}.tag-filter:focus-visible,.manage-tags-btn:focus-visible,.assign-tag-btn:focus-visible,.dialog-btn:focus-visible{outline:3px solid color-mix(in srgb,var(--blue) 30%,transparent);outline-offset:2px}
    .personal-tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:12px}.personal-tag{display:inline-flex;align-items:center;min-height:26px;padding:2px 8px;border-radius:7px;background:var(--green-soft);color:var(--green);font-size:12px;font-weight:740}
    .card-tag-tools{display:flex;justify-content:flex-end;margin-top:12px}.assign-tag-btn{min-height:38px;color:var(--blue);background:var(--blue-soft)}
    .tag-dialog{width:min(560px,calc(100% - 32px));max-height:min(720px,calc(100vh - 32px));border:1px solid var(--border);border-radius:14px;background:var(--bg);color:var(--text);padding:0;box-shadow:0 18px 60px rgba(0,0,0,.22)}
    .tag-dialog::backdrop{background:rgba(0,0,0,.42);backdrop-filter:blur(3px)}.dialog-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:20px;border-bottom:1px solid var(--border)}
    .dialog-head h2{font-size:21px;line-height:1.3;margin:0}.dialog-close{width:44px;height:44px;border:1px solid var(--border);border-radius:9px;background:var(--bg);cursor:pointer;flex:0 0 auto}.dialog-body{padding:20px;overflow:auto}
    .tag-checks{display:grid;gap:8px}.tag-check{display:flex;align-items:center;gap:10px;min-height:46px;padding:8px 12px;border:1px solid var(--border);border-radius:9px}.tag-check input{width:20px;height:20px}
    .new-tag-row{display:flex;gap:8px;margin-top:16px}.new-tag-row input{min-width:0;flex:1;height:44px;border:1px solid var(--border);border-radius:9px;background:var(--bg);color:var(--text);padding:0 12px}
    .dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:20px}.dialog-btn.primary{background:var(--blue);border-color:var(--blue);color:white}.dialog-btn.danger{color:var(--red)}
    .manage-list{display:grid;gap:8px}.manage-row{display:flex;align-items:center;gap:8px;min-height:48px;padding:8px 10px;border:1px solid var(--border);border-radius:9px}.manage-row strong{min-width:0;flex:1;overflow-wrap:anywhere}.manage-row button{min-height:36px;border:1px solid var(--border);background:var(--bg);border-radius:8px;padding:0 10px;cursor:pointer}
    .backup-actions{display:flex;flex-wrap:wrap;gap:8px;padding-top:18px;margin-top:18px;border-top:1px solid var(--border)}.dialog-note{color:var(--muted);font-size:14px;margin:0 0 14px}.empty-tags{color:var(--muted);padding:14px 0}
    @media(max-width:760px){.custom-tags-bar{display:block}.manage-tags-btn{width:100%;margin-top:10px}.tag-dialog{width:calc(100% - 24px)}.dialog-head,.dialog-body{padding:16px}.manage-row{align-items:flex-start;flex-wrap:wrap}.manage-row strong{flex-basis:100%}.new-tag-row{flex-direction:column}.new-tag-row .dialog-btn{width:100%}}
    @media print{.custom-tags-bar,.card-tag-tools,.personal-tags,.tag-dialog,.lab-badge{display:none!important}}
  `;
  document.head.appendChild(style);

  const brand=document.querySelector(".brand");
  const badge=document.createElement("span");badge.className="lab-badge";badge.textContent="實驗室預覽版";brand.appendChild(badge);
  const topManage=document.createElement("button");topManage.className="icon-btn";topManage.id="tagManagerTop";topManage.title="管理我的標籤";topManage.setAttribute("aria-label","管理我的標籤");topManage.textContent="🏷️";
  document.querySelector(".top-actions").prepend(topManage);

  const customBar=document.createElement("div");customBar.className="custom-tags-bar";
  customBar.innerHTML=`<div class="custom-tags-main"><span class="custom-tags-label">我的標籤</span><div class="custom-tag-filters" id="customTagFilters"></div></div><button class="manage-tags-btn" id="manageTagsBtn">管理標籤</button>`;
  document.querySelector(".controls").appendChild(customBar);

  document.body.insertAdjacentHTML("beforeend",`<dialog class="tag-dialog" id="tagDialog"><div class="dialog-head"><h2 id="tagDialogTitle"></h2><button class="dialog-close" id="tagDialogClose" aria-label="關閉">✕</button></div><div class="dialog-body" id="tagDialogBody"></div></dialog><input id="tagImport" type="file" accept="application/json" hidden>`);
  const dialog=document.getElementById("tagDialog"),dialogTitle=document.getElementById("tagDialogTitle"),dialogBody=document.getElementById("tagDialogBody");
  document.getElementById("tagDialogClose").addEventListener("click",()=>dialog.close());

  function createTag(name){
    name=name.trim().slice(0,24);
    if(!name){showToast("請輸入標籤名稱");return null}
    const same=customTags.find(t=>t.name.toLowerCase()===name.toLowerCase());
    if(same){showToast("已經有同名標籤");return same}
    if(customTags.length>=20){showToast("最多建立 20 個標籤");return null}
    const tag={id:`t-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,6)}`,name};customTags.push(tag);save();return tag;
  }
  function removeTag(id){
    const tag=tagById(id);if(!tag||!confirm(`確定刪除「${tag.name}」嗎？句子不會被刪除。`))return;
    customTags=customTags.filter(t=>t.id!==id);Object.keys(phraseTags).forEach(k=>{phraseTags[k]=(phraseTags[k]||[]).filter(x=>x!==id);if(!phraseTags[k].length)delete phraseTags[k]});if(activeCustomTag===id)activeCustomTag=null;save();render();openManager();
  }
  function renameTag(id){
    const tag=tagById(id);if(!tag)return;const name=prompt("新的標籤名稱",tag.name);if(name===null)return;const clean=name.trim().slice(0,24);if(!clean){showToast("標籤名稱不能空白");return}if(customTags.some(t=>t.id!==id&&t.name.toLowerCase()===clean.toLowerCase())){showToast("已經有同名標籤");return}tag.name=clean;save();render();openManager();
  }
  function renderTagFilters(){
    const box=document.getElementById("customTagFilters");
    if(!customTags.length){box.innerHTML=`<span class="empty-tags">尚未建立標籤</span>`;return}
    box.innerHTML=customTags.map(t=>{const n=phrases.filter(p=>(phraseTags[phraseId(p)]||[]).includes(t.id)).length;return `<button class="tag-filter" data-custom-tag="${escAttr(t.id)}" aria-pressed="${activeCustomTag===t.id}">${esc(t.name)} · ${n}</button>`}).join("");
    box.querySelectorAll("[data-custom-tag]").forEach(b=>b.addEventListener("click",()=>{activeCustomTag=activeCustomTag===b.dataset.customTag?null:b.dataset.customTag;active="all";essentialOnly=false;document.getElementById("essentialsBtn").style.background="";renderChips();render()}));
  }
  function openAssign(p){
    const pid=phraseId(p),selected=new Set(phraseTags[pid]||[]);dialogTitle.textContent=`${p.z}：我的標籤`;
    const draw=()=>{dialogBody.innerHTML=`<p class="dialog-note">同一句可以選擇多個標籤。資料只會保存在這個瀏覽器。</p><div class="tag-checks">${customTags.length?customTags.map(t=>`<label class="tag-check"><input type="checkbox" value="${escAttr(t.id)}" ${selected.has(t.id)?"checked":""}><span>${esc(t.name)}</span></label>`).join(""):`<div class="empty-tags">尚未建立標籤，請先在下方建立。</div>`}</div><div class="new-tag-row"><input id="assignNewTag" maxlength="24" placeholder="建立新標籤"><button class="dialog-btn" id="assignCreate">建立</button></div><div class="dialog-actions"><button class="dialog-btn" id="assignCancel">取消</button><button class="dialog-btn primary" id="assignSave">儲存</button></div>`;
      dialogBody.querySelectorAll("input[type=checkbox]").forEach(c=>c.addEventListener("change",()=>c.checked?selected.add(c.value):selected.delete(c.value)));
      document.getElementById("assignCreate").onclick=()=>{const t=createTag(document.getElementById("assignNewTag").value);if(t){selected.add(t.id);draw()}};
      document.getElementById("assignCancel").onclick=()=>dialog.close();
      document.getElementById("assignSave").onclick=()=>{if(selected.size)phraseTags[pid]=[...selected];else delete phraseTags[pid];save();dialog.close();render();showToast("標籤已更新")};
    };draw();dialog.showModal();
  }
  function openManager(){
    dialogTitle.textContent="管理我的標籤";
    dialogBody.innerHTML=`<p class="dialog-note">最多建立 20 個標籤。重新命名不會影響已標記的句子。</p><div class="manage-list">${customTags.length?customTags.map(t=>`<div class="manage-row"><strong>${esc(t.name)}</strong><button data-rename="${escAttr(t.id)}">重新命名</button><button class="dialog-btn danger" data-delete="${escAttr(t.id)}">刪除</button></div>`).join(""):`<div class="empty-tags">目前沒有自訂標籤。</div>`}</div><div class="new-tag-row"><input id="managerNewTag" maxlength="24" placeholder="輸入新標籤名稱"><button class="dialog-btn primary" id="managerCreate">建立標籤</button></div><div class="backup-actions"><button class="dialog-btn" id="exportTags">匯出備份</button><button class="dialog-btn" id="importTags">匯入備份</button></div>`;
    dialogBody.querySelectorAll("[data-rename]").forEach(b=>b.onclick=()=>renameTag(b.dataset.rename));dialogBody.querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>removeTag(b.dataset.delete));
    document.getElementById("managerCreate").onclick=()=>{const t=createTag(document.getElementById("managerNewTag").value);if(t){render();openManager()}};
    document.getElementById("exportTags").onclick=exportData;document.getElementById("importTags").onclick=()=>document.getElementById("tagImport").click();
    if(!dialog.open)dialog.showModal();
  }
  function exportData(){
    const data={app:"vobaca-jp-phrasebook-lab",version:1,exportedAt:new Date().toISOString(),customTags,phraseTags};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="vobaca-tags-backup.json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast("備份已匯出");
  }
  document.getElementById("tagImport").addEventListener("change",async e=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());if(data.app!=="vobaca-jp-phrasebook-lab"||data.version!==1||!Array.isArray(data.customTags)||typeof data.phraseTags!=="object")throw new Error();customTags=data.customTags.slice(0,20).filter(t=>t&&typeof t.id==="string"&&typeof t.name==="string");phraseTags=data.phraseTags||{};activeCustomTag=null;save();render();openManager();showToast("備份已匯入")}catch{showToast("無法匯入：檔案格式不正確")}finally{e.target.value=""}});

  const originalFiltered=filtered;
  filtered=function(){const data=originalFiltered();return activeCustomTag?data.filter(p=>(phraseTags[phraseId(p)]||[]).includes(activeCustomTag)):data};
  render=function(){
    const data=filtered(),selectedTag=activeCustomTag&&tagById(activeCustomTag);
    sectionTitle.textContent=selectedTag?`標籤：${selectedTag.name}`:(essentialOnly?"最低限度必背":names[active]);
    count.textContent=`${data.length} 句`;clear.style.display=search.value?"block":"none";empty.style.display=data.length?"none":"block";
    grid.innerHTML=data.map(p=>{const pid=phraseId(p),tags=(phraseTags[pid]||[]).map(tagById).filter(Boolean);return `<article class="phrase-card ${p.e?"essential":""}"><span class="tag">${p.e?"★ 必背 · ":""}${esc(names[p.c])}</span><div class="card-actions"><button class="speak-btn" data-speak="${escAttr(p.j)}" aria-label="播放日文：${escAttr(p.j)}" title="播放日文">🔊</button><button class="copy-btn" data-copy="${escAttr(p.j)}" aria-label="複製日文：${escAttr(p.j)}" title="複製日文">複</button></div><div class="zh">${esc(p.z)}</div><div class="ja" lang="ja">${esc(p.j)}</div><div class="roma">${esc(p.r)}</div><div class="gesture"><span aria-hidden="true">☝️</span><span>${esc(p.g)}</span></div>${tags.length?`<div class="personal-tags">${tags.map(t=>`<span class="personal-tag">${esc(t.name)}</span>`).join("")}</div>`:""}<div class="card-tag-tools"><button class="assign-tag-btn" data-assign="${escAttr(pid)}">＋ 標籤</button></div></article>`}).join("");
    grid.querySelectorAll("[data-speak]").forEach(b=>b.addEventListener("click",()=>speak(b.dataset.speak)));grid.querySelectorAll("[data-copy]").forEach(b=>b.addEventListener("click",()=>copyText(b.dataset.copy)));grid.querySelectorAll("[data-assign]").forEach(b=>b.addEventListener("click",()=>{const p=phrases.find(x=>phraseId(x)===b.dataset.assign);if(p)openAssign(p)}));renderTagFilters();
  };
  document.getElementById("chips").addEventListener("click",()=>{activeCustomTag=null},true);document.getElementById("essentialsBtn").addEventListener("click",()=>{activeCustomTag=null},true);
  topManage.addEventListener("click",openManager);document.getElementById("manageTagsBtn").addEventListener("click",openManager);
  render();
})();
