import { useState } from "react"
import {translatex86} from "/components/translatex86"
import x86cpu from "/components/x86"
import styles from "/components/index.module.css"
/*
    CURRENT ORDER OF OPERATIONS
    -> 
*/
const defaultcode = [    
    "   .globl main",
    "main:",
    "   mov $6, %rcx",
    "   mov $7, %rdx",
    "   call f",
    "   ret",
    
    "   .globl f",
    "f:",
    "   mov %rdx, %rax",
    "   add %rcx, %rax",
    "   ret"
        ].join("\n")
function Home() {
    const [x86, setCpu] = useState(new x86cpu(4096));
    const [input, setInput] = useState(defaultcode); //Initial state
    const [regs, setRegs] = useState(x86.intRegisters);
    const [err, setErr] = useState("");
    const [list, setList] = useState({});
    const [names, setNames] = useState({main:0});
    const [MemSettings, setMemSettings] = useState({displaySize:256,bytePerLine:16,grouping:8,baseAddress:32});
    const [StackSettings, setStackSettings] = useState({displaySize:64,bytePerLine:8,grouping:8,baseAddress:x86.memSize-64});
    
    function handleExec(opt) {
        if(x86.rip[0]>=list.length||x86.rip<0) {setErr(["The program has ended"]);return;}
        else if(opt==='n') x86.exec(list[x86.rip],names);
        else if(opt==='a') x86.execAll(list,names);
        setRegs(x86.intRegisters.slice(0));
        if(list[x86.rip]==undefined) {setErr(["The program has ended"]);return;}
    }
    function handleInput(evt) {
        setInput(evt.target.value);
    }
    function handleSubmit() {
        x86.rip = 0; x86.movi(x86.memSize-8,"rsp")
        const obj = translatex86(input);
        setRegs(x86.intRegisters.slice(0));
        setErr(obj.errors.join("\n"));
        setList(obj.list);
        setNames(obj.names);
    }
    function displayByteHex(val) {
        val=val.toString(16);
        if((val).length<2) {val="0"+(val)};
        return val;
    }
    function handleOpts(options,setting,type,func) {
        var optarray = [];
        for(const opt of options) {
            var pref = (opt===type[setting]) ? "> " : "";
            optarray.push(<button className={styles.option} key={opt} onClick={()=>{var newmem = {...type};newmem[setting]=opt;func(newmem);}}>{pref+opt+" Bytes"}</button>);
        }
        return optarray;
    }
    function handleMem(settings) {
        var memarray = [], j=1;
        for(let i=settings.baseAddress;i<settings.baseAddress+settings.displaySize;i+=settings.bytePerLine) {
            var address = i.toString(16);
            var hexstring = "";
            for(let j=settings.bytePerLine-1;j>=0;j--) {
                hexstring+=displayByteHex(x86.mem[i+j]);
                if(j%settings.grouping==0) {hexstring+=" "}
            }
            var prefix = (i==x86.intRegisters[x86.regPos("rsp")]) ? ">" : " ";
            if((address).length<8) {address="0".repeat(8-(address).length)+(address)}
            memarray.push(<div className={styles.register} key={i}>{prefix+address+": "+hexstring}</div>)
        }
        return memarray;
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
    <div className={styles.home}>
        <div className={styles.side}> 
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
                        <button className={styles.headbutton} onClick={()=>handleExec('a')}>Execute All</button>
                        <button className={styles.headbutton} onClick={()=>handleExec('n')}>Execute Line</button>
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
        <div className={styles.side}>
            <h1>Memory</h1>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead}>
                        <div className={styles.headtitle}>Stack</div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Bytes Per Row</div>
                            <div className={styles.dropoptions} style={{width:"103px"}}>
                                {handleOpts([32,16,8],"bytePerLine",StackSettings, setStackSettings)}
                            </div>
                        </div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Display Size</div>
                            <div className={styles.dropoptions} style={{width:"95px"}}>
                                {handleOpts([512,256,128,64],"displaySize",StackSettings, setStackSettings)}
                            </div>
                        </div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Group Size</div>
                            <div className={styles.dropoptions} style={{width:"83px"}}>
                                {handleOpts([16,8,4],"grouping",StackSettings, setStackSettings)}
                            </div>
                        </div>
                    </div>
                    <div className={styles.segbody}>
                        {handleMem(StackSettings)}
                    </div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.vertseg}>
                    <div className={styles.seghead} style={{minWidth:"400px"}}>
                        <div className={styles.headtitle}>Memory</div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Bytes Per Row</div>
                            <div className={styles.dropoptions} style={{width:"103px"}}>
                                {handleOpts([32,16,8],"bytePerLine",MemSettings, setMemSettings)}
                            </div>
                        </div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Display Size</div>
                            <div className={styles.dropoptions} style={{width:"95px"}}>
                                {handleOpts([512,256,128],"displaySize",MemSettings, setMemSettings)}
                            </div>
                        </div>
                        <div className={styles.dropdown}>
                            <div className={styles.dropbutton}>Group Size</div>
                            <div className={styles.dropoptions} style={{width:"83px"}}>
                                {handleOpts([16,8,4],"grouping",MemSettings, setMemSettings)}
                            </div>
                        </div>
                    </div>
                    <div className={styles.segbody}>
                        {handleMem(MemSettings)}
                    </div>
                </div>
            </div>
        </div>
    </div>
    )
}
export default Home;