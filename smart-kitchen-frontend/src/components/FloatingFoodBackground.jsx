import { useEffect, useRef } from "react";

import "./FloatingFoodBackground.css";

/*
    Returns a random number between the given minimum and maximum values.
*/
function randomBetween(min, max) {
    return Math.random() * (max - min) + min;
}

/*
    Creates a random movement direction for one food image.
*/
function createVelocity(minSpeed, maxSpeed) {
    const angle = randomBetween(0, Math.PI * 2);
    const speed = randomBetween(minSpeed, maxSpeed);

    return {
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed
    };
}

/*
    Checks whether a food image touches a rectangle.
    Used to keep food images away from the login/register card.
*/
function intersectsRect(food, rect, imageSize, padding = 0) {
    return (
        food.x < rect.right + padding &&
        food.x + imageSize > rect.left - padding &&
        food.y < rect.bottom + padding &&
        food.y + imageSize > rect.top - padding
    );
}

/*
    Checks if a food image is too close to another food image.
    This prevents overlapping when the animation starts.
*/
function isTooCloseToOtherFoods(food, foods, collisionDistance) {
    return foods.some((existingFood) => {
        const dx = existingFood.x - food.x;
        const dy = existingFood.y - food.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < collisionDistance;
    });
}

/*
    Creates the first position and movement direction for all food images.
*/
function createInitialFoods({
                                count,
                                avoidRect,
                                imageSize,
                                collisionDistance,
                                cardPadding,
                                edgePadding,
                                minSpeed,
                                maxSpeed
                            }) {
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
                minX = edgePadding;
                maxX = avoidRect
                    ? avoidRect.left - imageSize - cardPadding
                    : screenWidth * 0.35;
            } else {
                minX = avoidRect
                    ? avoidRect.right + cardPadding
                    : screenWidth * 0.65;

                maxX = screenWidth - imageSize - edgePadding;
            }

            /*
                If there is not enough room on one side,
                place the image anywhere on the screen.
            */
            if (maxX <= minX) {
                minX = edgePadding;
                maxX = screenWidth - imageSize - edgePadding;
            }

            const velocity = createVelocity(minSpeed, maxSpeed);

            food = {
                x: randomBetween(minX, maxX),
                y: randomBetween(
                    edgePadding,
                    screenHeight - imageSize - edgePadding
                ),
                vx: velocity.vx,
                vy: velocity.vy
            };

            attempts++;
        } while (
            attempts < 120 &&
            (
                isTooCloseToOtherFoods(food, foods, collisionDistance) ||
                (
                    avoidRect &&
                    intersectsRect(food, avoidRect, imageSize, cardPadding)
                )
            )
            );

        foods.push(food);
    }

    return foods;
}

/*
    Keeps a food image inside the screen.
    If it reaches an edge, it changes direction.
*/
function bounceFromScreenEdges(food, imageSize, edgePadding) {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    if (
        food.x < edgePadding ||
        food.x + imageSize > screenWidth - edgePadding
    ) {
        food.vx *= -1;
    }

    if (
        food.y < edgePadding ||
        food.y + imageSize > screenHeight - edgePadding
    ) {
        food.vy *= -1;
    }

    food.x = Math.max(
        edgePadding,
        Math.min(food.x, screenWidth - imageSize - edgePadding)
    );

    food.y = Math.max(
        edgePadding,
        Math.min(food.y, screenHeight - imageSize - edgePadding)
    );
}

/*
    Makes a food image bounce away from the card.
*/
function bounceFromCard(food, avoidRect, imageSize, cardPadding, edgePadding) {
    if (
        !avoidRect ||
        !intersectsRect(food, avoidRect, imageSize, cardPadding)
    ) {
        return;
    }

    const foodCenterX = food.x + imageSize / 2;
    const foodCenterY = food.y + imageSize / 2;

    const cardCenterX = avoidRect.left + avoidRect.width / 2;
    const cardCenterY = avoidRect.top + avoidRect.height / 2;

    const dx = foodCenterX - cardCenterX;
    const dy = foodCenterY - cardCenterY;

    if (Math.abs(dx) > Math.abs(dy)) {
        food.x = dx < 0
            ? avoidRect.left - imageSize - cardPadding
            : avoidRect.right + cardPadding;

        food.vx *= -1;
    } else {
        food.y = dy < 0
            ? avoidRect.top - imageSize - cardPadding
            : avoidRect.bottom + cardPadding;

        food.vy *= -1;
    }

    bounceFromScreenEdges(food, imageSize, edgePadding);
}

/*
    Handles collisions between food images.
    This keeps the images from sitting on top of each other.
*/
function handleFoodCollisions(foods, imageSize, collisionDistance, edgePadding) {
    for (let i = 0; i < foods.length; i++) {
        for (let j = i + 1; j < foods.length; j++) {
            const firstFood = foods[i];
            const secondFood = foods[j];

            const firstCenterX = firstFood.x + imageSize / 2;
            const firstCenterY = firstFood.y + imageSize / 2;

            const secondCenterX = secondFood.x + imageSize / 2;
            const secondCenterY = secondFood.y + imageSize / 2;

            let dx = secondCenterX - firstCenterX;
            let dy = secondCenterY - firstCenterY;

            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance === 0) {
                dx = 1;
                dy = 1;
                distance = Math.sqrt(2);
            }

            if (distance < collisionDistance) {
                const normalX = dx / distance;
                const normalY = dy / distance;
                const overlap = collisionDistance - distance;

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

                bounceFromScreenEdges(firstFood, imageSize, edgePadding);
                bounceFromScreenEdges(secondFood, imageSize, edgePadding);
            }
        }
    }
}

function FloatingFoodBackground({
                                    images,
                                    avoidRef,
                                    imageSize = 76,
                                    collisionDistance = 96,
                                    cardPadding = 34,
                                    edgePadding = 16,
                                    minSpeed = 0.28,
                                    maxSpeed = 0.62
                                }) {
    const foodRefs = useRef([]);

    useEffect(() => {
        let animationFrameId;
        let previousTime = performance.now();

        let foods = createInitialFoods({
            count: images.length,
            avoidRect: avoidRef?.current?.getBoundingClientRect(),
            imageSize,
            collisionDistance,
            cardPadding,
            edgePadding,
            minSpeed,
            maxSpeed
        });

        function applyFoodPositions() {
            foodRefs.current.forEach((foodRef, index) => {
                const food = foods[index];

                if (foodRef && food) {
                    foodRef.style.transform =
                        `translate3d(${food.x}px, ${food.y}px, 0)`;
                }
            });
        }

        function animate(currentTime) {
            const delta = Math.min((currentTime - previousTime) / 16.67, 2);

            previousTime = currentTime;

            const avoidRect = avoidRef?.current?.getBoundingClientRect();

            foods.forEach((food) => {
                food.x += food.vx * delta;
                food.y += food.vy * delta;

                bounceFromScreenEdges(food, imageSize, edgePadding);

                bounceFromCard(
                    food,
                    avoidRect,
                    imageSize,
                    cardPadding,
                    edgePadding
                );
            });

            handleFoodCollisions(
                foods,
                imageSize,
                collisionDistance,
                edgePadding
            );

            foods.forEach((food) => {
                bounceFromScreenEdges(food, imageSize, edgePadding);

                bounceFromCard(
                    food,
                    avoidRect,
                    imageSize,
                    cardPadding,
                    edgePadding
                );
            });

            applyFoodPositions();

            animationFrameId = requestAnimationFrame(animate);
        }

        applyFoodPositions();
        animationFrameId = requestAnimationFrame(animate);

        function handleResize() {
            foods = createInitialFoods({
                count: images.length,
                avoidRect: avoidRef?.current?.getBoundingClientRect(),
                imageSize,
                collisionDistance,
                cardPadding,
                edgePadding,
                minSpeed,
                maxSpeed
            });

            applyFoodPositions();
        }

        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, [
        images,
        avoidRef,
        imageSize,
        collisionDistance,
        cardPadding,
        edgePadding,
        minSpeed,
        maxSpeed
    ]);

    return (
        <div
            className="floating-foods"
            aria-hidden="true"
        >
            {images.map((image, index) => (
                <img
                    key={`${image}-${index}`}
                    ref={(element) => {
                        foodRefs.current[index] = element;
                    }}
                    src={image}
                    className="floating-food"
                    alt=""
                />
            ))}
        </div>
    );
}

export default FloatingFoodBackground;