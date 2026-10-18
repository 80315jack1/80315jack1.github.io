import {conversationId,visibleMessages} from './gpt-import.mjs';
export const INVENTORY_VERSION=1;
const STOP=new Set(`就是 這個 那個 因為 所以 一個 覺得 知道 感覺 可能 好像 時候 然後 自己 今天 昨天 最近 其實 比較 但是 這樣 那樣 這些 那些 應該 可以 不會 什麼 怎麼 我們 你們 他們 現在 目前 後來 開始 已經 還是 如果 不是 沒有 真的 需要 一直 很多 事情 東西 問題 這邊 有點 一點 或是 也是 只是 有些 一下 一些 之後 一種 不同 例如 最後 看到 有時 繼續 想要 不能 這種 那種 其他 甚至 會不會 反而 到底 好的 不用 還有 之前 有沒有 一樣 是不是 不過 本來 一定 另外 兩個 有的 是要 當時 為什麼 什麽 為甚麼 而且 只有 這次 每個 跟我 多少 每天 那就 不錯 想到 像是 雖然 就會 怎樣 我會 我有 發現 地方 甚麼 想法 希望 確實 確定 對於 或者是 是說 方式 剛剛 你的 不想 幹嘛 也可以 更多 思考 也有 分析 這是 都是 之類 大家 非常 一次 人的 我知道 哈哈 出來 討論 回來 也會 這件事 很好 還要 狀態 遇到 喜歡 等等 具體 特別 直接 變成 來說 禮拜 建議 可是 反正 都不 那邊 會有 我不 真的是 建立 沒辦法 而已 做的 大概 議題 很難 關於 一起 一天 都會 看了 還在 時間 過程 繼續 或者 結果 這時 結論 實際 如何 是否 主要 部分 這裡 那裡 大家 感受 可能是 每次 所有 目前為止 我想 還沒 應該是 不一定 那麼 這麼 這就是 有什麼 這也 我覺得 我是 似乎 所謂 總是 很想 能夠 只能 完全 怎麼樣 我也 當然 大部分 我就 你就 我自己 你自己 同樣 蠻多 沒什麼 任何 不太 過去 一方面 突然 從來 重要 重點 這樣子 那樣子 基本上 之間 不知道 一個人 什麼時候 他人 別人 說的 說話 一件 今天是 有一個 有可能 接下來 可能有 一定要 當下 那個時候 感到 真的很 也不是 才會 不然 還不 一段 這幾天 說到 謝謝 嗎 就 我 你 他 她 它 我在 ok to the it is of not in get can with or do that and have but about you think like this my some just as when whether he will how for really has be so because on me out at an are was what why gpt chatgpt https http www com app ai mbti infp fi si lol qq`.split(/\s+/));
for(const word of `不要 我要 想說 的是 是的 那是 這是 不是說 有的是 有的時候 不管是 因為是 之所以 在這裡 在那裡 那也 這也 這次的 一條 來看 一個月 下去 起來 不到 那我 那你 這我 也想 去做 在想 做到 還是說 聽到 看完 說出 很大 很高 更多人 都要 在做 能不能 就在 有時候 也是說 相對 應該要 對我 對你 讓我 對他 不知道為什麼 怎麼辦 想想 所以說 聊聊 大家都 完整性 初始 通常 然而 既然 想著 我媽 不管 他說 我說 來講 在於 想像 一般 不如 接著 變得 應該會 也好 我來 可能會 有人 不喜歡 某些 致命 適時 第一 明天 很久 能說 只要有 那天 那時候 是有 找到 晚上 白天 下午 中午 禮拜六 星期 天啊 那時 不管怎樣 順便 這段 她是 不好 解決 了解 適合 認識`.split(/\s+/))STOP.add(word);
const ALIASES=new Map([['english','英文'],['australia','澳洲'],['英語','英文'],['ot','職能治療'],['職業治療','職能治療'],['关系','關係'],['英语','英文'],['学习','學習'],['担心','擔心'],['情绪','情緒'],['语言','語言'],['职业','職業'],['职能','職能']]);
const DAY=86400000;
function stamp(t){return typeof t==='number'&&Number.isFinite(t)?new Date(t*1000).toISOString():null;}
function day(t){return t?new Date(new Date(t).getTime()+8*3600000).toISOString().slice(0,10):null;}
function tokens(text,segmenter){return [...segmenter.segment(text)].filter(x=>x.isWordLike).map(x=>ALIASES.get(x.segment.toLowerCase())||x.segment.toLowerCase()).filter(t=>t.length>=2&&t.length<=16&&/\p{L}/u.test(t)&&!STOP.has(t));}
function excerpts(text){const result=[];const regex=/[^。！？!?\n]+[。！？!?]?/gu;for(const match of text.matchAll(regex)){const raw=match[0];for(let i=0;i<raw.length;i+=220){const s=raw.slice(i,i+220);const trim=s.trim();if(trim.length>=5)result.push({text:trim,offset:match.index+i+s.indexOf(trim)});}}return result;}
function intersection(a,b){let n=0;for(const x of a)if(b.has(x))n++;return n;}
function occurrenceStatus(dates,allDates){const unique=[...new Set(dates.filter(Boolean))].sort();if(unique.length<=1)return '一次性事件';const ref=allDates.at(-1),edge=new Date(ref).getTime()-28*DAY;const recent=unique.filter(d=>new Date(d).getTime()>=edge);const recentAll=allDates.filter(d=>new Date(d).getTime()>=edge);if(!recent.length&&recentAll.length>=3)return '近期減少';if(recent.length>=2&&new Date(unique.at(-1))-new Date(unique[0])>=14*DAY)return '持續中';return '反覆出現';}
function source(piece,record){return {conversation_id:record.id,conversation_title:record.title,message_id:piece.messageId,recorded_at:piece.time,date:day(piece.time),speaker:'USER',excerpt:piece.text,offset:piece.offset};}
export function reviewRecord(record,terms){
 const matching=record.pieces.filter(p=>p.tokens.some(t=>terms.includes(t)));const thought=/擔心|担心|害怕|焦慮|焦虑|期待|希望|猶豫|我想|我覺得|我觉得|不知道|想要|緊張|紧张/;
 const result=/後來.{0,30}(發現|發生|收到|回覆|去了|做了|完成|結束了)|實際上|實際(做|去|發生)|做完(了|之後|後)|完成了|結束後|結果.{0,15}(是|發現|成功|失敗)|我(今天|昨天).{0,12}(做了|去了|完成|收到)|收到.{0,8}(回覆|消息)/;const revision=/後來(才)?發現|原本.{0,60}(現在|後來|但是|其實)|以前.{0,60}(現在|後來)|改變了|修正了|重新理解|回頭看|原來.{0,20}(不是|其實|一直)/;
 const pick=(predicate)=>{const p=matching.find(predicate);return p?source(p,record):null;};
 const last=matching.filter(p=>result.test(p.text)&&!/如果|假如|希望|預計|會不會|可能|應該|明天|打算|將來/.test(p.text)).at(-1);
 return {conversationId:record.id,title:record.title,dateRange:[...new Set(matching.map(p=>day(p.time)).filter(Boolean))].sort(),recordedDate:record.date,sourceCount:matching.length,relatedTerms:[...new Set(matching.flatMap(p=>p.tokens))],
 situation:matching[0]?source(matching[0],record):null,thought:pick(p=>thought.test(p.text)),outcome:last?source(last,record):null,revision:pick(p=>revision.test(p.text)),sources:matching.slice(0,12).map(p=>source(p,record))};
}
export function buildInventory(archive){
 const segmenter=new Intl.Segmenter('zh-Hant',{granularity:'word'});const seen=new Set();
 const records=archive.filter(c=>{const id=conversationId(c);if(seen.has(id))return false;seen.add(id);return true;}).map(c=>{
  const messages=visibleMessages(c).filter(m=>m.role==='user'&&m.text.trim());const pieces=messages.flatMap(m=>excerpts(m.text).map(e=>({...e,messageId:m.id,time:stamp(m.time??c.create_time),tokens:tokens(e.text,segmenter)})));
  const counts=new Map();for(const p of pieces)for(const t of p.tokens)counts.set(t,(counts.get(t)||0)+1);
  return {id:conversationId(c),title:c.title||'未命名對話',date:day(stamp(c.create_time)),pieces,counts};
 });
 const useful=records.filter(r=>r.pieces.length);const dates=[...new Set(useful.flatMap(r=>r.pieces.map(p=>day(p.time))).filter(Boolean))].sort();const ref=dates.at(-1)||null;
 const terms=new Map();for(const r of useful)for(const [word,count] of r.counts){if(!terms.has(word))terms.set(word,{word,docs:new Set(),hits:0});const t=terms.get(word);t.docs.add(r.id);t.hits+=Math.min(count,8);}
 const candidates=[...terms.values()].filter(t=>(t.docs.size>=2||(t.docs.size===1&&t.hits>=3))&&t.docs.size<=Math.max(3,useful.length*.85)).map(t=>({...t,score:t.docs.size*Math.log2(2+t.hits/t.docs.size)*(t.word.length>=3?1.15:1)})).sort((a,b)=>b.score-a.score||a.word.localeCompare(b.word)).slice(0,90);
 const groups=[];
 for(const term of candidates){let group=groups.find(g=>intersection(g.docs,term.docs)/(g.docs.size+term.docs.size-intersection(g.docs,term.docs))>=.64);if(group){group.words.push(term);for(const id of term.docs)group.docs.add(id);}else groups.push({words:[term],docs:new Set(term.docs)});}
 const selected=[];
 for(const g of groups){if(selected.length>=10)break;const head=g.words[0];if(selected.some(other=>intersection(other.docs,g.docs)/Math.min(other.docs.size,g.docs.size)>.9&&g.docs.size<other.docs.size*.65))continue;selected.push(g);}
 const topics=selected.map((g,i)=>{
  const primary=g.words[0],related=useful.filter(r=>g.docs.has(r.id));const nearby=new Map();
  for(const r of related){const unique=new Set(r.pieces.filter(p=>p.tokens.some(t=>g.words.some(w=>w.word===t))).flatMap(p=>p.tokens));for(const t of unique)if(!g.words.some(w=>w.word===t)){nearby.set(t,(nearby.get(t)||0)+1);}}
  const sub=[...nearby].filter(([t,n])=>n>=Math.min(2,related.length)&&terms.get(t)?.docs.size<useful.length*.8).map(([t,n])=>({name:t,count:n,score:n*(.7+.3*Math.log(1+useful.length/(terms.get(t)?.docs.size||1)))})).sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name)).slice(0,6);
  const searchTerms=g.words.map(w=>w.word);const reviews=related.map(r=>reviewRecord(r,searchTerms)).sort((a,b)=>(b.dateRange.at(-1)||b.recordedDate||'').localeCompare(a.dateRange.at(-1)||a.recordedDate||''));
  const topicDates=[...new Set(reviews.flatMap(r=>r.dateRange))].sort();const last=topicDates.at(-1)||null;const recent=reviews.filter(r=>r.dateRange.some(d=>ref&&new Date(ref)-new Date(d)<=28*DAY)).length;
  const name=primary.word+(g.words[1]?' / '+g.words[1].word:'');
  return {id:'topic-'+primary.word,name,description:`圍繞${name}，反覆提到${sub.slice(0,3).map(s=>s.name).join("、")||"相關經驗與考量"}。`,terms:searchTerms,subtopics:sub.map(({name,count})=>({name,count})),dateRange:[topicDates[0]||null,last],recordCount:related.length,status:occurrenceStatus(topicDates,dates),recentCount:recent,rank:related.length*10+recent*2,relations:[],reviews};
 }).sort((a,b)=>b.rank-a.rank||a.name.localeCompare(b.name));
 for(const topic of topics){const own=new Set(topic.reviews.map(r=>r.conversationId));topic.relations=topics.filter(t=>t.id!==topic.id).map(t=>({id:t.id,name:t.name,sharedRecords:t.reviews.filter(r=>own.has(r.conversationId)).length})).filter(t=>t.sharedRecords>=2).sort((a,b)=>b.sharedRecords-a.sharedRecords).slice(0,3);}
 const covered=new Set(topics.flatMap(t=>t.reviews.map(r=>r.conversationId)));
 return {schemaVersion:INVENTORY_VERSION,method:'LOCAL_TEXT_ASSOCIATION',referenceDate:ref,totalRecords:records.length,userRecords:useful.length,coveredRecords:covered.size,unassignedRecords:useful.filter(r=>!covered.has(r.id)).map(r=>({id:r.id,title:r.title,date:r.date})),topics};
}
