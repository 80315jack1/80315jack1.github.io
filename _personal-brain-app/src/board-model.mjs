export const NOTE_KINDS=['TEXT','EVENT','CONCLUSION','ANALYSIS'];
export function emptyBoard(){return {schemaVersion:1,id:'my-whiteboard',owner:'USER',nodes:[],edges:[],viewport:{x:0,y:0,zoom:1}};}
export function validateBoard(board){
 if(!board||board.schemaVersion!==1||board.owner!=='USER'||!Array.isArray(board.nodes)||!Array.isArray(board.edges)||board.nodes.length>2000||board.edges.length>6000)throw Error('需要 Personal Brain 使用者白板 JSON');
 const ids=new Set();for(const n of board.nodes){if(typeof n.id!=='string'||!n.id||ids.has(n.id)||n.type!=='freeNote'||n.data?.createdBy!=='USER'||!NOTE_KINDS.includes(n.data.kind)||typeof n.data.text!=='string'||n.data.text.length>100000||!Number.isFinite(n.position?.x)||!Number.isFinite(n.position?.y))throw Error('白板文字、類型、位置或擁有者無效');ids.add(n.id);if(n.data.sources&&!Array.isArray(n.data.sources))throw Error('來源格式無效');}
 const es=new Set();for(const e of board.edges){if(typeof e.id!=='string'||es.has(e.id)||!ids.has(e.source)||!ids.has(e.target)||e.data?.createdBy!=='USER'||(e.label!=null&&typeof e.label!=='string'))throw Error('箭頭必須由使用者建立且連到既有文字');es.add(e.id);}
 const v=board.viewport;if(v&&(!Number.isFinite(v.x)||!Number.isFinite(v.y)||!Number.isFinite(v.zoom)||v.zoom<.1||v.zoom>3))throw Error('白板視角無效');return board;
}
export function makeNote(id,kind,text,position,material){
 if(!NOTE_KINDS.includes(kind))throw Error('文字類型無效');return {id,type:'freeNote',position,width:kind==='CONCLUSION'?340:300,data:{kind,text,createdBy:'USER',origin:material?'USER_PLACED_MATERIAL':'USER_CREATED',sources:material?structuredClone(material.sources||[]):[],originalText:material?.text,materialId:material?.id,materialSpeaker:material?.speaker,materialTitle:material?.title,edited:false}};
}
export function editNote(board,id,patch){return {...board,nodes:board.nodes.map(n=>n.id===id&&n.data.createdBy==='USER'?{...n,data:{...n.data,...patch,createdBy:'USER',sources:n.data.sources,originalText:n.data.originalText,edited:n.data.origin==='USER_PLACED_MATERIAL'&&(patch.text??n.data.text)!==n.data.originalText}}:n)};}
export function removeNote(board,id){const n=board.nodes.find(n=>n.id===id);if(n?.data.createdBy!=='USER')throw Error('只能移除本人放進白板的內容');return {...board,nodes:board.nodes.filter(n=>n.id!==id),edges:board.edges.filter(e=>e.source!==id&&e.target!==id)};}
export function serializeBoard(board){return {...board,nodes:board.nodes.map(n=>{const {selected,dragging,measured,...rest}=n;const {edit,openSources,...data}=rest.data;return {...rest,data};}),edges:board.edges.map(e=>{const {selected,...rest}=e;return rest;})};}
export function validatePatterns(data){
 if(data?.schemaVersion!==1||!Array.isArray(data.events)||!Array.isArray(data.patterns)||!Array.isArray(data.source_messages))throw Error('模式資料無效');
 const events=new Map(data.events.map(e=>[e.id,e]));if(events.size!==data.events.length)throw Error('事件 ID 不可重複');const messages=new Map(data.source_messages.map(m=>[m.message_id,m]));
 for(const e of events.values()){if(e.cycle?.length!==5||!e.sources?.length)throw Error('事件需要五個可見步驟與來源');for(const s of e.sources){const m=messages.get(s.source_message_id);if(!m||m.conversation_id!==s.source_conversation_id||m.speaker!==s.speaker||!s.source_excerpt||!m.text.includes(s.source_excerpt))throw Error('模式來源節錄核對失敗');}}
 for(const p of data.patterns){const ids=p.examples.map(e=>e.event_id);if(new Set(ids).size!==ids.length||ids.length<2||ids.length>5||ids.some(id=>!events.has(id))||p.status!=='CANDIDATE'||p.speaker!=='INFERRED')throw Error('模式候選需至少兩個不同實際事件');for(const c of p.counterexamples)if(!events.has(c.event_id))throw Error('反例事件缺失');}return data;
}
