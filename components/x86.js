import cpu from "/components/cpu";

export default class x86cpu extends cpu {
    intregs=[["rax","eax","ax"],["rbx","ebx","bx"],["rcx","rcx","cx"],["rdx","edx","dx"],
             ["rsi","esi","si"],["rdi","edi","di"],["rbp","ebp","bp"],["rsp","esp","sp"],
             ["r8","r8d","r8w"],["r9","r9d","r9w"],["r10","r10d","r10w"],["r11","r11d","r11w"],
             ["r12","r12d","r12w"],["r13","r13d","r13w"],["r14","r14d","r14w"],["r15","r15d","r15w"]]
    floatregs=[ ["zmm0","ymm0","xmm0"],["zmm1","ymm1","xmm1"],["zmm2","ymm2","xmm2"],["zmm3","ymm3","xmm3"],
                ["zmm4","ymm4","xmm4"],["zmm5","ymm5","xmm5"],["zmm6","ymm6","xmm6"],["zmm7","ymm7","xmm7"],
                ["zmm8","ymm8","xmm8"],["zmm9","ymm9","xmm9"],["zmm10","ymm10","xmm10"],["zmm11","ymm11","xmm11"],
                ["zmm12","ymm12","xmm12"],["zmm13","ymm13","xmm13"],["zmm14","ymm14","xmm14"],["zmm15","ymm15","xmm15"]]
    regPos(reg) {
        for(var i=0;i<this.intregs.length;i++)
            if(this.intregs[i].includes(reg)) return i;
        return -1;
    }
    getSize(reg) {
        return (this.intregs[this.regPos(reg)].indexOf(reg));
    }
    exec(array) {
        switch(array[1]) {
            case "movi":
                this.movi(array[2],array[3]);
                break;
            case "mov":
                this.mov(array[2],array[3]);
                break;
            case "addi":
                this.addi(array[2],array[3]);
                break;
            case "add":
                this.add(array[2],array[3]);
                break;
            case "not":
                this.not(array[2]);
                break;
        }
    }
    execAll(stackarray) {
        stackarray.forEach(array => {
            this.exec(array);
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
    xor() {}

}