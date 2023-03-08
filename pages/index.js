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
    const [names, setNames] = useState({main:0});
    
    function handleStack() {
        if(listpointer>=list.length) {setErr(["The program has ended"]);return;}
        x86.execAll(list.slice(listpointer));
        setRegs(x86.intRegisters.slice(0));
        setP(list.length);
    }
    function handleNext() {
        if(listpointer>=list.length) {setErr(["The program has ended"]);return;}
        var j=1;
        if(list[listpointer][1]==="call") {
            x86.exec([list[listpointer][0],list[listpointer][1],names[list[listpointer][2]]]);
            for(let i=listpointer;i<list.length;i++) {
                if (list[i][0]!=names[list[listpointer][2]]) j++;
                else {i=list.length;j--;};
            }
        } else {
            x86.exec(list[listpointer]);
        } 
        x86.rip=list[listpointer+j][0];
        setP(listpointer+j);
        if(list[listpointer]==undefined) {setErr(["The program has ended"]);return;}
        listChange(list);
        setRegs(x86.intRegisters.slice(0));
    }
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        x86.rip = 0; setP(x86.rip);
        const obj = translatex86(input);
        setRegs(x86.intRegisters.slice(0));
        setErr(obj.errors.join("\n"));
        setList(obj.list);
        setNames(obj.names);
    }
    function listChange(list) {
        const h = [];
        list.forEach((line, ind) => {
            var prefix = " "; var thing = "main", sub = 0;
            if(ind==listpointer) {prefix=">"}
            for(const prop in names) {
                if(names[prop]<=line[0]) {thing = prop; sub = names[prop]}
            }
            var add = (line[0]-sub)===0 ? "" : "+"+(line[0]-sub);
            var hex = line[0].toString(16);
            var mid = " <"+thing+""+add+">  ";
            var vars = line.slice(2).join(",");
            if(hex.length!=12) {hex = ("0".repeat(12-hex.length)+hex);}
            if(mid.length!=16) {mid = (mid+" ".repeat(16-mid.length))}
            if(line[1]==="err") {h.push(prefix+"error")}
                else h.push(prefix+"0x"+hex+mid+line[1]+"   "+vars);
        });
        return h
    }
    return(
    <>
        <div className={styles.wrapper} style={{display:"none"}} >
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <button className={styles.headbutton}>Registers</button>
                </div>
            </div>
        </div>
        <h1>Piedrahita x86 Assembler Simulator</h1>
        <div className={styles.wrapper}>
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <div className={styles.headtitle}>Input</div>
                    <button className={styles.headbutton} onClick={handleSubmit}>Compile</button>
                </div>
                <div className={styles.segbody}>
                    <textarea spellCheck="false" className={styles.bodytext} style={{resize:"none", height:"100%"}} value={input} onChange={evt => handleInput(evt)}/>
                </div>
            </div>
            <div className={styles.vertseg}>
                <div className={styles.seghead}>
                    <div className={styles.headtitle}>Assembly</div>
                    <button className={styles.headbutton} onClick={handleStack}>Execute All</button>
                    <button className={styles.headbutton} onClick={handleNext}>Execute Line</button>
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
                    <div className={styles.register}>{"rip: "+" : "+x86.rip}</div>
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