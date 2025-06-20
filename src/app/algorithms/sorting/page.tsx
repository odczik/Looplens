import fs from 'fs';
import Link from 'next/link';
import path from 'path';
import { fileURLToPath } from 'url';

export default function SortingAlgorithms() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const algorithms = fs.readdirSync(__dirname).filter(file => !file.endsWith('.tsx'));

    const algorithmsWithNames = algorithms.map(algo => {
        const path = algo;
        // Convert kebab-case to Title Case
        const name = algo.split("-").map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");

        return { path, name };
    });

    return (
        <>
        <h1>Sorting algorithms page</h1>
        <ul>
            {algorithmsWithNames.map((algo, i) => (
                <li key={i}>
                    <Link href={__dirname.split("/")[__dirname.split("/").length-1] + "/" + algo.path}>{algo.name}</Link>
                </li>
            ))}
        </ul>
        </>
    );
}