/*
    The CPU is baseline class and can be extended to x86 or ARM

*/
export default class cpu {
    // A B C D / 1 2 3 4
    rax = [0,8]; rbx =  [8,8]; rcx = [16,8]; rdx = [24,8];
    eax = [4,4]; ebx = [12,4]; ecx = [20,4]; edx = [28,4];
     ax = [6,2];  bx = [14,2];  cx = [22,2];  dx = [30,2];
    // SI DI BP SP / 5 6 7 8
    rsi = [32,8]; rdi =[40,8]; rbp = [48,8]; rsp = [56,8];
    esi = [36,4]; edi =[44,4]; ebp = [52,4]; esp = [60,4];
     si = [38,2];  di =[46,2];  bp = [54,2];  sp = [62,2];

    constructor(memSize) {
        this.intRegisters = new Uint8Array(128);
        this.fpRegs = new Uint8Array(32*64); // 32 zmm registers, each has 64 bytes (512 bits) AVX512
        this.rip = new BigUint64Array(1); // PC on intel is called rip, 64 bits
        this.eflags = {C:0,O:0};
        this.mem = new Uint8Array(memSize); // 1Mb for your machine
    }
    add(regA, regB, regC) { // Quad, Double, Single
        for(let i=regC[1];i>0;i--) {
            let sum = this.intRegisters[regA[0]+i] + this.intRegisters[regB[0]+i] + this.eflags.C;
            this.eflags.C = 0;
            if(sum>255) {this.eflags.C=1; intRegisters[regC[0]+i]=255}
            else intRegisters[regC[0]+i]=sum;
        }   
        if(this.eflags.C>0) {this.eflags.O=1}
    }
    mov(regFrom, regTo) { // Quad, Double, Single
        for(let i=0;i<regTo[1];i++)
                this.intRegisters[regTo[0]+i] = this.intRegisters[regFrom[0]+i];
    }
    moviq(int, regTo) { // Quad
        const buffer = new ArrayBuffer(8)
        new DataView(buffer).setBigUint64(0,BigInt(int))
        const view = new Uint8Array(buffer)
        for(let i=0;i<regTo[1];i++)
            this.intRegisters[regTo[0]+i] = view[i];
    }
    and(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] & intRegisters[regB[0]+i];
    }
    or(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] | intRegisters[regB[0]+i];
    }
    xor(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] ^ intRegisters[regB[0]+i];
    }
}

/* 
        All functions are assumed to have correct inputs
        Exceptions and edge cases are handled in translation layer
*/
// Set Flags start
    function setFlags(val) {
        eflags.Z = (val===0) ? 1 : 0;  
        eflags.N = (val<0)   ? 1 : 0;  
        //TODO: eflags.C
        //TODO: eflags.V (overflow)
    }