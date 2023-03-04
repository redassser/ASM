import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)

export function translatex86(input) {
    if(!input) return;
    var errorstack = [], codelist = [], functionstack = [], pointer = 0; const lines = input.split(/\n/); 
    function lineParse(line) {
        var comment = line.search("# ") === -1 ? line.length : line.search("# "); 
        line=line.substring(0,comment); var argarray = [];
        var lineobj = {op:"nop",args:[],junk:[],size:0} //args format : [ ["hex","0x55fa"], ["int", "124634"], ["reg","rax"], ["mem","(%rax, %rbx)"] ]
        const argregex = line.matchAll(/(?<mem>\(%\w+(,\s*%\w+)?\))|(?<int>(?<=\$)\d+)|(?<hex>0x\w+)|(?<reg>(?<=%)\w+)|(?<nam>[\.a-zA-Z0-9\:]+)/g);
        for(const arg of argregex) {
            for (const [key, value] of Object.entries(arg.groups)) {
                if(value!=undefined) {
                    if(key==="reg") {lineobj.size=x86.getSize(value);}
                    argarray.push([key, arg[0]]);
                }
            }
        }
        if(!line.replace(/\s/g, "")) return lineobj;
        lineobj.op = argarray.shift()[1]
        lineobj.args = argarray;
        return lineobj;
    }
    //Catches errors
    function errorCatcherSupreme(Line, LineObject, NumberOfInputs, InputTypeArray) {
        Line++
        var ret = 0; const OperationName = LineObject.op, OperandArray = LineObject.args;
        //Input Checking and Formatting
        for(let i=0;i<NumberOfInputs;i++) {
            var current = OperandArray[i]; var n;
            if(!InputTypeArray[i].includes(current[0])) {
                errorstack.push("Line:"+Line+": Error: Type mismatch for `"+OperationName+"'");
                ret++; return ret;
            }
            // Number Stuff
            if(current[0] === "hex" || current[0] === "int") {
                if(isNaN(parseInt(current[1]))) {errorstack.push("Line:"+Line+": Error: "+current[1]+" is not a number"); return undefined;}
                switch(LineObject.size) {
                    case 1: //Double
                        n = new Uint32Array(1); n[0] = current[1];
                        if(parseInt(current[1])>n) errorstack.push("Line:"+Line+": Warning: "+current[1]+" shortened to "+n);
                        break;
                    case 2: //Single
                        n = new Uint16Array(1); n[0] = current[1];
                        if(parseInt(current[1])>n) errorstack.push("Line:"+Line+": Warning: "+current[1]+" shortened to "+n);
                        break;
                    default: //Quad
                        n = new BigUint64Array(1); n[0] = BigInt(current[1]);
                        if(BigInt(current[1])>n) errorstack.push("Line:"+Line+": Warning: "+current[1]+" shortened to "+n);
                        break;
                }
                LineObject.args[i][1] = n[0];
            }
        }
        //Operands Mismatch 
        if(OperandArray.length!=NumberOfInputs) {
            errorstack.push("Line:"+Line+": Error: number of operands mismatch for `"+OperationName+"'");
            ret++; return ret;
        }
        //Bad Register Names
        OperandArray.forEach(op => {
            if(op[0]==="reg")
                if(!x86.intregs.flat(1).includes(op[1])) {
                    errorstack.push("Line:"+Line+": Error: bad register name `"+op[1]+"'");
                    ret++; return ret;
                }
        });
        return ret;
    }
    //Main caller
    for(let i=0;i<lines.length;i++) {
        var lineobj = lineParse(lines[i]);
        switch(lineobj.op) {
            case ".globl":
                if (errorCatcherSupreme(i,lineobj,1,[["nam"]])) { codelist.push([pointer,"err"]); break; }
                break;
            case "xor":
            case "add":
            case "mov":
                if (errorCatcherSupreme(i,lineobj,2,[["int","hex","reg"],["reg"]])) { codelist.push([pointer,"err"]); break; }
                codelist.push([pointer,lineobj.op,lineobj.args[0][1],lineobj.args[1][1]]);
                if(lineobj.args[0][0]==="reg") pointer+=3;
                    else pointer+=7;
                break;
            case "not":
                if (errorCatcherSupreme(i,lineobj,1,[["reg"]])) { codelist.push([pointer,"err"]); break; }
                codelist.push([pointer,lineobj.op,lineobj.args[0][1]]);
                break;
            case "nop":
                codelist.push([pointer,"nop"])
                break;
            default:
                errorstack.push("Line:"+(i+1)+": Error: "+lineobj.op+" is not a real operation");
                codelist.push([pointer,"err"]);
        }
    }
    return {list:codelist,errors:errorstack,funcs:functionstack}
}