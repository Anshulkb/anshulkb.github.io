// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import Header from "./components/Header";
// import ProjectCard from "./components/ProjectCard";
import Footer from "./components/Footer";
// import GetProducts from './components/GetProducts';
import Home from './components/Home';
import About from './components/About';
import Projects from './components/Projects';
import { useEffect } from 'react';

function App() {
  // const [count, setCount] = useState(0)

  // useEffect(() => {
  //   const orb = document.querySelector("#light-orb")
  //   const wrapper = document.querySelector(".orb-wrapper")
  //   if (!orb) return
  //   const radius = 100
  //   // let x = 0, y = 0
  //   let prevX = 0, prevY = 0

  //   const moveOrb = () => {
  //     const angle = Math.random() * Math.PI * 2
  //     const distance = Math.random() * radius

  //     const x = Math.cos(angle) * distance
  //     const y = Math.sin(angle) * distance

  //     // orb.style.transform = `translate(${x}px, ${y}px)`
  //     wrapper.style.transform = `translate(${x}px, ${y}px)`

  //     const dx = x - prevX
  //     const dy = y - prevY

  //     const deg = Math.atan2(dy, dx) * (180 / Math.PI)

  //     orb.style.setProperty("--tail-rotation", `${deg + 180}deg`)
  //     orb.classList.add("moving")

  //     clearTimeout(orb._tailTimeout)

  //     orb._tailTimeout = setTimeout(() => {
  //       orb.classList.remove("moving")
  //     }
  //       , 300)

  //     prevX = x
  //     prevY = y
  //   }
  //   moveOrb()

  //   // const interval = setInterval(moveOrb, 1500)
  //   const interval = setInterval(moveOrb, 1200 + Math.random() * 800)

  //   return () => clearInterval(interval)
  // }, [])
  return (
    <>
      <Header />
      <div className='global-light'>
        {/* <div className='orb-wrapper'> */}
        {/* <div id='light-orb'> */}

        {/* </div> */}
      </div>
      <section id="home" className='home-section'>
        <Home></Home>
      </section>


      <section id="projects" className="project-section">
        <Projects></Projects>
        {/* <GetProducts></GetProducts> */}
      </section>
      <section id="about">
        <About></About>
      </section>
      <Footer></Footer>
    </>
    // );
  )
}

export default App
