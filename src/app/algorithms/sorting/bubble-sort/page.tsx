'use client'

import { useRef, useState } from "react";

import BubbleSortAlgorithm from "./bubble-sort";

export default function BubbleSort() {
    const [play, setPlay] = useState<boolean>(false);

    const forwardRef = useRef<HTMLButtonElement>(null!);
    const resetRef = useRef<HTMLButtonElement>(null!);

    const handlePlay = () => {
        setPlay(!play);
    }

    return (
        <div className="algorithmPlayground">
            <h1>Bubble sort page</h1>
            <BubbleSortAlgorithm play={play} setPlay={setPlay} forwardRef={forwardRef} resetRef={resetRef} />
            <div className="controlsContainer">
                <div className="generalControls">
                    <button className="iconContainer" onClick={handlePlay}>
                        {play ? (
                            <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/pause.png')"}}></span>
                        ) : (
                            <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/play--v1.png')"}}></span>
                        )}
                    </button>
                    <button className="iconContainer" ref={forwardRef}><span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/redo.png')"}}></span></button>
                    <button className="iconContainer" ref={resetRef}><span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/restart--v1.png')"}}></span></button>
                </div>
                <div className="algorithmControls">

                </div>
            </div>
        </div>
    );
}