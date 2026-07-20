export default function ProjectCard({ title, description, link }) {
    function openTile(url) {
        window.open(url, '_blank');
    }


    return (
        <div className="project-card" onClick={() => openTile(link)}>
            <h3>{title}</h3>
            <p>{description}</p>

            <a href={link} target="_blank" rel="noopener noreferrer">
            </a>
        </div>
    );
}
