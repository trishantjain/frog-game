
import { useEffect, useRef, useState } from "react";
import frogSrc from "../assets/frog.png";
import lilySrc from "../assets/lily.png";

const CANVAS_WIDTH = 360;
const CANVAS_HEIGHT = 640;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;


export default function GameCanvas() {
    const canvasRef = useRef(null);
    const frogImg = useRef(new Image());
    const lilyImg = useRef(new Image());

    const jumpSound = useRef(new Audio("/jump.wav"));
    const gameOverSound = useRef(new Audio("/gameover.wav"));

    const [gameState, setGameState] = useState("start"); // start | play | over
    const [score, setScore] = useState(0);
    const [assetsLoaded, setAssetsLoaded] = useState(false);


    const animationRef = useRef(null);


    const frog = useRef({
        x: 160,
        y: 500,
        width: 40,
        height: 40,
        velocityY: 0,
    });

    const pads = useRef([]);
    const speed = useRef(1);

    const startGameLoop = () => {
        const ctx = canvasRef.current.getContext("2d");

        const loop = () => {
            if (gameState !== "play") {
                cancelAnimationFrame(animationRef.current);
                return;
            }

            ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            ctx.fillStyle = "#1e1e1e"; // dark gray
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);


            // Frog physics
            frog.current.velocityY += GRAVITY;
            frog.current.y += frog.current.velocityY;

            // Draw frog
            ctx.drawImage(
                frogImg.current,
                frog.current.x,
                frog.current.y,
                frog.current.width,
                frog.current.height
            );

            // Pads
            pads.current.forEach((pad) => {
                pad.y += speed.current;
                ctx.drawImage(lilyImg.current, pad.x, pad.y, pad.width, pad.height);

                // Collision
                if (
                    frog.current.x < pad.x + pad.width &&
                    frog.current.x + frog.current.width > pad.x &&
                    frog.current.y + frog.current.height < pad.y + 10 &&
                    frog.current.y + frog.current.height > pad.y &&
                    frog.current.velocityY > 0
                ) {
                    frog.current.velocityY = JUMP_FORCE;
                    setScore((s) => s + 1);
                    speed.current += 0.05;
                }
            });

            pads.current = pads.current.filter((p) => p.y < CANVAS_HEIGHT);

            if (pads.current.length < 5) {
                pads.current.push({
                    x: Math.random() * 300,
                    y: -20,
                    width: 60,
                    height: 20,
                });
            }

            if (frog.current.y > CANVAS_HEIGHT) {
                gameOverSound.current.play();
                setGameState("over");
                cancelAnimationFrame(animationRef.current);
                return;
            }

            animationRef.current = requestAnimationFrame(loop);
        };

        animationRef.current = requestAnimationFrame(loop);
    };


    useEffect(() => {
        let loaded = 0;

        const checkLoaded = () => {
            loaded++;
            if (loaded === 2) {
                setAssetsLoaded(true);
            }
        };

        frogImg.current.src = frogSrc;
        lilyImg.current.src = lilySrc;

        frogImg.current.onload = checkLoaded;
        lilyImg.current.onload = checkLoaded;
    }, []);

    useEffect(() => {
        if (gameState === "play") {
            startGameLoop();
        }

        return () => cancelAnimationFrame(animationRef.current);
    }, [gameState]);

    const createPads = () => {
        pads.current = [];
        for (let i = 0; i < 5; i++) {
            pads.current.push({
                x: Math.random() * 280,
                y: 400 - i * 120, // IMPORTANT CHANGE
                width: 60,
                height: 20,
            });
        }
    };

    const jump = () => {
        frog.current.velocityY = JUMP_FORCE;
        jumpSound.current.currentTime = 0;
        jumpSound.current.play();
    };


    const startGame = () => {
        if (!assetsLoaded) return;

        createPads();
        // Place frog on top of the first pad
        if (pads.current.length > 0) {
            frog.current.x = pads.current[0].x + pads.current[0].width / 2 - frog.current.width / 2;
            frog.current.y = pads.current[0].y - frog.current.height;
        } else {
            frog.current.x = 160;
            frog.current.y = 500;
        }
        frog.current.velocityY = 0;
        speed.current = 1;
        setScore(0);
        setGameState("play");
    };


    // Controls

    useEffect(() => {
        const handleKey = (e) => {
            if (gameState !== "play") return;
            if (e.code === "Space") {
                jump();
            } else if (e.code === "ArrowLeft" || e.key === "a" || e.key === "A") {
                frog.current.x -= 20;
                if (frog.current.x < 0) frog.current.x = 0;
            } else if (e.code === "ArrowRight" || e.key === "d" || e.key === "D") {
                frog.current.x += 20;
                if (frog.current.x > CANVAS_WIDTH - frog.current.width) frog.current.x = CANVAS_WIDTH - frog.current.width;
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [gameState]);

    return (
        <div style={{ textAlign: "center" }}>
            {gameState === "start" && (
                <>
                    <h2>🐸 Frog Hop Frenzy</h2>
                    {!assetsLoaded ? (
                        <p>Loading assets...</p>
                    ) : (
                        <button onClick={startGame}>Start Game</button>
                    )}
                </>
            )}

            {gameState === "over" && (
                <>
                    <h2>Game Over</h2>
                    <p>Score: {score}</p>
                    <button onClick={startGame}>Restart</button>
                </>
            )}

            <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onTouchStart={jump}
                style={{ border: "2px solid #333", marginTop: "10px" }}
            />
        </div>
    );
}
