    // A B C D
    const rax = [0,4], rbx = [4,4], rcx = [8,4],  rdx = [12,4],
    eax = [2,2], ebx = [6,2], ecx = [10,2], edx = [14,2],
    ax  = [3,1],  bx = [7,1],  cx = [11,1],  dx = [15,1],
    // SI DI BP SP
    rsi = [16,4], rdi = [20,4], rbp = [24,4], rsp = [28,4],
    esi = [18,2], edi = [22,2], ebp = [26,2], esp = [30,2],
    si  = [19,1],  di = [23,1],  bp = [27,1],  sp = [31,1];
    // Registers
    var intRegisters = new Uint16Array(64); //16 64-bit [64 16-bit] registers :
    //this.floatRegisters = new Float64Array(32*8); //32 vector registers
    var stop = false, rip = 0, eflags = 0;
    function mov(regFrom, regTo) {
        if(Array.isArray(regFrom)) {
            if(regTo[1]!=regFrom[1]) 
                return console.error("RegTo and RegFrom are not the same size");
            for(let i=0;i<regTo[1];i++)
                intRegisters[regTo[0]+i] = intRegisters[regFrom[0]+i];
        } else {
            if(!Number.isInteger(regFrom)) return console.error("Integers only"); 
            switch (regTo[1]) {
                case 2:
                case 4:
                    const buffer = new ArrayBuffer(8);
                    new DataView(buffer).setUint32(3,regFrom);
                    const binary = new Uint16Array(buffer);
                    console.log(binary)
                    for(let i=0;i<4;i++) {
                        intRegisters[regTo[0]+i]=binary[i];
                    }
            }
        }
    }
    function and(regFrom, regTo) {
        if(regTo[1]!=regFrom[1]) 
            return console.error("RegTo and RegFrom are not the same size");
        for(let i=0;i<regTo[1];i++) {
            intRegisters[regTo[0]+i] &= intRegisters[regFrom[0]+i];
        }
    }

{ //asm sub layer
    mov(2,rbx);
    mov(1,rax)
    and(rax,rbx)
    console.log(intRegisters)
}