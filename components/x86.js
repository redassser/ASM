import cpu from "/components/cpu";
import {intregs,floatregs} from "/components/translatex86";
export default class x86cpu extends cpu {
    intregs = intregs;
    floatregs = floatregs;
    rsp = this.regPos("rsp");
    regPos(reg) {
        for(var i=0;i<this.intregs.length;i++)
            if(this.intregs[i].includes(reg)) return i;
        return -1;
    }
    getSize(reg) {
        return (this.intregs[this.regPos(reg)].indexOf(reg));
    }
    exec(array,names) {
        switch(array[1]) {
            case "mov":
                if (typeof array[2]==="bigint" || typeof array[2]==="number") this.movi(array[2],array[3]); //Immediate
                else this.mov(array[2],array[3]); //Both Registers
                this.rip+=array[0];
                break;
            case "add":
                if (typeof array[2]==="bigint" || typeof array[2]==="number") this.addi(array[2],array[3]); //Immediate
                this.add(array[2],array[3]);
                this.rip+=array[0];
                break;
            case "xor":
                if (typeof array[2]==="bigint" || typeof array[2]==="number") this.xori(array[2],array[3]); //Immediate
                this.xor(array[2],array[3]);
                this.rip+=array[0];
                break;
            case "shr":
                this.shr(array[2]);
                this.rip+=array[0];
                break;
            case "call":
                this.call(names[array[2]]);
                break;
            case "ret":
                this.ret();
                break;
            case "not":
                this.not(array[2]);
                this.rip+=array[0];
                break;
        }
    }
    execAll(arrayobject,names) {
        Object.values(arrayobject).forEach(array => {
            this.exec(array,names);
        });
    }
    //Completed Instructions
    mov(fromReg, toReg) {  // mov %rbx, %rcx
        super.mov(this.regPos(fromReg),this.regPos(toReg));
    }
    movi(c, toReg) { //immediate mode, load the register with a constant   mov $123, %rax
        super.movi(c,this.regPos(toReg));
    }
    add(fromReg, toReg) {
        super.add(this.regPos(fromReg),this.regPos(toReg),this.regPos(toReg));
    }
    addi(c, toReg) {
        super.addi(c,this.regPos(toReg),this.regPos(toReg));
    }
    not(reg) { //Needs to change depending on Q, D, S
        super.not(this.regPos(reg));
    }
    xor(fromReg, toReg) {
        super.xor(this.regPos(fromReg),this.regPos(toReg),this.regPos(toReg));
    }
    xori(c, toReg) {
        super.addi(c,this.regPos(toReg),this.regPos(toReg));
    }
    readMem(reg, loc) {
        var val = new Uint8Array(8);
        for(let i=0;i<8;i++) {
            val[i]=this.mem[loc+i]
        }
        this.intRegisters[reg] = new BigUint64Array([val]);
    }
    writeMem(reg, loc) {
        var val = new Uint8Array([this.intRegisters[reg]])
        for(let i=0;i<8;i++) {
            this.mem[loc+i] = val[i];
        }
    }
    push(reg) {
        this.intRegisters[this.rsp]-=8;
        this.writeMem(reg, this.intRegisters(this.rsp));
    }
    pop(reg) {
        this.readMem(reg, this.intRegisters(this.rsp));
        this.intRegisters[this.rsp]+=8;
    }
    shr(reg, num) {
        this.intRegisters[this.regPos(reg)] = this.intRegisters[this.regPos(reg)] >> num;
    }
    call(loc) {
        const rsp = Number(this.intRegisters[this.regPos("esp")]);
        const rip = new Uint8Array([this.rip+5]);
        for(let i=0;i<8;i++) {
            this.mem[rsp-i]=rip[i];
        }

        this.intRegisters[this.regPos("esp")] = BigInt(rsp-8);
        this.rip = loc;
    }
    ret() {
        this.intRegisters[this.regPos("esp")] = BigInt(Number(this.intRegisters[this.regPos("esp")])+8);
        const rsp = Number(this.intRegisters[this.regPos("esp")]);
        var rip = new Uint8Array(8);
        for(let i=0;i<8;i++) {
            rip[7-i]=this.mem[rsp-i];
        }
        var view = new DataView(rip.buffer)
        this.rip = Number(view.getBigUint64());
        if(this.rip==0) {this.rip=-1;}
    }
    //End Completed

    movon(offset, a, b, m) {      //  movq  %r9, 16(%rax, %rbx, 8)
        this.mem[offset + a + (b * m)] = this.intRegs[toReg];
    }

    movin(offset, a, b, m) {      //  movq 16(%rax, %rbx, 8), %r9
        this.intRegs[toReg] = this.mem[offset + a + (b * m)];
    }
    sub() {}
    imul() {} // signed multiply, same thing
    div() {} // restricted to just one register dx for some of the data, weird hardcoding
    and() {}
    or() {}

}