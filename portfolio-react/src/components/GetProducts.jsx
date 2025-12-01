// import handler from "../../api/dummy";
import { useState, useEffect } from "react";

export default function GetProducts() {

    const [data, setData] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const response = await fetch("/api/dummy");
            const json = await response.json();
            setData(json);
            console.log(json);
        }
        fetchData();
    }, []);
    return (
        <div>
            <ul>
                <li>{JSON.stringify(data)}</li>
            </ul>
        </div>
    )
}