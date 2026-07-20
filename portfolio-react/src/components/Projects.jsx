import ProjectCard from "./ProjectCard";
import '../css/Projects.css'

export default function Projects() {

    const projects = [
        {
            title: "Warehouse App",
            description: "This UI5 application demonstrates the integration of Rest services DummyJSON API with SAP UI5.",
            link: "/projects/fioriApp/index.html"
        },
        {
            title: "Movies Database",
            description: "This SAP application is developed with SAP CAPM and UI Annotations.",
            link: "https://capm-project-pg.onrender.com/odata/v4/movies-srv/Movies"
        },
        {
            title: "MovieWatcher",
            description: "This ReactJS application demonstrates the integration of SAP CAPM services with ReactJS.",
            link: "/projects/fioriApp/index.html"
        },
        {
            title: "React App",
            description: "This application is made to showcase the features of React.",
            link: "/projects/react-demo/index.html"
        }
    ];

    return (
        <div>

            <h2>Projects</h2>

            <div className="projects-grid">
                {projects.map((p, i) => (
                    <ProjectCard
                        key={i}
                        title={p.title}
                        description={p.description}
                        link={p.link}
                    />
                ))}
            </div>
        </div>
    )
}