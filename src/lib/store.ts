'use client';
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import {stages} from '@/data/lc75-curriculum';
interface Progress {learned:number[];walked:string[];solved:string[];completed:number[];activeStage:number;learn:(n:number)=>void;walk:(id:string)=>void;solve:(id:string)=>void;complete:(n:number)=>void;setStage:(n:number)=>void;reset:()=>void}
export const useProgress=create<Progress>()(persist((set)=>({learned:[],walked:[],solved:[],completed:[],activeStage:1,
 learn:n=>set(s=>n>=1&&n<=unlockedStage(s.completed)?{learned:[...new Set([...s.learned,n])]}:{}),
 walk:id=>set(s=>{const stage=stages.find(stage=>stage.pdfQuestions.some(q=>q.id===id));return stage&&s.learned.includes(stage.stageId)&&stage.stageId<=unlockedStage(s.completed)?{walked:[...new Set([...s.walked,id])]}:{}}),
 solve:id=>set(s=>{const stage=stages.find(stage=>[...stage.pdfQuestions,stage.variation].some(q=>q.id===id));return stage&&s.learned.includes(stage.stageId)&&stage.stageId<=unlockedStage(s.completed)&&stage.pdfQuestions.every(q=>s.walked.includes(q.id))?{solved:[...new Set([...s.solved,id])]}:{}}),
 complete:n=>set(s=>{const stage=stages[n-1];return stage&&n<=unlockedStage(s.completed)&&s.learned.includes(n)&&stage.pdfQuestions.every(q=>s.walked.includes(q.id))&&[...stage.pdfQuestions,stage.variation].every(q=>s.solved.includes(q.id))?{completed:[...new Set([...s.completed,n])]}:{}}),
 setStage:activeStage=>set(s=>activeStage>=1&&activeStage<=unlockedStage(s.completed)?{activeStage}:{}),
 reset:()=>set({learned:[],walked:[],solved:[],completed:[],activeStage:1})}),{name:'discrete-protocol-lc75-v1',version:1}));
export function unlockedStage(completed:number[]){let n=1;while(n<7&&completed.includes(n))n++;return n}
