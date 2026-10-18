export const conversationId=c=>c.conversation_id||c.id;
export function activeNodes(c){
 const mapping=c.mapping;let cursor=c.current_node;const seen=new Set(),nodes=[];
 if(!mapping||typeof mapping!=='object'||Array.isArray(mapping)||typeof cursor!=='string'||!Object.hasOwn(mapping,cursor))throw Error('對話缺少有效 current_node，無法判定目前分支');
 while(cursor!=null){if(typeof cursor!=='string'||seen.has(cursor)||!Object.hasOwn(mapping,cursor))throw Error('對話分支有循環或缺少父節點');seen.add(cursor);const node=mapping[cursor];if(!node||typeof node!=='object')throw Error('對話節點格式錯誤');nodes.push(node);cursor=node.parent;}
 return nodes.reverse();
}
export function validateGPTExport(rows){
 if(!Array.isArray(rows)||!rows.length)throw Error('GPT 對話檔應為非空對話陣列');
 const ids=new Set();for(const c of rows){const id=c&&conversationId(c);if(typeof id!=='string'||!id||ids.has(id))throw Error('對話 ID 缺少或重複');ids.add(id);activeNodes(c);}return rows;
}
export function visibleMessages(c){return activeNodes(c).flatMap(node=>{
 const m=node.message,meta=m?.metadata||{},content=m?.content||{};
 if(!m||!['user','assistant'].includes(m.author?.role)||meta.is_visually_hidden_from_conversation||['analysis','commentary','justify','confidence'].includes(m.channel??meta.channel)||['thoughts','reasoning_recap','reasoning','tool_result'].includes(content.content_type))return [];
 const parts=Array.isArray(content.parts)?content.parts:[];let text=parts.map(p=>typeof p==='string'?p:typeof p?.text==='string'?p.text:null).filter(t=>t!==null).join('\n');if(!text&&typeof content.text==='string')text=content.text;
 return [{id:m.id||node.id,role:m.author.role,time:m.create_time,text,contentType:content.content_type,hasNonText:parts.some(p=>typeof p!=='string'&&typeof p?.text!=='string')}];
 });}
export function mergeGPTExport(dataset,rows){validateGPTExport(rows);const all=new Map((dataset.archive||[]).map(c=>[conversationId(c),c]));for(const c of rows)all.set(conversationId(c),c);return {...dataset,format:'personal-brain-data',schemaVersion:1,archive:[...all.values()]};}
