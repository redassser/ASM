import '../global.css'

export default function main({Component, pageProps}) {
    const layout = Component.layout || ((page)=>page)
    return layout(<Component {...pageProps}/>)
}