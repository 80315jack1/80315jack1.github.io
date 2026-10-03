import {validatePatterns} from './board-model.mjs';
export function validateDataPackage(data){
 if(data?.format!=='personal-brain-data'||data.schemaVersion!==1)throw Error('請選擇 Personal Brain 資料包，不是 ID 清單或白板 JSON');
 const c=data.catalog;if(c?.schemaVersion!==1||!Array.isArray(c.topics)||!Array.isArray(c.materials)||!Array.isArray(c.source_messages)||!Array.isArray(c.source_documents))throw Error('素材資料格式不完整');
 const unique=(rows,key)=>{const ids=rows.map(r=>r[key]);if(ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length)throw Error('資料 ID 缺少或重複');return new Set(ids)};
 const topics=unique(c.topics,'id');unique(c.materials,'id');unique(c.source_messages,'message_id');
 const messages=new Map(c.source_messages.map(m=>[m.message_id,m]));
 for(const m of c.materials){if(!['EVENT','CONCLUSION','ANALYSIS'].includes(m.kind)||typeof m.text!=='string'||typeof m.title!=='string'||!['USER','ASSISTANT','INFERRED'].includes(m.speaker)||!Array.isArray(m.topic_ids)||m.topic_ids.some(id=>!topics.has(id))||!Array.isArray(m.sources))throw Error('素材類型或來源格式無效');for(const s of m.sources){if(s.source_kind==='user_request'){if(!s.source_excerpt||!c.source_documents.some(d=>d.text?.includes(s.source_excerpt)))throw Error('本人補充來源缺失');}else{const msg=messages.get(s.source_message_id);if(!msg||msg.conversation_id!==s.source_conversation_id||msg.speaker!==s.speaker||!s.source_excerpt||!msg.text?.includes(s.source_excerpt))throw Error('素材來源摘錄無法核對');}}}
 validatePatterns(data.patterns);for(const m of data.patterns.source_messages){const other=messages.get(m.message_id);if(!other||other.text!==m.text||other.conversation_id!==m.conversation_id||other.speaker!==m.speaker)throw Error('模式與素材的原始訊息不一致');}
 return data;
}
function openDB(){return new Promise((resolve,reject)=>{const req=indexedDB.open('personal-brain-private-data',1);req.onupgradeneeded=()=>req.result.createObjectStore('packages');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
export async function loadPackage(){const db=await openDB();try{return await new Promise((resolve,reject)=>{const req=db.transaction('packages').objectStore('packages').get('current');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}finally{db.close();}}
export async function savePackage(data){const db=await openDB();try{await new Promise((resolve,reject)=>{const tx=db.transaction('packages','readwrite');tx.objectStore('packages').put(data,'current');tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||Error('保存失敗'));});}finally{db.close();}}
