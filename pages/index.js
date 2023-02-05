import translatex86 from "../components/x86"
import * as x from "../components/instructions"
export default function Home() {
    return(
    <>
        <button onClick={translatex86(`
mov $6, %rax
mov %rax, %rbx
add %rax, %rbx
`)}></button>
    </>
    )
}