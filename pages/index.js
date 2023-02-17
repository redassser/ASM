import { use, useState } from "react"
import {x86,translatex86} from "/components/translatex86"
import {stackx86} from "/components/stack"
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
        <h1>x86 Assembler</h1>
        {/* Text Input */}
        <button className={styles.submit} onClick={handleSubmit}>Compile and Move To Stack</button>
        <p className={styles.title}>Input</p>
        <div className={styles.regdiv}><textarea spellCheck="false" className={styles.input} value={input} onChange={evt => handleInput(evt)}/></div>
        {/* ASM Output */}
        <button className={styles.submit} onClick={handleStack}>Execute All</button>
        <button className={styles.submit} onClick={handleNext}>| Execute Next</button>
        <p className={styles.title}>Assembly</p>
        <div className={styles.regdiv}><textarea id="list" disabled className={styles.input} value={listChange(list).join("\n")}></textarea></div>
        {/* Output Console */}
        <p className={styles.title}>Output console</p>
        <div className={styles.regdiv}><textarea id="con" disabled className={styles.input} value={err}></textarea></div>
        {/* Integer Registers */}
        <p className={styles.title}>Integer Registers</p>
        <div className={styles.regdiv}>
            {x86.intregs.map((item,ind) => {
                const bytes = regs[ind], name = (item[0].length==3) ? item[0] : "`"+item[0];
                var hex = bytes.toString(16).toUpperCase(), bin = bytes.toString(10);
                if(hex.length<16) {hex="0".repeat(16-hex.length)+hex}
                return(<div className={styles.register} key={item[0]}>{name+" : 0x"+hex+" : "+bin}</div>)
            })}
        </div>
        {/* Vector Registers */}
        <p className={styles.title}>Vector Registers</p>
        <div className={styles.regdiv}>
            {x86.floatregs.map((item,ind) => {
                return(<div className={styles.register} key={item[0]}>{item[0]}</div>);
            })}
        </div>
    </>
    )
}