import * as x from "./instructions.js"

const teststring = 
`
mov $6, %rax
mov %rax, %rbx
add %rax, %rbx
`
const regs = {
    "%rax": x.q1, "%rbx": x.q2, "%rcx": x.q3, "%rdx": x.q4,
    "%eax": x.d1, "%ebx": x.d2, "%ecx": x.d3, "%edx": x.d4,
     "%ax": x.s1,  "%bx": x.s2,  "%cx": x.s3,  "%dx": x.s4
}
export default function translatex86(input) {
    var errorstack = []; const lines = teststring.split(/\n/);
    for(let i=0;i<lines.length;i++) {
        let op = lines[i].split(/,?\s/);
        if(errorstack.length>0) {console.error()}
        switch(op.shift()) {
            case undefined:
                break;
            case "mov":
                if(op.length!=2) {errorstack.push("Line:"+i+": Error: number of operands mismatch for `mov'"); break;}
                if(op[0].startsWith('$')) {
                    op[0]=op[0].substring(1)
                    if(isNaN(op[0])) {errorstack.push("Line:"+i+": Error: not int"); break;}
                    if(!Object.keys(regs).includes(op[1])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[1]+"'"); break;}
                        x.moviq(op[0],regs[op[1]]);
                } else if(op[0].startsWith('%')) {
                    if(!Object.keys(regs).includes(op[0])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[0]+"'"); break;}
                    if(!Object.keys(regs).includes(op[1])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[1]+"'"); break;}
                        x.mov(regs[op[0]],regs[op[1]])
                }  
                break;
            case "add":
                break;
            default:
        }
    }
}