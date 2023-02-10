import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)

export function translatex86(input) {
    if(!input) return;
    var errorstack = []; const lines = input.split(/\n/);
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
    function integerModifier(Line, Reg, int) {
        if(isNaN(int)) {errorstack.push("Line:"+Line+": Error: "+int+" is not an integer");}
        var n;
        switch(x86.getSize(Reg)) {
            case 0: // 64-bit
                n = new BigUint64Array(1); n[0] = int;
                if(int>n) errorstack.push("Line:"+Line+": Warning: "+int+" shortened to "+n);
                break;
            case 1: // 32-bit
                n = intcap = new Uint32Array(1); n[0] = int;
                if(int>n) errorstack.push("Line:"+Line+": Warning: "+int+" shortened to "+n);
                break;
            default: // 16-bit
                n = new Uint16Array(1); n[0] = int;
                if(int>n) errorstack.push("Line:"+Line+": Warning: "+int+" shortened to "+n);
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
                if (errorCatcherSupreme(i,op,"mov",2)) return errorstack;
                if(op[0].startsWith('$')) {
                    var intop=op[0].substring(1), regop=op[1].substring(1);
                    intop = integerModifier(i, regop, intop);
                    x86.movi(intop,regop);
                } else if(op[0].startsWith('%')) {
                    const regop=op[0].substring(1), regop2=op[1].substring(1);
                    x86.mov(regop,regop2);
                }  
                break;
            case "add":
                break;
            default:
        }
    }
    return errorstack;
}