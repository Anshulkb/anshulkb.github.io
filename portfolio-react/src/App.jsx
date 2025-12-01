// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Header from "./components/Header";
import ProjectCard from "./components/ProjectCard";
import Footer from "./components/Footer";
// import GetProducts from './components/GetProducts';

function App() {
  // const [count, setCount] = useState(0)
  const projects = [
    {
      title: "SAP Fiori App",
      description: "UI5 app using DummyJSON API (proxy via Vercel).",
      link: "/projects/fiori/index.html"
    },
    {
      title: "React Demo App",
      description: "A simple React project.",
      link: "/projects/react-demo/index.html"
    }
  ];

  return (
    <>
      <Header />

      <section className="project-section">
        <h2>My Projects</h2>

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
        {/* <GetProducts></GetProducts> */}
      </section>
      <Footer></Footer>
    </>
    // );
  )
}

export default App
