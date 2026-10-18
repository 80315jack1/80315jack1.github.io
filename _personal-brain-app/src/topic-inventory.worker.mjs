import {buildInventory} from './topic-inventory.mjs';
self.onmessage=e=>{try{self.postMessage({result:buildInventory(e.data)});}catch(error){self.postMessage({error:error.message});}};
