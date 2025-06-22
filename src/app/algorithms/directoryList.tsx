'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import style from './layout.module.css';
import { usePathname } from 'next/navigation';

// Recursive component to render directory tree
export default function DirectoryList({ directories, isSubdirectory = false }: { 
    directories: Array<{ path: string, name: string, subdirectories: any[], expanded: boolean }>,
    isSubdirectory?: boolean
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
        <ul className={isSubdirectory ? style.directoryListSub : style.directoryList}>
        {directoriesState.map((dir, i) => (
            <li key={i} className={style.directoryListItem}>
                <div 
                    className={style.directoryListItemHead}
                    style={usePathname().includes(dir.path) ? {backgroundColor: "var(--glass-background-hover)"} : {}}
                >
                    { isSubdirectory ? null : (
                        <button 
                            className={style.toggleButton} 
                            onClick={() => {
                                toggleDirectory(dir.path);
                            }}
                            disabled={dir.subdirectories.length === 0}
                            aria-label={dir.expanded ? 'Collapse' : 'Expand'}
                        >
                            <span className={style.directoryArrow} style={dir.expanded ? {transform: 'rotate(60deg)'} : {transform: 'rotate(-30deg)'}}></span>
                        </button>
                    )}
                    <Link 
                        href={`/algorithms/${dir.path}`}
                    >
                        {dir.name}
                    </Link>
                </div>
                { dir.subdirectories.length > 0 && dir.expanded ? (
                    <DirectoryList 
                        directories={dir.subdirectories} 
                        isSubdirectory={true}
                    />
                ) : null }
            </li>
        ))}
        </ul>
    );
}