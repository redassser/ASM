import { useState } from "react"
import {x86,translatex86} from "../components/translatex86"
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
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        translatex86(input)
        setRegs(x86.intRegisters.slice(0))
    }
    return(
    <>
        <input type="text" value={input} onChange={evt => handleInput(evt)}/>
        <button onClick={handleSubmit}>Execute</button>
        <p>Below are the integer registers. Every number is a byte</p>
        <p>{regs.join(" ")}</p>
    </>
    )
}