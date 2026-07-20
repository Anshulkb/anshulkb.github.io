// import { useEffect } from 'react';
import '../css/About.css'

export default function About() {

    // let activeLantern = null;


    // function moveOrbToLantern(lantern) {
    //     const orb = document.getElementById("light-orb");
    //     const rect = lantern.getBoundingClientRect();

    //     const x = rect.left + rect.width / 2;
    //     const y = rect.top + rect.height / 2;

    //     orb.classList.remove("idle");

    //     orb.style.transform = `translate(
    //   ${x - window.innerWidth + 140}px,
    //   ${y - 120}px
    // )`;
    // }

    // function resetOrb() {
    //     const orb = document.getElementById("light-orb");
    //     orb.classList.add("idle");
    //     orb.style.transform = "translate(0,0)";
    // }

    // useEffect(() => {
    //     const orb = document.getElementById("light-orb");

    //     const observer = new IntersectionObserver(
    //         entries => {
    //             entries.forEach(entry => {
    //                 if (entry.isIntersecting) {
    //                     activeLantern = entry.target;
    //                     moveOrbToLantern(entry.target);
    //                 } else if (activeLantern === entry.target) {
    //                     activeLantern = null;
    //                     resetOrb();
    //                 }
    //             });
    //         },
    //         { threshold: 0.6 }
    //     );

    //     document.querySelectorAll(".lantern").forEach(l => observer.observe(l));
    //     orb.classList.add("idle");

    //     return () => observer.disconnect();
    // }, []);
    function goToConnect() {
        const section = document.getElementById('contact');
        window.scrollTo({ top: section.offsetTop, behavior: 'smooth' });
    }
    return (
        <div className='HBox centerAlign'>
            <div className="lantern">
                <div className="lantern-boundary" />
            </div>
            <article>
                <p>
                    I am a <b>web developer</b> with passion for creating visually appealing application. <br /> I have specialized myself in <b>SAP Fiori/UI5</b> and I like to explore other technologies as well.
                    <br />I like to make applications within and outside their recommended environment.
                    <br />
                    My motto-
                    <b>
                        'Make it till you break it'.
                    </b>
                    Feel free to connect with me <a onClick={goToConnect} style={{
                        cursor: "pointer"
                    }}>here</a>.

                </p>
            </article>
        </div>
    )
}