import { CiMail, CiLinkedin } from "react-icons/ci";

export default function Footer() {
    return (
        <div id="contact" className="HBox centerAlign" style={{
            padding: "1rem",
            height: "4rem"
        }}>
            {/* <section id="contact"> */}
            {/* <div style={{
                marginRight: "1rem"
            }}></div> */}
            <div>

                {/* <div className="box"> */}
                <CiMail fontSize="3rem" className="icon" style={{
                    marginRight: "1rem"
                }}></CiMail>
                {/* <a href="mailto:anshul29k@gmail.com">Drop a mail</a>

                    </div> */}
                {/* <div className="box"> */}

                {/* <p>Or connect on: </p> */}
                <CiLinkedin fontSize="3rem" className="icon" />
                {/* <a
                            href="https://www.linkedin.com/in/anshul-bhutani-aa311412a"
                            target="_blank"
                        >LinkedIn</a>
                    </div> */}
            </div>
            {/* </section> */}

            {/* <footer>
                <p>© 2025 Your Name. All rights reserved.</p>
            </footer> */}
        </div>
    );
}