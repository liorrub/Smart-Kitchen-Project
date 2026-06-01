import "./Login.css";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { login } from "../services/authService";
import { validateLogin } from "../validators/loginValidator";
import { useAuth } from "../context/AuthContext";

import logo from "../assets/logo.png";

import login1 from "../assets/login1.png";
import login2 from "../assets/login2.png";
import login3 from "../assets/login3.png";
import login4 from "../assets/login4.png";
import login5 from "../assets/login5.png";
import login6 from "../assets/login6.png";
import login7 from "../assets/login7.png";
import login8 from "../assets/login8.png";
import login9 from "../assets/login9.png";
import login10 from "../assets/login10.png";
import login11 from "../assets/login11.png";
import login12 from "../assets/login12.png";
import login13 from "../assets/login13.png";
import login14 from "../assets/login14.png";


const subtitles = [
    "Plan healthy meals",
    "Track your pantry",
    "Create shopping lists",
    "Get AI cooking advice",
    "Cook smarter every day"
];

const foodImages = [
    login1,
    login2,
    login3,
    login4,
    login5,
    login6,
    login7,
    login8,
    login9,
    login10,
    login11,
    login12,
    login13,
    login14,
];

const FOOD_SIZE = 95;
const COLLISION_DISTANCE = 112;
const CARD_PADDING = 30;
const EDGE_PADDING = 12;

function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

function createVelocity() {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(0.4, 0.9);
    return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    };
}

function intersectsRect(food, rect, padding = 0) {
    return (
        food.x < rect.right + padding &&
        food.x + FOOD_SIZE > rect.left - padding &&
        food.y < rect.bottom + padding &&
        food.y + FOOD_SIZE > rect.top - padding
    );
}

function isTooCloseToOtherFoods(food, foods) {
    return foods.some((existingFood) => {
        const dx = existingFood.x - food.x;
        const dy = existingFood.y - food.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < COLLISION_DISTANCE;
    });
}

function createInitialFoods(count, cardRect) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const foods = [];

    for (let i = 0; i < count; i++) {
        let food;
        let attempts = 0;

        do {
            const placeOnLeft = i % 2 === 0;

            let minX;
            let maxX;

            if (placeOnLeft) {
                minX = EDGE_PADDING;
                maxX = cardRect
                    ? cardRect.left - FOOD_SIZE - CARD_PADDING
                    : screenWidth * 0.3;
            } else {
                minX = cardRect
                    ? cardRect.right + CARD_PADDING
                    : screenWidth * 0.65;
                maxX = screenWidth - FOOD_SIZE - EDGE_PADDING;
            }

            if (maxX <= minX) {
                minX = EDGE_PADDING;
                maxX = screenWidth - FOOD_SIZE - EDGE_PADDING;
            }

            const velocity = createVelocity();

            food = {
                x: randomBetween(minX, maxX),
                y: randomBetween(
                    EDGE_PADDING,
                    screenHeight - FOOD_SIZE - EDGE_PADDING
                ),
                vx: velocity.vx,
                vy: velocity.vy
            };

            attempts++;
        } while (
            attempts < 120 &&
            (
                isTooCloseToOtherFoods(food, foods) ||
                (cardRect && intersectsRect(food, cardRect, CARD_PADDING))
            )
            );

        foods.push(food);
    }

    return foods;
}

function bounceFromScreenEdges(food) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (food.x <= EDGE_PADDING) {
        food.x = EDGE_PADDING;
        food.vx *= -1;
    }

    if (food.x + FOOD_SIZE >= screenWidth - EDGE_PADDING) {
        food.x = screenWidth - FOOD_SIZE - EDGE_PADDING;
        food.vx *= -1;
    }

    if (food.y <= EDGE_PADDING) {
        food.y = EDGE_PADDING;
        food.vy *= -1;
    }

    if (food.y + FOOD_SIZE >= screenHeight - EDGE_PADDING) {
        food.y = screenHeight - FOOD_SIZE - EDGE_PADDING;
        food.vy *= -1;
    }
}

function bounceFromCard(food, cardRect) {
    if (!cardRect || !intersectsRect(food, cardRect, CARD_PADDING)) {
        return;
    }

    const foodCenterX = food.x + FOOD_SIZE / 2;
    const foodCenterY = food.y + FOOD_SIZE / 2;

    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    const dx = foodCenterX - cardCenterX;
    const dy = foodCenterY - cardCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
            food.x = cardRect.left - FOOD_SIZE - CARD_PADDING;
        } else {
            food.x = cardRect.right + CARD_PADDING;
        }

        food.vx *= -1;
    } else {
        if (dy < 0) {
            food.y = cardRect.top - FOOD_SIZE - CARD_PADDING;
        } else {
            food.y = cardRect.bottom + CARD_PADDING;
        }

        food.vy *= -1;
    }

    bounceFromScreenEdges(food);
}

function handleFoodCollisions(foods) {
    for (let i = 0; i < foods.length; i++) {
        for (let j = i + 1; j < foods.length; j++) {
            const firstFood = foods[i];
            const secondFood = foods[j];

            const firstCenterX = firstFood.x + FOOD_SIZE / 2;
            const firstCenterY = firstFood.y + FOOD_SIZE / 2;

            const secondCenterX = secondFood.x + FOOD_SIZE / 2;
            const secondCenterY = secondFood.y + FOOD_SIZE / 2;

            let dx = secondCenterX - firstCenterX;
            let dy = secondCenterY - firstCenterY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) {
                dx = 1;
                dy = 1;
                distance = Math.sqrt(2);
            }

            if (distance < COLLISION_DISTANCE) {
                const normalX = dx / distance;
                const normalY = dy / distance;

                const overlap = COLLISION_DISTANCE - distance;

                firstFood.x -= normalX * overlap * 0.5;
                firstFood.y -= normalY * overlap * 0.5;

                secondFood.x += normalX * overlap * 0.5;
                secondFood.y += normalY * overlap * 0.5;

                const relativeVx = secondFood.vx - firstFood.vx;
                const relativeVy = secondFood.vy - firstFood.vy;

                const movingTowardEachOther =
                    relativeVx * normalX + relativeVy * normalY < 0;

                if (movingTowardEachOther) {
                    const firstVx = firstFood.vx;
                    const firstVy = firstFood.vy;

                    firstFood.vx = secondFood.vx;
                    firstFood.vy = secondFood.vy;

                    secondFood.vx = firstVx;
                    secondFood.vy = firstVy;
                }

                bounceFromScreenEdges(firstFood);
                bounceFromScreenEdges(secondFood);
            }
        }
    }
}

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [subtitleIndex, setSubtitleIndex] = useState(0);

    const foodRefs = useRef([]);
    const cardRef = useRef(null);

    const navigate = useNavigate();
    const { setUser } = useAuth();

    useEffect(() => {
        const interval = setInterval(() => {
            setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let animationFrameId;
        let previousTime = performance.now();

        let foods = createInitialFoods(
            foodImages.length,
            cardRef.current?.getBoundingClientRect()
        );

        function applyFoodPositions() {
            foods.forEach((food, index) => {
                const foodElement = foodRefs.current[index];

                if (foodElement) {
                    foodElement.style.transform =
                        `translate3d(${food.x}px, ${food.y}px, 0)`;
                }
            });
        }

        function animate(currentTime) {
            const delta = Math.min((currentTime - previousTime) / 16.67, 2);
            previousTime = currentTime;

            const cardRect = cardRef.current?.getBoundingClientRect();

            foods.forEach((food) => {
                food.x += food.vx * delta;
                food.y += food.vy * delta;

                bounceFromScreenEdges(food);
                bounceFromCard(food, cardRect);
            });

            handleFoodCollisions(foods);

            foods.forEach((food) => {
                bounceFromScreenEdges(food);
                bounceFromCard(food, cardRect);
            });

            applyFoodPositions();

            animationFrameId = requestAnimationFrame(animate);
        }

        applyFoodPositions();
        animationFrameId = requestAnimationFrame(animate);

        function handleResize() {
            foods = createInitialFoods(
                foodImages.length,
                cardRef.current?.getBoundingClientRect()
            );

            applyFoodPositions();
        }

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        const validationError = validateLogin(email, password);

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setLoading(true);

            const result = await login(email, password);

            setUser(result.data);

            localStorage.setItem(
                "user",
                JSON.stringify(result.data)
            );

            navigate("/dashboard");
        } catch (error) {
            console.error(error);

            setError("Login failed. Please check your credentials.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page">
            {error && (
                <div className="modal-overlay">
                    <div className="error-modal">
                        <h3>Login Error</h3>

                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => setError("")}
                        >
                            Got It 👍
                        </button>
                    </div>
                </div>
            )}

            <div className="floating-foods">
                {foodImages.map((foodImage, index) => (
                    <img
                        key={index}
                        ref={(element) => {
                            foodRefs.current[index] = element;
                        }}
                        src={foodImage}
                        className="food"
                        alt=""
                    />
                ))}
            </div>

            <div className="login-card" ref={cardRef}>
                <img
                    src={logo}
                    alt="Smart Kitchen"
                    className="login-logo"
                />

                <p
                    key={subtitleIndex}
                    className="login-subtitle"
                >
                    {subtitles[subtitleIndex]}
                </p>

                <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="login-form"
                >
                    <div>
                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => {
                                setEmail(event.target.value);
                                setError("");
                            }}
                        />
                    </div>

                    <div>
                        <label>Password</label>

                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(event) => {
                                    setPassword(event.target.value);
                                    setError("");
                                }}
                            />

                            <button
                                type="button"
                                className="show-password-button"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>

                <div className="register-section">
                    <p>Don't have an account?</p>

                    <button
                        type="button"
                        className="register-button"
                        onClick={() => navigate("/register")}
                    >
                        Sign Up
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Login;