import "./MealPlanner.css";

import { useEffect, useMemo, useState } from "react";

import AppButton from "../components/AppButton";
import CustomSelect from "../components/CustomSelect";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import {
    createMealPlanItem,
    deleteMealPlanItem,
    getRecipes,
    getUserMealPlan,
    updateMealPlanItem
} from "../services/mealPlanService";

const MEAL_TYPES = [
    {
        value: "breakfast",
        label: "Breakfast",
        icon: "☕"
    },
    {
        value: "lunch",
        label: "Lunch",
        icon: "🥗"
    },
    {
        value: "dinner",
        label: "Dinner",
        icon: "🍽️"
    },
    {
        value: "snack",
        label: "Snack",
        icon: "🍎"
    }
];

const EMPTY_MEAL_FORM = {
    date: "",
    mealType: "breakfast",
    itemId: "",
    calories: "",
    notes: ""
};

function getStoredUser() {
    return JSON.parse(localStorage.getItem("user") || "null");
}

function formatDateKey(date) {
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - timezoneOffset);

    return localDate.toISOString().slice(0, 10);
}

function getStartOfWeek(date) {
    const currentDate = new Date(date);
    const day = currentDate.getDay();
    const difference = day === 0 ? -6 : 1 - day;

    currentDate.setDate(currentDate.getDate() + difference);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate;
}

function getWeekDates(startDate) {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate);

        date.setDate(startDate.getDate() + index);

        return {
            date,
            key: formatDateKey(date),
            dayName: date.toLocaleDateString("en-US", {
                weekday: "long"
            }),
            shortDayName: date.toLocaleDateString("en-US", {
                weekday: "short"
            }),
            dayNumber: date.getDate(),
            monthName: date.toLocaleDateString("en-US", {
                month: "short"
            })
        };
    });
}

function formatMealType(mealType) {
    const meal = MEAL_TYPES.find(
        (currentMeal) => currentMeal.value === mealType
    );

    return meal?.label || mealType;
}

function getErrorMessage(error, fallbackMessage) {
    const responseData = error.response?.data;

    if (typeof responseData?.error?.message === "string") {
        return responseData.error.message;
    }

    if (typeof responseData?.message === "string") {
        return responseData.message;
    }

    if (typeof error.message === "string") {
        return error.message;
    }

    return fallbackMessage;
}

function MealPlanner() {
    const [weekStartDate, setWeekStartDate] = useState(
        getStartOfWeek(new Date())
    );

    const [mealPlan, setMealPlan] = useState([]);
    const [recipes, setRecipes] = useState([]);

    const [mealForm, setMealForm] = useState(EMPTY_MEAL_FORM);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealToDelete, setMealToDelete] = useState(null);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const storedUser = getStoredUser();

    const weekDates = useMemo(() => {
        return getWeekDates(weekStartDate);
    }, [weekStartDate]);

    const weekDateKeys = useMemo(() => {
        return new Set(weekDates.map((day) => day.key));
    }, [weekDates]);

    const recipeMap = useMemo(() => {
        return new Map(
            recipes.map((recipe) => [
                recipe.recipeId,
                recipe
            ])
        );
    }, [recipes]);

    const recipeOptions = useMemo(() => {
        return recipes.map((recipe) => ({
            value: recipe.recipeId,
            label: `${recipe.title} · ${recipe.totalTime || 0} min`
        }));
    }, [recipes]);

    const weeklyMeals = useMemo(() => {
        return mealPlan.filter((meal) =>
            weekDateKeys.has(meal.date)
        );
    }, [mealPlan, weekDateKeys]);

    const weeklyCalories = useMemo(() => {
        return weeklyMeals.reduce(
            (sum, meal) => sum + Number(meal.calories || 0),
            0
        );
    }, [weeklyMeals]);

    const quickMealsCount = weeklyMeals.filter((meal) => {
        const recipe = recipeMap.get(meal.itemId);

        return Number(recipe?.totalTime || 0) <= 30;
    }).length;

    const differentRecipesCount = new Set(
        weeklyMeals.map((meal) => meal.itemId)
    ).size;

    useEffect(() => {
        async function loadMealPlannerData() {
            try {
                setLoading(true);
                setError("");
                setSuccess("");

                if (!storedUser?.userId) {
                    setError("User was not found. Please login again.");
                    return;
                }

                const [
                    mealPlanData,
                    recipesData
                ] = await Promise.all([
                    getUserMealPlan(storedUser.userId),
                    getRecipes()
                ]);

                setMealPlan(
                    Array.isArray(mealPlanData)
                        ? mealPlanData.filter(
                            (meal) => meal.itemType === "recipe"
                        )
                        : []
                );

                setRecipes(Array.isArray(recipesData) ? recipesData : []);
            } catch (err) {
                console.error("Meal planner loading error:", err);

                setError(
                    getErrorMessage(
                        err,
                        "Failed to load meal planner."
                    )
                );
            } finally {
                setLoading(false);
            }
        }

        loadMealPlannerData();
    }, [storedUser?.userId]);

    function openCreateMealModal(date, mealType) {
        setError("");
        setSuccess("");
        setEditingMeal(null);
        setMealToDelete(null);

        setMealForm({
            ...EMPTY_MEAL_FORM,
            date,
            mealType
        });

        setIsMealModalOpen(true);
    }

    function openEditMealModal(meal) {
        setError("");
        setSuccess("");
        setMealToDelete(null);
        setEditingMeal(meal);

        setMealForm({
            date: meal.date || "",
            mealType: meal.mealType || "breakfast",
            itemId: meal.itemId || "",
            calories: meal.calories || "",
            notes: meal.notes || ""
        });

        setIsMealModalOpen(true);
    }

    function closeMealModal() {
        setIsMealModalOpen(false);
        setEditingMeal(null);
        setMealForm(EMPTY_MEAL_FORM);
        setError("");
    }

    function handleFormChange(event) {
        const { name, value } = event.target;

        setMealForm((previousForm) => ({
            ...previousForm,
            [name]: name === "calories"
                ? value.replace(/\D/g, "")
                : value
        }));
    }

    function validateMealForm() {
        if (!mealForm.date) {
            return "Date is required.";
        }

        if (!mealForm.mealType) {
            return "Meal type is required.";
        }

        if (!mealForm.itemId) {
            return "Please choose a recipe.";
        }

        return null;
    }

    function buildMealPayload() {
        return {
            date: mealForm.date,
            mealType: mealForm.mealType,
            itemType: "recipe",
            itemId: Number(mealForm.itemId),
            calories: Number(mealForm.calories || 0),
            notes: mealForm.notes.trim()
        };
    }

    async function handleSubmitMeal(event) {
        event.preventDefault();

        const validationError = validateMealForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            const mealPayload = buildMealPayload();

            if (editingMeal) {
                const updatedMeal = await updateMealPlanItem(
                    storedUser.userId,
                    editingMeal.mealId,
                    mealPayload
                );

                setMealPlan((previousMeals) =>
                    previousMeals.map((meal) =>
                        meal.mealId === editingMeal.mealId
                            ? updatedMeal
                            : meal
                    )
                );

                setSuccess("Meal updated successfully.");
            } else {
                const createdMeal = await createMealPlanItem(
                    storedUser.userId,
                    mealPayload
                );

                setMealPlan((previousMeals) => [
                    ...previousMeals,
                    createdMeal
                ]);

                setSuccess("Meal added successfully.");
            }

            closeMealModal();
        } catch (err) {
            console.error("Save meal error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to save meal."
                )
            );
        } finally {
            setSaving(false);
        }
    }

    function openDeleteMealModal(meal) {
        setError("");
        setSuccess("");
        setIsMealModalOpen(false);
        setEditingMeal(null);
        setMealToDelete(meal);
    }

    async function confirmDeleteMeal() {
        if (!mealToDelete) {
            return;
        }

        try {
            setDeleting(true);
            setError("");
            setSuccess("");

            await deleteMealPlanItem(
                storedUser.userId,
                mealToDelete.mealId
            );

            setMealPlan((previousMeals) =>
                previousMeals.filter(
                    (meal) => meal.mealId !== mealToDelete.mealId
                )
            );

            setMealToDelete(null);
            setSuccess("Meal deleted successfully.");
        } catch (err) {
            console.error("Delete meal error:", err);

            setError(
                getErrorMessage(
                    err,
                    "Failed to delete meal."
                )
            );
        } finally {
            setDeleting(false);
        }
    }

    function cancelDeleteMeal() {
        setMealToDelete(null);
    }

    function goToPreviousWeek() {
        setWeekStartDate((previousDate) => {
            const newDate = new Date(previousDate);

            newDate.setDate(newDate.getDate() - 7);

            return getStartOfWeek(newDate);
        });
    }

    function goToNextWeek() {
        setWeekStartDate((previousDate) => {
            const newDate = new Date(previousDate);

            newDate.setDate(newDate.getDate() + 7);

            return getStartOfWeek(newDate);
        });
    }

    function goToCurrentWeek() {
        setWeekStartDate(getStartOfWeek(new Date()));
    }

    function getMealsForSlot(date, mealType) {
        return mealPlan.filter(
            (meal) =>
                meal.date === date &&
                meal.mealType === mealType
        );
    }

    function getDayMeals(date) {
        return mealPlan.filter((meal) => meal.date === date);
    }

    function getMealDisplayName(meal) {
        return recipeMap.get(meal.itemId)?.title || `Recipe #${meal.itemId}`;
    }

    function getMealSubText(meal) {
        const recipe = recipeMap.get(meal.itemId);

        return recipe
            ? `${recipe.cuisine} · ${recipe.totalTime || 0} min`
            : "Recipe";
    }

    if (loading) {
        return (
            <div className="meal-planner-page">
                <FormCard
                    title="Loading meal planner..."
                    description="Please wait while we prepare your weekly meal plan."
                />
            </div>
        );
    }

    return (
        <div className="meal-planner-page">
            <MessageModal
                type="success"
                title="Success"
                message={success}
                onClose={() => setSuccess("")}
            />

            <MessageModal
                type="error"
                title="Meal Planner Error"
                message={error}
                onClose={() => setError("")}
            />

            <PageHero
                label="Meal Planner"
                title="Plan your week, one recipe at a time"
                description="Build a weekly recipe schedule. Add, edit and remove planned meals easily."
                stats={[
                    {
                        value: weeklyMeals.length,
                        label: "Planned meals"
                    },
                    {
                        value: differentRecipesCount,
                        label: "Recipes used"
                    },
                    {
                        value: quickMealsCount,
                        label: "Quick meals"
                    },
                    {
                        value: weeklyCalories,
                        label: "Calories"
                    }
                ]}
            />

            <section className="meal-board-card">
                <div className="meal-board-header">
                    <div>
                        <p>Weekly calendar</p>
                        <h2>Your meal schedule</h2>
                        <span>
                            Add recipes into each day. This view is designed to stay clean even when the week is full.
                        </span>
                    </div>
                </div>

                <div className="meal-week-navigation">
                    <button
                        type="button"
                        className="meal-week-arrow"
                        onClick={goToPreviousWeek}
                        aria-label="Previous week"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        className="meal-week-current"
                        onClick={goToCurrentWeek}
                    >
                        This Week
                    </button>

                    <button
                        type="button"
                        className="meal-week-arrow"
                        onClick={goToNextWeek}
                        aria-label="Next week"
                    >
                        →
                    </button>
                </div>

                <div className="meal-week-range">
                    <span>Week</span>

                    <strong>
                        {weekDates[0]?.monthName} {weekDates[0]?.dayNumber}
                        {" - "}
                        {weekDates[6]?.monthName} {weekDates[6]?.dayNumber}
                    </strong>
                </div>

                <div className="meal-days-list">
                    {weekDates.map((day) => {
                        const dayMeals = getDayMeals(day.key);

                        return (
                            <section
                                key={day.key}
                                className="meal-day-card"
                            >
                                <div className="meal-day-date">
                                    <div>
                                        <span>{day.shortDayName}</span>
                                        <strong>{day.dayNumber}</strong>
                                    </div>

                                    <p>{day.monthName}</p>
                                </div>

                                <div className="meal-day-content">
                                    <div className="meal-day-title-row">
                                        <div>
                                            <h3>{day.dayName}</h3>

                                            <p>
                                                {dayMeals.length} planned meals
                                            </p>
                                        </div>
                                    </div>

                                    <div className="meal-slots-grid">
                                        {MEAL_TYPES.map((mealType) => {
                                            const slotMeals = getMealsForSlot(
                                                day.key,
                                                mealType.value
                                            );

                                            return (
                                                <div
                                                    key={`${day.key}-${mealType.value}`}
                                                    className={`meal-slot meal-slot-${mealType.value}`}
                                                >
                                                    <div className="meal-slot-header">
                                                        <div className="meal-slot-title">
                                                            <span>
                                                                {mealType.icon}
                                                            </span>

                                                            <strong>
                                                                {mealType.label}
                                                            </strong>
                                                        </div>

                                                        <button
                                                            type="button"
                                                            className="meal-slot-add-button"
                                                            onClick={() =>
                                                                openCreateMealModal(
                                                                    day.key,
                                                                    mealType.value
                                                                )
                                                            }
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {slotMeals.length === 0 ? (
                                                        <button
                                                            type="button"
                                                            className="meal-slot-empty"
                                                            onClick={() =>
                                                                openCreateMealModal(
                                                                    day.key,
                                                                    mealType.value
                                                                )
                                                            }
                                                        >
                                                            Add recipe
                                                        </button>
                                                    ) : (
                                                        <div className="meal-items-list">
                                                            {slotMeals.map((meal) => (
                                                                <article
                                                                    key={meal.mealId}
                                                                    className="meal-item-card"
                                                                >
                                                                    <div className="meal-item-content">
                                                                        <p className="meal-item-type">
                                                                            Recipe
                                                                        </p>

                                                                        <h4>
                                                                            {getMealDisplayName(meal)}
                                                                        </h4>

                                                                        <span>
                                                                            {getMealSubText(meal)}
                                                                        </span>

                                                                        {meal.notes && (
                                                                            <p className="meal-item-notes">
                                                                                {meal.notes}
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    <div className="meal-item-footer">
                                                                        <span>
                                                                            {meal.calories || 0} cal
                                                                        </span>

                                                                        <div>
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openEditMealModal(meal)
                                                                                }
                                                                            >
                                                                                Edit
                                                                            </button>

                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    openDeleteMealModal(meal)
                                                                                }
                                                                            >
                                                                                Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </article>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </section>
                        );
                    })}
                </div>
            </section>

            {isMealModalOpen && (
                <div
                    className="meal-modal-overlay"
                    onClick={closeMealModal}
                >
                    <div
                        className="meal-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className="meal-modal-close"
                            onClick={closeMealModal}
                            aria-label="Close meal modal"
                        >
                            ×
                        </button>

                        <FormCard
                            label={editingMeal ? "Update meal" : "Add meal"}
                            title={editingMeal ? "Edit Recipe Meal" : "Add Recipe Meal"}
                            description="Choose a day, meal type and recipe."
                            className="meal-modal-card"
                            actions={
                                <>
                                    <AppButton
                                        type="submit"
                                        form="meal-plan-form"
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingMeal
                                                ? "Save Changes"
                                                : "Add Meal"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        variant="secondary"
                                        onClick={closeMealModal}
                                    >
                                        Cancel
                                    </AppButton>
                                </>
                            }
                        >
                            <form
                                id="meal-plan-form"
                                onSubmit={handleSubmitMeal}
                            >
                                <div className="meal-form-grid">
                                    <FormField
                                        label="Date"
                                        type="date"
                                        name="date"
                                        value={mealForm.date}
                                        onChange={handleFormChange}
                                    />

                                    <CustomSelect
                                        label="Meal Type"
                                        name="mealType"
                                        value={mealForm.mealType}
                                        onChange={handleFormChange}
                                        options={MEAL_TYPES}
                                    />

                                    <CustomSelect
                                        label="Recipe"
                                        name="itemId"
                                        value={mealForm.itemId}
                                        onChange={handleFormChange}
                                        options={recipeOptions}
                                        placeholder="Choose recipe"
                                        helperText={
                                            recipeOptions.length === 0
                                                ? "No recipes are available."
                                                : ""
                                        }
                                    />

                                    <FormField
                                        label="Calories"
                                        type="text"
                                        name="calories"
                                        inputMode="numeric"
                                        maxLength="5"
                                        value={mealForm.calories}
                                        onChange={handleFormChange}
                                        placeholder="Optional"
                                    />

                                    <FormField
                                        label="Notes"
                                        type="text"
                                        name="notes"
                                        value={mealForm.notes}
                                        onChange={handleFormChange}
                                        placeholder="Optional note"
                                    />
                                </div>
                            </form>
                        </FormCard>
                    </div>
                </div>
            )}

            {mealToDelete && (
                <div
                    className="meal-modal-overlay"
                    onClick={cancelDeleteMeal}
                >
                    <div
                        className="meal-confirm-modal"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <FormCard
                            label="Delete meal"
                            title="Remove this meal?"
                            description={`Remove ${formatMealType(mealToDelete.mealType)} from ${mealToDelete.date}?`}
                            className="meal-confirm-card"
                            actions={
                                <>
                                    <AppButton
                                        type="button"
                                        variant="danger"
                                        disabled={deleting}
                                        onClick={confirmDeleteMeal}
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Yes, delete"}
                                    </AppButton>

                                    <AppButton
                                        type="button"
                                        variant="secondary"
                                        onClick={cancelDeleteMeal}
                                    >
                                        Cancel
                                    </AppButton>
                                </>
                            }
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default MealPlanner;
