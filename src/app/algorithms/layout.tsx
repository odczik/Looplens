import fs from 'fs';
import Link from 'next/link';
import path from 'path';
import { fileURLToPath } from 'url';

import style from './layout.module.css';

import BackButton from '@/app/_components/backButton';
import DirectoryList from './directoryList';

// Function to get directories recursively, with a maximum depth
function getDirectories(dirPath: string, basePath: string = '', maxDepth: number = 2, currentDepth: number = 0): any[] {
  if (currentDepth >= maxDepth) return [];
  
  const entries = fs.readdirSync(dirPath);
  const result = [];
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry);
    const relativePath = basePath ? `${basePath}/${entry}` : entry;
    
    try {
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
            // Convert kebab-case to Title Case
            const name = entry.split("-").map(part => 
                part.charAt(0).toUpperCase() + part.slice(1)
            ).join(" ");
            
            const subdirs = getDirectories(fullPath, relativePath, maxDepth, currentDepth + 1);
            
            result.push({
                path: relativePath,
                name,
                subdirectories: subdirs,
                expanded: false
            });
        }
    } catch (error) {
        console.error(`Error processing ${fullPath}:`, error);
    }
  }
  
  return result;
}

export default function AlgorithmLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Get current URL path
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    
    // Get directories and their subdirectories
    const algorithms = getDirectories(__dirname);

    return (
        <main className={style.main}>
        <aside className={style.sidebar}>
            <BackButton fallbackPath='/algorithms' />
            <DirectoryList directories={algorithms} currentPath={currentPath} />
        </aside>
        {children}
        </main>
    );
}