import { useEffect, useState } from 'react';
import '../css/Header.css';

export default function Header() {
    const [selectedItem, setSelectedItem] = useState(1);
    // const [isSelected, setSelected] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const items = [
        {
            key: 1,
            text: "Home",
            id: "#home"
        },
        {
            key: 2,
            text: "Projects",
            id: "#projects"
        },
        {
            key: 3,
            text: "About",
            id: "#about"
        },
        // {
        //     key: 4,
        //     text: "Skills", id: "#skills"
        // },
        // {
        //     key: 5,
        //     text: "Get in Touch", id: "#contact"
        // },

    ]

    // function setItemSelected(item) {
    //     setSelectedItem(item)
    // }
    useEffect(() => {
        const onScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener("scroll", onScroll)
        return () => window.removeEventListener("scroll", onScroll)
    }, [])
    return (
        <header className={`header ${scrolled ? 'scrolled' : ''}`}>
            <h2 className='logo-border'>
                <p className='logo-text'>
                    AB
                </p>
            </h2>
            {/* <nav> */}
            {/* <a href="">Projects</a>
                <a href="">About</a>
                <a href="">Contact</a> */}
            {/* <li>Button1</li> */}
            {/* </nav> */}
            {/* <p>Experienced Professional | Developer | Projects Showcase</p> */}
            {/* <ul className="list-type"> */}
            <ul >
                {
                    items && items.map(item => (
                        // <li className="header-list-items" key={item.key}>
                        <li key={item.key} onClick={() => setSelectedItem(item.key)}>
                            <a href={item.id} className={`item ${selectedItem === item.key ? 'selected' : 'unSelected'}`} >
                                {item.text}
                            </a>
                        </li>
                    ))
                }
            </ul>
        </header>
    );
}
