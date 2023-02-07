import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)
const regs = {
    "%rax": x86.rax, "%rbx": x86.rbx, "%rcx": x86.rcx, "%rdx": x86.rdx,
    "%eax": x86.eax, "%ebx": x86.ebx, "%ecx": x86.ecx, "%edx": x86.edx,
     "%ax": x86.ax,  "%bx": x86.bx,  "%cx": x86.cx,  "%dx": x86.dx
}

export function translatex86(input) {
    if(!input) return;
    var errorstack = []; const lines = input.split(/\n/);
    for(let i=0;i<lines.length;i++) {
        let op = lines[i].trim().split(/,?\s+/);
        if(errorstack.length>0) {return errorstack}
        switch(op.shift()) {
            case undefined:
                break;
            case "mov":
                if(op.length!=2) {errorstack.push("Line:"+i+": Error: number of operands mismatch for `mov'"); break;}
                if(op[0].startsWith('$')) {
                    op[0]=op[0].substring(1)
                    if(isNaN(op[0])) {errorstack.push("Line:"+i+": Error: not int"); break;}
                    if(!Object.keys(regs).includes(op[1])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[1]+"'"); break;}
                        x86.moviq(op[0],regs[op[1]]);
                } else if(op[0].startsWith('%')) {
                    if(!Object.keys(regs).includes(op[0])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[0]+"'"); break;}
                    if(!Object.keys(regs).includes(op[1])) {errorstack.push("Line:"+i+": Error: bad register name `"+op[1]+"'"); break;}
                        x86.mov(regs[op[0]],regs[op[1]])
                }  
                break;
            case "add":
                x86.add(op[0],op[1]);
                break;
            default:
        }
    }
}