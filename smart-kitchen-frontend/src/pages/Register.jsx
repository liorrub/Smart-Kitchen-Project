import "./Login.css";

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { register } from "../services/authService";

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

const cookingLevelOptions = [
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" }
];

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

    if (food.x < EDGE_PADDING || food.x + FOOD_SIZE > screenWidth - EDGE_PADDING) {
        food.vx *= -1;
    }

    if (food.y < EDGE_PADDING || food.y + FOOD_SIZE > screenHeight - EDGE_PADDING) {
        food.vy *= -1;
    }

    food.x = Math.max(
        EDGE_PADDING,
        Math.min(food.x, screenWidth - FOOD_SIZE - EDGE_PADDING)
    );

    food.y = Math.max(
        EDGE_PADDING,
        Math.min(food.y, screenHeight - FOOD_SIZE - EDGE_PADDING)
    );
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

function Register() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        city: "",
        age: "",
        cookingLevel: "beginner"
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [subtitleIndex, setSubtitleIndex] = useState(0);

    const foodRefs = useRef([]);
    const cardRef = useRef(null);

    const navigate = useNavigate();

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
            foodRefs.current.forEach((foodRef, index) => {
                const food = foods[index];

                if (foodRef && food) {
                    foodRef.style.transform = `translate(${food.x}px, ${food.y}px)`;
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

    function handleChange(event) {
        const { name, value } = event.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");

        // Basic validation
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim() || !formData.password.trim() ||
            !formData.city.trim() || !formData.age) {
            setError("All fields are required");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (Number(formData.age) < 1 || Number(formData.age) > 120) {
            setError("Age must be between 1 and 120");
            return;
        }

        try {
            setLoading(true);

            await register({
                firstName: formData.firstName.trim(),
                lastName: formData.lastName.trim(),
                email: formData.email.trim(),
                password: formData.password,
                city: formData.city.trim(),
                age: Number(formData.age),
                cookingLevel: formData.cookingLevel
            });

            setSuccess("Your account was created successfully.");        } catch (error) {
            console.error(error.response?.data || error);
            
            let errorMessage = "Registration failed. Please try again.";
            
            if (error.response?.data?.error?.message) {
                errorMessage = error.response.data.error.message;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            
            // Special handling for EMAIL_ALREADY_EXISTS error
            if (error.response?.status === 409 || errorMessage.includes("EMAIL_ALREADY_EXISTS") || errorMessage.includes("already exists")) {
                errorMessage = "Email already exists. Please use another email.";
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-page register-page">
            {(error || success) && (
                <div className="modal-overlay">
                    <div className={success ? "error-modal success-modal" : "error-modal"}>
                        <h3>{success ? "Success" : "Registration Error"}</h3>
                        <p>{error || success}</p>
                        <button
                            type="button"
                            onClick={() => {
                                if (success) {
                                    navigate("/");
                                    return;
                                }

                                setError("");
                            }}
                        >
                            {success ? "Back to Login" : "Got It 👍"}
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

            <div className="login-card register-card" ref={cardRef}>
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
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Enter your first name"
                            value={formData.firstName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Enter your last name"
                            value={formData.lastName}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>City</label>
                        <input
                            type="text"
                            name="city"
                            placeholder="Enter your city"
                            value={formData.city}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Password</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button
                                type="button"
                                className="show-password-button"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label>Age</label>
                        <input
                            type="number"
                            name="age"
                            min="1"
                            max="120"
                            placeholder="Enter your age"
                            value={formData.age}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label>Cooking Level</label>
                        <select
                            name="cookingLevel"
                            value={formData.cookingLevel}
                            onChange={handleChange}
                        >
                            {cookingLevelOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <div className="register-section">
                    <p>Already have an account?</p>
                    <button
                        type="button"
                        className="register-button"
                        onClick={() => navigate("/")}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Register;
