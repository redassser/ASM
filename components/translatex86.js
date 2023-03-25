export const intregs=[["rax","eax","ax"],["rbx","ebx","bx"],["rcx","rcx","cx"],["rdx","edx","dx"],
         ["rsi","esi","si"],["rdi","edi","di"],["rbp","ebp","bp"],["rsp","esp","sp"],
         ["r8","r8d","r8w"],["r9","r9d","r9w"],["r10","r10d","r10w"],["r11","r11d","r11w"],
         ["r12","r12d","r12w"],["r13","r13d","r13w"],["r14","r14d","r14w"],["r15","r15d","r15w"]]
export const floatregs=[ ["zmm0","ymm0","xmm0"],["zmm1","ymm1","xmm1"],["zmm2","ymm2","xmm2"],["zmm3","ymm3","xmm3"],
            ["zmm4","ymm4","xmm4"],["zmm5","ymm5","xmm5"],["zmm6","ymm6","xmm6"],["zmm7","ymm7","xmm7"],
            ["zmm8","ymm8","xmm8"],["zmm9","ymm9","xmm9"],["zmm10","ymm10","xmm10"],["zmm11","ymm11","xmm11"],
            ["zmm12","ymm12","xmm12"],["zmm13","ymm13","xmm13"],["zmm14","ymm14","xmm14"],["zmm15","ymm15","xmm15"],
            ["zmm16","ymm16","xmm16"],["zmm17","ymm17","xmm17"],["zmm18","ymm18","xmm18"],["zmm19","ymm19","xmm19"],
            ["zmm20","ymm20","xmm20"],["zmm21","ymm21","xmm21"],["zmm22","ymm22","xmm22"],["zmm23","ymm23","xmm23"],
            ["zmm24","ymm24","xmm24"],["zmm25","ymm25","xmm25"],["zmm26","ymm26","xmm26"],["zmm27","ymm27","xmm27"],
            ["zmm28","ymm28","xmm28"],["zmm29","ymm29","xmm29"],["zmm30","ymm30","xmm30"],["zmm31","ymm31","xmm31"]]

export function translatex86(input) {
    if(!input) return;
    var errorstack = [], codelist = {}, namesobj = {}, pointer = 0; const lines = input.split(/\n/); 
    function lineParse(line) {
        var comment = line.search("# ") === -1 ? line.length : line.search("# "); 
        line=line.substring(0,comment); var argarray = [];
        var lineobj = {op:undefined,args:[],junk:[]} //args format : [ ["hex","0x55fa"], ["int", "124634"], ["reg","rax"], ["mem","(%rax, %rbx)"] ]
        const argregex = line.matchAll(/(?<mem>\(%\w+(,\s*%\w+)?\))|(?<int>(?<=\$)\d+)|(?<hex>0x\w+)|(?<reg>(?<=%)\w+)|(?<nam>[\.a-zA-Z0-9\:]+)/g);
        for(const arg of argregex) {
            for (const [key, value] of Object.entries(arg.groups)) {
                if(value!=undefined) {
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
        //Symbol Redefine
        if(Object.keys(namesobj).includes(OperationName.slice(0,-1))) {
            errorstack.push("Line:"+Line+": Error: symbol `"+OperationName+"' is already defined");
            ret++; return ret;
        }
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
                if(!intregs.flat(1).includes(op[1])) {
                    errorstack.push("Line:"+Line+": Error: bad register name `"+op[1]+"'");
                    ret++; return ret;
                }
        });
        return ret;
    }
    //Main caller
    var pointadder;
    for(let i=0;i<lines.length;i++) {
        var lineobj = lineParse(lines[i]); pointadder = 0;
        switch(lineobj.op) {
            case undefined:
                break;
            case ".globl":
                if (errorCatcherSupreme(i,lineobj,1,[["nam"]])) { codelist[pointer] = ["err"]; break; }
                break;
            case "shl":
            case "shr":
            case "xor":
            case "add":
            case "mov":
                if (errorCatcherSupreme(i,lineobj,2,[["int","hex","reg"],["reg"]])) { codelist[pointer] = ["err"]; break; }
                codelist[pointer] = [lineobj.op,lineobj.args[0][1],lineobj.args[1][1]];
                if(lineobj.args[0][0]==="reg") 
                    pointadder=3;
                else if(lineobj.op==="shr"||lineobj.op==="shl")
                    pointadder=lineobj.args[0][1]==1?3:4;
                else 
                    pointadder=7;
                break;
            case "not":
                if (errorCatcherSupreme(i,lineobj,1,[["reg"]])) { codelist[pointer] = ["err"]; break; }
                codelist[pointer] = [lineobj.op,lineobj.args[0][1]];
                break;
            case "call":
                if (errorCatcherSupreme(i,lineobj,1,[["nam"]])) { codelist[pointer] = ["err"]; break; }
                codelist[pointer] = ["call",lineobj.args[0][1]];
                pointadder=5;
                break;
            case "ret":
                if (errorCatcherSupreme(i,lineobj,0,[])) { codelist[pointer] = ["err"]; break; }
                codelist[pointer] = ["ret"];
                pointadder=1;
                break;
            case "nop":
                codelist[pointer] = ["nop"];
                break;
            default:
                if(lineobj.op.endsWith(":")) {
                    if (errorCatcherSupreme(i,lineobj,0,[])) { codelist[pointer] = ["err"]; break; }
                    namesobj[lineobj.op.slice(0,-1)] = pointer;
                } else {
                    errorstack.push("Line:"+(i+1)+": Error: "+lineobj.op+" is not a real operation");
                    codelist[pointer] = ["err"];
                }
        }
        if(codelist[pointer])
            codelist[pointer].unshift(pointadder);
        pointer+=pointadder;
    }
    return {list:codelist,errors:errorstack,names:namesobj}
}