class x86 {
    // A B C D
    rax = [0,4]; rbx = [4,4]; rcx = [8,4];  rdx = [12,4];
    eax = [2,2]; ebx = [6,2]; ecx = [10,2]; edx = [14,2];
    ax  = [3,1];  bx = [7,1];  cx = [11,1];  dx = [15,1];
    // SI DI BP SP
    rsi = [16,4]; rdi = [20,4]; rbp = [24,4]; rsp = [28,4];
    esi = [18,2]; edi = [22,2]; ebp = [26,2]; esp = [30,2];
    si  = [19,1];  di = [23,1];  bp = [27,1];  bp = [31,1];
    constructor() {
        // Flags
        this.stop = false;
        this.rip = 0;
        this.eflags = 0;
        // Registers
        this.intRegisters = new Uint16Array(64); //16 64-bit [64 16-bit] registers :
        //this.floatRegisters = new Float64Array(32*8); //32 vector registers
    }
    static mov(regFrom, regTo) {
        if(regTo[1]!=regFrom[1]) 
            return console.error("RegTo and RegFrom are not the same size");
        if(Array.isArray(regFrom)) {
            for(let i=0;i<regTo[1];i++)
                this.intRegisters[regTo[0]+i] = this.intRegisters[regFrom[0]+i];
        } else {
            switch (regTo[1]) {
                case 2:
                case 4:
                    //INT case
            }
        }
    }
    static and(regFrom, regTo) {
        if(regTo[1]!=regFrom[1]) 
            return console.error("RegTo and RegFrom are not the same size");
        for(let i=0;i<regTo[1];i++) {
            this.intRegisters[regTo[0]+i] &= this.intRegisters[regFrom[0]+i];
        }
    }
}

const intel = new x86();
{ //asm sub layer


}