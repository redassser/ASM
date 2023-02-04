    // A B C D
const rax = [0,8], rbx = [8,8], rcx = [16,8],  rdx = [24,8],
      eax = [4,4], ebx = [12,4], ecx = [20,4], edx = [28,4],
       ax = [6,2],  bx = [14,2],  cx = [22,2],  dx = [30,2],
    // SI DI BP SP
      rsi = [32,8],rdi =[40,8], rbp = [48,8], rsp = [56,8],
      esi = [36,4],edi =[44,4], ebp = [52,4], esp = [60,4],
       si = [38,2], di =[46,2],  bp = [54,2],  sp = [62,2];
    // Registers
    var intRegisters = new Uint8Array(128); //16 64-bit [128 bytes] registers :
    //this.floatRegisters = new Float64Array(32*8); //32 vector registers
    var stop = false, rip = 0, eflags = {Z:0,N:0,C:0,O:0};
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
    function add(regFrom, regTo) {
        for(let i=0;i<regTo[1];i++)
            intRegisters[regTo[0]+i] += intRegisters[regFrom[0]+i];
    }
// ADD end
// MOV start
    function mov(regFrom, regTo) { // Quad, Double, Single
        for(let i=0;i<regTo[1];i++)
                intRegisters[regTo[0]+i] = intRegisters[regFrom[0]+i];
    }
    function movi(int, regTo) { // Quad, Double, Single
        const buffer = new ArrayBuffer(8)
        new DataView(buffer).setBigUint64(0,BigInt(int))
        const view = new Uint8Array(buffer)
        for(let i=0;i<regTo[1];i++)
            intRegisters[regTo[0]+i] = view[i];
    }
// MOV end
// AND start
    function and(regFrom, regTo) {
        for(let i=0;i<regTo[1];i++)
            intRegisters[regTo[0]+i] &= intRegisters[regFrom[0]+i];
    }
// AND end
// OR start
    function or(regFrom, regTo) {
        for(let i=0;i<regTo[1];i++)
            intRegisters[regTo[0]+i] |= intRegisters[regFrom[0]+i];
    }
// OR end
// xOR start
function xor(regFrom, regTo) {
    for(let i=0;i<regTo[1];i++)
        intRegisters[regTo[0]+i] ^= intRegisters[regFrom[0]+i];
}
// XOR end


function trigger() { //asm sub layer
    movi("18446744073709551614",rax);
    console.log(intRegisters)
}
trigger();