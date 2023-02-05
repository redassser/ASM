import cpu from "/components/cpu";

export default class x86cpu extends cpu {
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
        super.mov(fromReg,toReg);
    }
    movi(c, toReg) { //immediate mode, load the register with a constant   mov $123, %rax
        super.moviq(c,toReg);
    }
    movin(offset, a, b, m) {      //  movq 16(%rax, %rbx, 8), %r9
        this.intRegs[toReg] = this.mem[offset + a + (b * m)];
    }

    movon(offset, a, b, m) {      //  movq  %r9, 16(%rax, %rbx, 8)
        this.mem[offset + a + (b * m)] = this.intRegs[toReg];
    }

    add() {} // same thing
    sub() {}
    imul() {} // signed multiply, same thing
    div() {} // restricted to just one register dx for some of the data, weird hardcoding
    and() {}
    or() {}
    xor() {}
    not() {}

}