import style from './navbar.module.css';

export default function Navbar() {
    return (
        <nav className={style.navbar}>
            <div>
                <a href="/">LOOPLENS</a>
            </div>
            <div>
                <a href="/algorithms">Explore</a>
            </div>
        </nav>
    );
}