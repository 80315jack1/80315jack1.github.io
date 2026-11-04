export const storageKey='personal-brain-recollections-v1';
const isText=value=>typeof value==='string'&&value.trim().length>0;
export function parseTopics(text){
 const data=JSON.parse(text.replace(/^\uFEFF/,''));
 const topics=data?.topics;
 if(data?.format!=='personal-brain-recollections'||data.version!==1||!Array.isArray(topics)||!topics.length||topics.length>500)throw Error('請選擇議題整理 JSON。');
 const ids=new Set();
 for(const t of topics){
  if(!t||![t.id,t.title,t.description,t.model,t.open].every(isText)||ids.has(t.id)||!['脈絡整理','議題聚合'].includes(t.kind)||(t.kind==='脈絡整理'&&!isText(t.flow))||!Array.isArray(t.events)||!t.events.length||t.events.length>100)throw Error('議題格式不完整。');
  ids.add(t.id);
  for(const e of t.events)if(!e||!isText(e.date)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!isText(e.title)||['situation','thought','action','outcome','revision','quote'].some(k=>e[k]!=null&&!isText(e[k])))throw Error('事件格式不完整。');
 }
 return topics;
}
