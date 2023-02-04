import * as x from "./instructions.js"

const tokenregex = /\n/g;
const teststring = 
`
mov($6, rax)
mov(rax, rbx)
add(rax,rbx)
`

function translatex86(input) {

}

function trigger(){
    x.moviq(6,x.q1);
    console.log(x.intRegisters)
}
trigger()