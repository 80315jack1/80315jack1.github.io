import React,{useEffect,useState} from 'react';
import {ArrowLeft,ArrowUpRight} from 'lucide-react';

import './topic-inventory.css';

const fields=[['situation','當時發生什麼'],['thought','我的想法／情緒'],['action','行動'],['outcome','後來實際發生什麼'],['revision','想法的修正']];
const dateLabel=date=>date.slice(5).replace('-','/');

const storageKey='personal-brain-recollections-v1';
const isText=value=>typeof value==='string'&&value.trim().length>0;
function parseTopics(text){
 const data=JSON.parse(text.replace(/^\uFEFF/,''));
 const topics=data?.topics;
 if(data?.format!=='personal-brain-recollections'||data.version!==1||!Array.isArray(topics)||!topics.length||topics.length>100)throw Error('請選擇議題整理 JSON。');
 const ids=new Set();
 for(const t of topics){
  if(!t||![t.id,t.title,t.description,t.model,t.open].every(isText)||ids.has(t.id)||!['脈絡整理','議題聚合'].includes(t.kind)||(t.kind==='脈絡整理'&&!isText(t.flow))||!Array.isArray(t.events)||!t.events.length||t.events.length>100)throw Error('議題格式不完整。');
  ids.add(t.id);
  for(const e of t.events)if(!e||!isText(e.date)||!/^\d{4}-\d{2}-\d{2}$/.test(e.date)||!isText(e.title)||[...fields.map(([k])=>k),'quote'].some(k=>e[k]!=null&&!isText(e[k])))throw Error('事件格式不完整。');
 }
 return topics;
}
export default function TopicInventory(){
 const [error,setError]=useState('');
 const [recollections,setRecollections]=useState(()=>{try{return parseTopics(localStorage.getItem(storageKey)||'null');}catch{return [];}});
 async function importTopics(e){
  const input=e.currentTarget,file=input.files?.[0];input.value='';
  if(!file)return;
  try{
   if(file.size>2*1024*1024)throw Error('議題整理檔需小於 2 MB。');
   const raw=await file.text(),topics=parseTopics(raw);
   localStorage.setItem(storageKey,raw);setRecollections(topics);setSelected(null);setError('');
  }catch(err){setError('匯入失敗：'+err.message);}
 }
 const [selected,setSelected]=useState(null);
 const topic=recollections.find(item=>item.id===selected);
 useEffect(()=>document.querySelector('.inventory-page')?.scrollTo(0,0),[selected]);
 if(!topic)return <main className="inventory-page"><header className="inventory-heading"><div><span className="inventory-eyebrow">議題盤點</span><h1>回想當時，我在處理什麼？</h1><p>跨日期的變化整理成脈絡；還沒有前後證據的，先把相關片段放在一起。</p></div></header><label className="recollection-import">匯入議題整理 JSON<input type="file" accept=".json,application/json" onChange={importTopics}/></label>{error&&<p role="alert">{error}</p>}{!recollections.length&&<section className="inventory-empty"><h2>帶入你的議題整理</h2><p>選擇議題整理 JSON，結果會保存在這個瀏覽器。</p></section>}<div className="cross-pattern-map">{recollections.map(item=><button className="cross-pattern-tile" key={item.id} onClick={()=>setSelected(item.id)}><div className="topic-tile-top"><span className="topic-status">{item.kind}</span></div><h2>{item.title}</h2><p>{item.description}</p><footer><span>{dateLabel(item.events[0].date)} – {dateLabel(item.events.at(-1).date)}</span><span>回看 <ArrowUpRight size={13}/></span></footer></button>)}</div><p className="review-boundary">匯入議題整理不會變更原始日記或白板。</p></main>;
 const thread=topic.kind==='脈絡整理';
 return <main className="inventory-page review-page">
  <div className="inventory-top"><button className="back-to-map" onClick={()=>setSelected(null)}><ArrowLeft size={16}/> 議題盤點</button><span>{topic.kind}</span></div>
  <header className="review-heading"><h1>{topic.title}</h1><p>{topic.description}</p><p className="review-boundary">日期採日記紀錄日期。</p></header>
  <section className="recollection-section"><h2>1. {thread?'事件時間線':'相關情境、想法與情緒'}</h2>
   <ol className="recollection-list">{topic.events.map(e=><li key={e.date+e.title}><h3><time dateTime={e.date}>{dateLabel(e.date)}</time>{e.title}</h3><dl>{fields.filter(([key])=>thread||e[key]).map(([key,label])=><React.Fragment key={key}><dt>{label}</dt><dd>{e[key]||'資料不足'}</dd></React.Fragment>)}</dl></li>)}</ol>
  </section>
  {thread&&<section className="recollection-section"><h2>2. 思考脈絡</h2><p>{topic.flow}</p></section>}
  <section className="recollection-section"><h2>{thread?'3.':'2.'} 當時最有感的句子</h2>{topic.events.filter(e=>e.quote).map(e=><blockquote key={e.date+e.title}>「{e.quote}」 <time dateTime={e.date}>{dateLabel(e.date)}</time></blockquote>)}</section>
  <section className="recollection-section"><h2>{thread?'4. 目前工作模型':'3. 可以一起看的問題'}</h2><p>{topic.model}</p></section>
  <section className="recollection-section"><h2>{thread?'5.':'4.'} 還沒解決／待驗證</h2><p>{topic.open}</p></section>
  {recollections.some(t=>t.id===topic.related)&&<button className="back-to-map" onClick={()=>setSelected(topic.related)}>看蘭嶼之後的變化 <ArrowUpRight size={13}/></button>}
 </main>;
}
