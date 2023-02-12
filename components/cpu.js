/*
    The CPU is baseline class and can be extended to x86 or ARM

*/
export default class cpu {
    constructor(memSize) {
        this.intRegisters = new BigUint64Array(16); // 16 integer registers, each has 64 bytes
        this.fpRegs = new BigUint64Array(32*8); // 32 zmm registers, each has 64 bytes (512 bits) AVX512
        this.rip = new BigUint64Array(1); // PC on intel is called rip, 64 bits
        this.eflags = {C:0,O:0};
        this.mem = new Uint8Array(memSize); // 1Mb for your machine
    }
    add(regA, regB, regC) { // Quad, Double, Single 
        this.intRegisters[regC]=this.intRegisters[regA]+this.intRegisters[regB];
    }
    addi(int, regB, regC) {
        this.intRegisters[regC] = BigInt(int+this.intRegisters[regB]);
    }
    mov(regFrom, regTo) { // Quad, Double, Single
        this.intRegisters[regTo] = this.intRegisters[regFrom];
    }
    movi(int, regTo) { // Quad, Double, Single
        this.intRegisters[regTo] = BigInt(int);
    }
    and(regA, regB, regC) { // Quad, Double, Single
        
    }
    or(regA, regB, regC) { // Quad, Double, Single

    }
    xor(regA, regB, regC) { // Quad, Double, Single

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