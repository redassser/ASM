import cpu from "/components/cpu";

export default class x86cpu extends cpu {
    intregs = [["rax","eax","ax"],["rbx","ebx","bx"],["rcx","rcx","cx"],["rdx","edx","dx"],
            ["rsi","esi","si"],["rdi","edi","di"],["rbp","ebp","bp"],["rsp","ebp","bp"]]
    fpregnames = [["zmm0", this.zmm0]]
    regPos(reg) {
        for(var i=0;i<this.intregs.length;i++)
            if(this.intregs[i].includes(reg)) return i;
        return -1;
    }
    getSize(reg) {
        return (this.intregs[this.regPos(reg)].indexOf(reg));
    }
    exec(location) {
        //this.rip = location
        // start executing machine language
    }

    exec(program) {
        //parse out instructions
        //execute one by one
        this.mov(rax, rbx);
        this.add(rcx, rdx);
        this.movi(5, rsi);
    }

    mov(fromReg, toReg) {  // mov %rbx, %rcx
        super.mov(this.regPos(fromReg),this.regPos(toReg));
    }
    movi(c, toReg) { //immediate mode, load the register with a constant   mov $123, %rax
        var regpos = this.regPos(toReg);
        super.movi(c,regpos);
    }
    movin(offset, a, b, m) {      //  movq 16(%rax, %rbx, 8), %r9
        this.intRegs[toReg] = this.mem[offset + a + (b * m)];
    }

    movon(offset, a, b, m) {      //  movq  %r9, 16(%rax, %rbx, 8)
        this.mem[offset + a + (b * m)] = this.intRegs[toReg];
    }

    add(fromReg, toReg) {
    } // same thing
    sub() {}
    imul() {} // signed multiply, same thing
    div() {} // restricted to just one register dx for some of the data, weird hardcoding
    and() {}
    or() {}
    xor() {}
    not() {}

}