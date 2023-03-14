import { useState } from "react"
import {x86,translatex86} from "/components/translatex86"
import styles from "/components/index.module.css"
/*
    CURRENT ORDER OF OPERATIONS
    -> Class cpu is defined with base functionality  -> ../components/cpu.js
    -> Class x86 is extended from class cpu, which transforms cpu functions into x86 compatible functions -> ../components/x86.js

    -> User types into input box and submits using button -> ../pages/index.js (current)
    -> Input is translated into functions defined in class declaration x86 -> ../components/translatex86.js
*/
const defaultcode = [    
    ".globl main",
    "main:",
        "mov $6, %rcx",
        "mov $7, %rdx",
        "call f",
        "ret",
    
        ".globl f",
    "f:",
        "mov %rdx, %rax",
        "add %rcx, %rax",
        "ret"
        ].join("\n")


export default function Home() {
    const [input, setInput] = useState(defaultcode); //Initial state
    const [regs, setRegs] = useState(x86.intRegisters);
    const [err, setErr] = useState("");
    const [list, setList] = useState({});
    const [names, setNames] = useState({main:0});
    const [settings, setSettings] = useState({memSize:32,bytePerLine:16,baseAddress:32});
    
    function handleStack() {
        if(x86.rip>=list.length) {setErr(["The program has ended"]);return;}
        x86.execAll(list,names);
    }
    function handleNext() {
        if(x86.rip>=list.length||x86.rip<0) {setErr(["The program has ended"]);return;}
        x86.exec(list[x86.rip],names);
        if(list[x86.rip]==undefined) {setErr(["The program has ended"]);return;}
        listChange(list);
        setRegs(x86.intRegisters.slice(0));
    }
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        x86.rip = 0; x86.movi(settings.memSize-8,"rsp")
        const obj = translatex86(input);
        setRegs(x86.intRegisters.slice(0));
        setErr(obj.errors.join("\n"));
        setList(obj.list);
        setNames(obj.names);
    }
    function listChange(list) {
        const h = [];
        for (const pointer in list) {
            var prefix = " "; var thing = "main", sub = 0;
            if(pointer==x86.rip) {prefix=">"}
            for(const prop in names)
                if(names[prop]<=pointer) {thing = prop; sub = names[prop]}
            var add = (pointer-sub)===0 ? "" : "+"+(pointer-sub);
            var hex = new Uint32Array([pointer]);
            hex = hex[0].toString(16);
            var mid = " <"+thing+""+add+">  ";
            var vars = list[pointer].slice(2);
            if(hex.length!=12) {hex = ("0".repeat(12-hex.length)+hex);}
            if(mid.length!=16) {mid = (mid+" ".repeat(16-mid.length))}
            if(list[pointer][1]==="err") {h.push(prefix+"error")}
                else h.push(prefix+"0x"+hex+mid+list[pointer][1]+"   "+vars);
        }
        return h
    }
    return(
    <>
        <div style={{float:"left"}}> 
            <div className={styles.wrapper} style={{display:"none"}} >
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <button className={styles.headbutton}>Registers</button>
                    </div>
                </div>
            </div>
            <h1><a href="https://github.com/redassser/ASM">Piedrahita x86 Assembler Simulator</a></h1>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Input</div>
                        <button className={styles.headbutton} onClick={handleSubmit}>Compile</button>
                    </div>
                    <div className={styles.segbody}>
                        <textarea spellCheck="false" className={styles.bodytext} style={{minWidth:"19rem"}} value={input} onChange={evt => handleInput(evt)}/>
                    </div>
                </div>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Assembly</div>
                        <button className={styles.headbutton} onClick={handleStack}>Execute All</button>
                        <button className={styles.headbutton} onClick={handleNext}>Execute Line</button>
                    </div>
                    <div className={styles.segbody}>
                        <textarea spellCheck="false" disabled className={styles.bodytext} style={{minWidth:"29rem",resize:"vertical"}} value={listChange(list).join("\n")} onChange={evt => handleInput(evt)}/>
                    </div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Output Console</div>
                    </div>
                    <div className={styles.segbody}>
                        <textarea disabled className={styles.bodytext} style={{minHeight:"5rem"}} value={err}></textarea>
                    </div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Integer Registers</div>
                    </div>
                    <div className={styles.segbody}>
                        {x86.intregs.map((item,ind) => {
                            const bytes = regs[ind], name = (item[0].length==3) ? item[0]+": " : item[0]+" : ";
                            var hex = bytes.toString(16).toUpperCase(), bin = bytes.toString(10);
                            if(hex.length<16) {hex="0".repeat(16-hex.length)+hex}
                            return(<div className={styles.register} key={item[0]}>{name+"0x"+hex+" : "+bin}</div>)
                        })}
                        <div className={styles.register}>{"rip: "+"0x"+x86.rip.toString(16)+" : "+x86.rip}</div>
                    </div>
                </div>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Vector Registers</div>
                    </div>
                    <div className={styles.segbody}>
                        {x86.floatregs.map((item,ind) => {
                            return(<div className={styles.register} key={item[0]}>{item[0]}</div>);
                        })}
                    </div>
                </div>
            </div>
        </div>
        <div style={{float:"right"}}>
            <h1>32B</h1>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Memory</div>
                    </div>
                    <div className={styles.segbody}>
                        {Array.from(x86.mem).map((item,ind) => {
                            return(<div className={styles.register} key={ind}>{item}</div>)
                        })}
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}
