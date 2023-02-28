import { use, useState } from "react"
import {x86,translatex86} from "/components/translatex86"
import styles from "/components/index.module.css"
/*
    CURRENT ORDER OF OPERATIONS
    -> Class cpu is defined with base functionality  -> ../components/cpu.js
    -> Class x86 is extended from class cpu, which transforms cpu functions into x86 compatible functions -> ../components/x86.js

    -> User types into input box and submits using button -> ../pages/index.js (current)
    -> Input is translated into functions defined in class declaration x86 -> ../components/translatex86.js
*/


export default function Home() {
    const [input, setInput] = useState("mov $5 %rax ") //Initial state
    const [regs, setRegs] = useState(x86.intRegisters)
    const [err, setErr] = useState("");
    const [list, setList] = useState([]);
    const [listpointer, setP] = useState(0);
    
    function handleStack() {
        if(listpointer>=list.length) {setErr(["The program has ended"]);return;}
        x86.execAll(list.slice(listpointer));
        setRegs(x86.intRegisters.slice(0));
        setP(list.length);
    }
    function handleNext() {
        if(listpointer>=list.length) {setErr(["The program has ended"]);return;}
        x86.exec(list[listpointer]);
        setP(listpointer+1);
        listChange(list);
        setRegs(x86.intRegisters.slice(0));
    }
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        const obj = translatex86(input);
        setRegs(x86.intRegisters.slice(0));
        setErr(obj.errors.join("\n"));
        setList(obj.list);
        setP(0);
    }
    function listChange(list) {
        const h = [];
        list.forEach((line, ind) => {
            var prefix = " ";
            if(ind==listpointer) {prefix=">"}
            var hex = line[0].toString(16);
            var mid = " <main+"+line[0]+">  ";
            var vars = line.slice(2).join(",");
            if(hex.length!=12) {hex = ("0".repeat(12-hex.length)+hex);}
            if(mid.length!=16) {mid = (mid+" ".repeat(16-mid.length))}
            h.push(prefix+"0x"+hex+mid+line[1]+"   "+vars);
        });
        return h
    }
    return(
    <>
        <h1>Piedrahita x86 Assembler Simulator</h1>
        <div className={styles.wrapper}>
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <div className={styles.headtitle}>Input</div>
                    <button className={styles.headbutton} onClick={handleSubmit}>Compile</button>
                </div>
                <div className={styles.segbody} style={{height:"85%"}}>
                    <textarea spellCheck="false" className={styles.bodytext} style={{resize:"none", height:"100%"}} value={input} onChange={evt => handleInput(evt)}/>
                </div>
            </div>
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <div className={styles.headtitle}>Assembly</div>
                    <button className={styles.headbutton} onClick={handleStack}>Execute All</button>
                    <button className={styles.headbutton} onClick={handleNext}>Execute Next</button>
                </div>
                <div className={styles.segbody}>
                    <textarea spellCheck="false" disabled className={styles.bodytext} style={{minWidth:"22rem"}} value={listChange(list).join("\n")} onChange={evt => handleInput(evt)}/>
                </div>
            </div>
        </div>
        <div className={styles.wrapper}>
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <div className={styles.headtitle}>Output Console</div>
                </div>
                <div className={styles.segbody}>
                <textarea disabled className={styles.bodytext} value={err}></textarea>
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
        <h2>1 Kilobyte of Memory</h2>
    </>
    )
}