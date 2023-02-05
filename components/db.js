class debug {
    constructor() {
      this.cpu = new x86();  //cpu.mov(rax, rbx);
    }

/*
rax  FF2C1285172957  decimal
rbx  FF2C1285172957  decimal
rcx  00000000000000  decimal

..

r15  00000000000000  decima
rip  12581257218751
*/


    drawIntRegs() {  // rax rbx, rcx, ... rsp, r9, r10, ... r15   rip
        this.cpu.intRegNames.forEach(element => {
            useState()
        });
        return (
            <>
            
            </>
        )
    }
    drawFPRegs() {

    }
    drawStack() {

    }
    
}