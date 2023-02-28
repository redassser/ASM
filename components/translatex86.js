import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)

export function translatex86(input) {
    if(!input) return;
    
    var errorstack = [], codelist = [], functionstack = [], pointer = 0; const lines = input.split(/\n/); 
    function lineParse(line) {
        var comment = line.search("# ") === -1 ? line.length : line.search("# "); 
        line=line.substring(0,comment);
        const oplist = ["mov","add","not",".globl"];
        var lineobj = {op:"nop",args:[],junk:[]} //args format : [ ["hex","0x55fa"], ["int", "124634"], ["reg","rax"], ["mem","(%rax, %rbx)"] ]
        const op = /[\.a-z]+/g.exec(line);
        if(op!=null && oplist.includes(op[0])) {
            line.replace(/[a-z]+\s+/g,"");
            const argregex = line.matchAll(/(?<mem>\(%\w+(,\s*%\w+)?\))|(?<int>(?<=\$)\d+)|(?<hex>0x\d+)|(?<reg>(?<=%)\w+)|(?<nam>[\.a-zA-Z0-9]+)/g);
            var argarray = [], junkarray = [];
            for(const arg of argregex) {
                for (const [key, value] of Object.entries(arg.groups)) {
                    if(value!=undefined) {
                        if (key!="nam") argarray.push([key, arg[0]]);
                        else if(op[0]!=value) junkarray.push(value);
                    }
                }
            }
            lineobj.op = op[0];
            lineobj.args = argarray;
            lineobj.junk = junkarray;
        }
        return lineobj;
    }
    //Catches errors
    function errorCatcherSupreme(Line, LineObject, NumberOfInputs) {
        Line++
        var ret = 0; const OperationName = LineObject.op, OperandArray = LineObject.args;
        const Junk = OperationName === ".globl" ? LineObject.junk.slice(1) : LineObject.junk;
        //Junk in the trunk
        
        if (Junk.length!=0) {
            errorstack.push("Line:"+Line+": Error: junk `"+Junk.join(", ")+"' somewhere");
            ret++; return ret;
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
        const lineobj = lineParse(lines[i]);
        console.log(lineobj)
        switch(lineobj.op) {
            case ".globl":
                if (errorCatcherSupreme(i,lineobj,0)) { codelist.push([pointer,"err"]); break; }
                if(lineobj.junk.length==0) { errorstack.push("Line:"+(i+1)+": Error: expected symbol name"); codelist.push([pointer,"err"]); break; }
                codelist.push([pointer,".globl",lineobj.junk[1]]);
                break;
            case "add":
            case "mov":
                if (errorCatcherSupreme(i,lineobj,2)) { codelist.push([pointer,"err"]); break; }
                if(lineobj.args[0][0]=="int"||lineobj.args[0][0]=="hex") {
                    const intop = numberModifier(i, lineobj.args[1][1], lineobj.args[0][1]); if(intop===undefined) { codelist.push([pointer,"err"]); break; }
                    codelist.push([pointer,lineobj.op,intop,lineobj.args[1][1]]);
                    pointer+=7;
                } else if(lineobj.args[0][0]=="reg") {
                    codelist.push([pointer,lineobj.op,lineobj.args[0][1],lineobj.args[1][1]]);
                    pointer+=3;
                }  
                break;
            case "not":
                if (errorCatcherSupreme(i,lineobj,1)) { codelist.push([pointer,"err"]); break; }
                if(lineobj.args[0][0]=="reg") {
                    codelist.push([pointer,lineobj.op,lineobj.args[0][1]]);
                    pointer+=3;
                }
                break;
            default:
                codelist.push([pointer,"nop"]);
        }
    }
    console.log(errorstack)
    return {list:codelist,errors:errorstack,funcs:functionstack}
}