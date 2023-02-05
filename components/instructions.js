    // A B C D
export const 
        q1 = [0,8], q2 = [8,8],  q3 = [16,8], q4 = [24,8],
        d1 = [4,4], d2 = [12,4], d3 = [20,4], d4 = [28,4],
        s1 = [6,2], s2 = [14,2], s3 = [22,2], s4 = [30,2],
    // SI DI BP SP
        q5 = [32,8], q6 =[40,8], q7 = [48,8], q8 = [56,8],
        d5 = [36,4], d6 =[44,4], d7 = [52,4], d8 = [60,4],
        s5 = [38,2], s6 =[46,2], s7 = [54,2], s8 = [62,2],
    // Registers
        intRegisters = new Uint8Array(128); //16 64-bit [128 bytes] registers :
        //this.floatRegisters = new Float64Array(32*8); //32 vector registers
    // Memory
export var 
        mem,
        stop = false, rip = 0, eflags = {Z:0,N:0,C:0,O:0};
/* 
        All functions are assumed to have correct inputs
        Exceptions and edge cases are handled in translation layer
*/
// Set Flags start
    function setFlags(val) {
        eflags.Z = (val===0) ? 1 : 0;  
        eflags.N = (val<0)   ? 1 : 0;  
    }
// Set Flags end
// ADD start
    export function add(regA, regB, regC) { // Quad, Double, Single
        for(let i=regC[1];i>0;i--) {
            let sum = intRegisters[regA[0]+i] + intRegisters[regB[0]+i] + eflags.C;
            eflags.C = 0;
            if(sum>255) {eflags.C=1; intRegisters[regC[0]+i]=255}
            else intRegisters[regC[0]+i]=sum;
        }   
        if(eflags.C>0) {eflags.O=1}
    }
    function addi() {
        
    }
// ADD end
// MOV start
    export function mov(regFrom, regTo) { // Quad, Double, Single
        for(let i=0;i<regTo[1];i++)
                intRegisters[regTo[0]+i] = intRegisters[regFrom[0]+i];
    }
    export function moviq(int, regTo) { // Quad
        const buffer = new ArrayBuffer(8)
        new DataView(buffer).setBigUint64(0,BigInt(int))
        const view = new Uint8Array(buffer)
        for(let i=0;i<regTo[1];i++)
            intRegisters[regTo[0]+i] = view[i];
    }
// MOV end
// AND start
    export function and(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] & intRegisters[regB[0]+i];
    }
// AND end
// OR start
    export function or(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] | intRegisters[regB[0]+i];
    }
// OR end
// xOR start
    export function xor(regA, regB, regC) { // Quad, Double, Single
        for(let i=0;i<regC[1];i++)
            intRegisters[regC[0]+i] = intRegisters[regA[0]+i] ^ intRegisters[regB[0]+i];
    }
// XOR end