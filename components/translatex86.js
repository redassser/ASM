import x86cpu from "/components/x86"

export const x86 = new x86cpu(1024)

export function translatex86(input) {
    if(!input) return;
    var errorstack = [], codelist = [], pointer = 0; const lines = input.split(/\n/); 
    function lineParse(line) {
        //let op = lines[i].trim().split(/,?\s+/);
        const oplist = ["mov","movi","add","addi","not"]
        var lineobj = {op:"nop",args:[]} //args format : [ ["hex","0x55fa"], ["int", "124634"], ["reg","rax"], ["mem",["5", "rax", "8"]] ]
        const op = /[a-z]+/g.exec(line);
        if(oplist.includes(op[0])) {
            line.replace(/[a-z]+\s+/g,"");
            const arglist = line.match(/(\$\d+)|(0x\d+)|(%\w+)/g);
            lineobj.op = op[0];
            lineobj.args = arglist.map(arg => {
                var type;
                if (arg.startsWith("0x")) {type="hex";}
                else if (arg.startsWith("$")) {type="int";arg=arg.substring(1);}
                else if (arg.startsWith("%")) {type="reg";arg=arg.substring(1);}
                return [type, arg];
            })
        }
        return lineobj;
    }
    //Catches errors
    function errorCatcherSupreme(Line, LineObject, NumberOfInputs) {
        var ret = 0; const OperationName = LineObject.op, OperandArray = LineObject.args;
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
            case "addi":
            case "movi":
                if (errorCatcherSupreme(i,lineobj,2)) { codelist.push([pointer,"nop"]); break; }
                const intop = numberModifier(i, lineobj.args[1][1], lineobj.args[0][1]); if(intop===undefined) { codelist.push([pointer,"nop"]); break; }
                codelist.push([pointer,lineobj.op,intop,lineobj.args[1][1]]);
                pointer+=7;
            case "add":
            case "mov":
                if (errorCatcherSupreme(i,lineobj,2)) { codelist.push([pointer,"nop"]); break; }
                if(lineobj.args[0][0]=="int"||lineobj.args[0][0]=="hex") {
                    const intop = numberModifier(i, lineobj.args[1][1], lineobj.args[0][1]); if(intop===undefined) { codelist.push([pointer,"nop"]); break; }
                    codelist.push([pointer,lineobj.op+"i",intop,lineobj.args[1][1]]);
                    pointer+=7;
                } else if(lineobj.args[0][0]=="reg") {
                    codelist.push([pointer,lineobj.op,lineobj.args[0][1],lineobj.args[1][1]]);
                    pointer+=3;
                }  
                break;
            case "not":
                if (errorCatcherSupreme(i,op,"not",1)) { codelist.push([pointer,"nop"]); break; }
                if(lineobj.args[0][0]=="reg") {
                    codelist.push([pointer,"not",lineobj.args[0][1]]);
                    pointer+=3;
                }
                break;
            default:
                codelist.push([pointer,"nop"]);
        }
    }
    console.log(errorstack)
    return {list:codelist,errors:errorstack}
}