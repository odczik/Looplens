'use client'

import { useRef, useState } from "react";

export default function BubbleSort() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [play, setPlay] = useState(false);

    const handlePlay = () => {
        setPlay(!play);
    }

    return (
        <div className="algorithmPlayground">
            <h1>Bubble sort page</h1>
            <canvas ref={canvasRef} width={1280} height={960} />
            <div className="controlsContainer">
                <div className="generalControls">
                    <button className="iconContainer" onClick={handlePlay}>
                        {play ? (
                            <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/play--v1.png')"}}></span>
                        ) : (
                            <span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/pause.png')"}}></span>
                        )}
                    </button>
                    <button className="iconContainer"><span className="icon" style={{maskImage: "url('https://img.icons8.com/material-rounded/96/redo.png')"}}></span></button>
                </div>
                <div className="algorithmControls">

                </div>
            </div>
        </div>
    );
}