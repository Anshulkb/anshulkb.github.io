import { BsArrowRight } from "react-icons/bs";

export default function Home() {

    function goToConnect() {
        const section = document.getElementById('contact');
        window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    }
    return (
        <div>
            {/* <p>This is home</p> */}
            <h2>Hi, I'm Anshul.</h2>
            <h3>I build web application with SAP technologies and beyond.</h3>
            <button onClick={goToConnect} style={{
                display: "flex",
                alignItems: "center"
            }}>Get in touch <BsArrowRight fontSize="1.5rem" style={{
                marginLeft: "0.25rem"
            }} /></button>
            {/* <button >Download CV</button> */}
        </div>
    )
}