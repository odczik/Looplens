import style from './navbar.module.css';

export default function Navbar() {
    return (
        <nav className={style.navbar}>
            <div className={style.navbarLeft}>
                <a href="/" className={style.logoContainer}><span className={style.logoImage}></span></a>
                <a href='/about'>About</a>
            </div>
            <div className={style.navbarRight}>
                <a href="/algorithms">Explore</a>
            </div>
        </nav>
    );
}