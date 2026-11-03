export function normalizeAnswer(value:string):string {
 return value.toLowerCase().trim().replace(/\\(?:left|right)/g,'').replace(/\\(?:cdot|times)/g,'*').replace(/\\neg\s*/g,'!').replace(/[’′]/g,"'").replace(/[−–]/g,'-').replace(/\\(?:emptyset|varnothing)|∅/g,'empty').replace(/\\(?:cup)|∪/g,'union').replace(/\\(?:cap)|∩/g,'intersection').replace(/\\[{}]/g,'').replace(/benar|true/g,'t').replace(/salah|false/g,'f').replace(/\s+/g,'').replace(/\.$/,'');
}
function setSignature(value:string):string|null {
 const text=normalizeAnswer(value);let index=0;
 function parse():string|null {
  if(text.slice(index,index+5)==='empty'){index+=5;return '{}'}
  if(text[index]==='{'){
   index++;const members:string[]=[];
   while(index<text.length&&text[index]!=='}'){
    const member=parse();if(member===null)return null;members.push(member);
    if(text[index]===',')index++;else if(text[index]!=='}')return null;
   }
   if(text[index]!=='}')return null;index++;return '{'+[...new Set(members)].sort().join(',')+'}';
  }
  const start=index;while(index<text.length&&!['{','}',','].includes(text[index]))index++;
  return index>start?text.slice(start,index):null;
 }
 if(text[0]!=='{'&&text!=='empty')return null;
 const result=parse();return index===text.length?result:null;
}
export function checkAnswer(input:string,answer:string,accepted:string[]=[]):boolean {
 if(!input.trim())return false;
 return [answer,...accepted].some(expected=>{
  if(normalizeAnswer(input)===normalizeAnswer(expected))return true;
  const b=setSignature(expected);const a=setSignature(input)??(b!==null&&!input.includes('{')?setSignature('{'+input+'}'):null);if(a!==null&&b!==null)return a===b;
  const numeric=/^-?\d+(?:[.,]\d+)?$/;
  if(numeric.test(input.trim())&&/^-?\d+(?:\.\d+)?$/.test(expected.trim()))return Math.abs(Number(input.trim().replace(',','.'))-Number(expected.trim()))<1e-9;
  return false;
 });
}
