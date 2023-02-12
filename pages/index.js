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
    const [stk, setStk] = useState([]);
    
    function handleStack() {
        x86.execAll(stk);
        setRegs(x86.intRegisters.slice(0));
    }
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        const obj = translatex86(input);
        setRegs(x86.intRegisters.slice(0));
        setErr(obj.errors.join("\n"));
        setStk(obj.stack);
    }
    return(
    <> 
        <h1>x86 Assembler</h1>
        {/* Text Input */}
        <button className={styles.submit} onClick={handleSubmit}>Compile and Move To Stack</button>
        <p className={styles.title}>Input</p>
        <div className={styles.regdiv}><textarea spellCheck="false" className={styles.input} value={input} onChange={evt => handleInput(evt)}/></div>
        {/* Stack Output */}
        <button className={styles.submit} onClick={handleStack}>Execute All</button>
        <p className={styles.title}>Stack</p>
        <div className={styles.regdiv}><textarea id="stk" disabled className={styles.input} value={stk.join("\n")}></textarea></div>
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