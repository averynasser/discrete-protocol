'use client';
import katex from 'katex';
export default function MathText({value,block=false}:{value:string;block?:boolean}) {return <span className={block?'math-block':'math-inline'} dangerouslySetInnerHTML={{__html:katex.renderToString(value,{throwOnError:false,displayMode:block,strict:false,trust:false})}}/>}
