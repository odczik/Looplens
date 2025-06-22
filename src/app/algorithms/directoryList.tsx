'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import style from './layout.module.css';

// Recursive component to render directory tree
export default function DirectoryList({ directories, currentPath }: { 
    directories: Array<{ path: string, name: string, subdirectories: any[], expanded: boolean }>,
    currentPath: string 
}) {
    const [directoriesState, setDirectoriesState] = useState(directories);

    useEffect(() => {
        setDirectoriesState(directories);
    }, [directories]);

    const toggleDirectory = (path: string) => {
        setDirectoriesState(prevState => 
            prevState.map(dir => 
                dir.path === path ? { ...dir, expanded: !dir.expanded } : dir
            )
        );
    };

    return (
        <ul className={style.directoryList}>
        {directoriesState.map((dir, i) => (
            <li key={i} className={style.directoryItem}>
                { dir.subdirectories.length > 0 ? (
                    <button 
                        className={style.toggleButton} 
                        onClick={() => {
                            toggleDirectory(dir.path);
                        }}
                    >
                        {dir.expanded ? '▼' : '►'}
                    </button>
                ) : null }
                <Link 
                    href={`/algorithms/${dir.path}`}
                    className={currentPath.includes(dir.path) ? style.activeLink : ''}
                >
                    {dir.name}
                </Link>
                { dir.subdirectories.length > 0 && dir.expanded ? (
                    <DirectoryList 
                        directories={dir.subdirectories} 
                        currentPath={currentPath}
                    />
                ) : null }
            </li>
        ))}
        </ul>
    );
}