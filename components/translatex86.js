import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)

export function translatex86(input) {
    if(!input) return;
    var errorstack = [], codelist = [], pointer = 0;
    const lines = input.split(/\n/); 
    //Catches errors
    function errorCatcherSupreme(Line, OperandArray, OperationName, NumberOfInputs) {
        var ret = 0;
        //Operands Mismatch 
        if(OperandArray.length!=NumberOfInputs) {
            errorstack.push("Line:"+Line+": Error: number of operands mismatch for `"+OperationName+"'");
            ret++; return ret;
        }
        //Bad Register Names
        OperandArray.forEach(op => {
            if(op.startsWith("%"))
                if(!x86.intregs.flat(1).includes(op.substring(1))) {
                    errorstack.push("Line:"+Line+": Error: bad register name `"+op+"'");
                    ret++; return ret;
                }
        });
        return ret;
    }
    //Modifies Integers
    function numberModifier(Line, Reg, num) {
        if(isNaN(parseInt(num))) {errorstack.push("Line:"+Line+": Error: "+num+" is not a number"); return undefined;}
        var n;
        switch(x86.getSize(Reg)) {
            case 0: // 64-bit
                n = new BigUint64Array(1); n[0] = BigInt(num);
                if(BigInt(num)>n) errorstack.push("Line:"+Line+": Warning: "+num+" shortened to "+n);
                break;
            case 1: // 32-bit
                n = new Uint32Array(1); n[0] = num;
                if(parseInt(num)>n) errorstack.push("Line:"+Line+": Warning: "+num+" shortened to "+n);
                break;
            default: // 16-bit
                n = new Uint16Array(1); n[0] = num;
                if(parseInt(num)>n) errorstack.push("Line:"+Line+": Warning: "+num+" shortened to "+n);
                break;
        }
        return n[0]
    }
    //Main caller
    for(let i=0;i<lines.length;i++) {
        let op = lines[i].trim().split(/,?\s+/);
        switch(op.shift()) {
            case undefined:
                break;
            case "mov":
                if (errorCatcherSupreme(i,op,"mov",2)) break;
                if(op[0].startsWith("0x")) {
                    var intop=op[0], regop=op[1].substring(1);
                    intop = numberModifier(i, regop, intop);if(intop===undefined) break;
                    codelist.push([pointer,"movi",intop,regop]);
                    pointer+=7;
                } else if(op[0].startsWith('$')) {
                    var intop=op[0].substring(1), regop=op[1].substring(1);
                    intop = numberModifier(i, regop, intop); if(intop===undefined) break;
                    codelist.push([pointer,"movi",intop,regop]);
                    pointer+=7;
                } else if(op[0].startsWith('%')) {
                    const regop=op[0].substring(1), regop2=op[1].substring(1);
                    codelist.push([pointer,"mov",regop,regop2]);
                    pointer+=3;
                }  
                break;
            case "add":
                if (errorCatcherSupreme(i,op,"add",2)) break;
                if(op[0].startsWith("0x")) {
                    var intop=op[0], regop=op[1].substring(1);
                    intop = numberModifier(i, regop, intop);if(intop===undefined) break;
                    codelist.push([pointer,"addi",intop,regop]);
                    pointer+=3;
                } else if(op[0].startsWith('$')) {
                    var intop=op[0].substring(1), regop=op[1].substring(1);
                    intop = numberModifier(i, regop, intop);if(intop===undefined) break;
                    codelist.push([pointer,"addi",intop,regop]);
                    pointer+=3;
                } else if(op[0].startsWith('%')) {
                    const regop=op[0].substring(1), regop2=op[1].substring(1);
                    codelist.push([pointer,"add",regop,regop2]);
                    pointer+=3;
                }
            case "not":
                if (errorCatcherSupreme(i,op,"not",1)) break;
                if(op[0].startsWith('%')) {
                    const regop=op[0].substring(1);
                    codelist.push([pointer,"not",regop]);
                    pointer+=3;
                }
                break;
            default:
        }
    }
    return {list:codelist,errors:errorstack}
}