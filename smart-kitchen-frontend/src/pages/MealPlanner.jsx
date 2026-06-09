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
        label: "Breakfast"
    },
    {
        value: "lunch",
        label: "Lunch"
    },
    {
        value: "dinner",
        label: "Dinner"
    },
    {
        value: "snack",
        label: "Snack"
    }
];

const MEAL_TYPE_ORDER = {
    breakfast: 1,
    lunch: 2,
    dinner: 3,
    snack: 4
};

const EMPTY_MEAL_FORM = {
    date: "",
    mealType: "breakfast",
    itemId: "",
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

    currentDate.setDate(currentDate.getDate() - day);
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
                weekday: "short"
            }),
            fullDayName: date.toLocaleDateString("en-US", {
                weekday: "long"
            }),
            dayNumber: date.getDate(),
            monthName: date.toLocaleDateString("en-US", {
                month: "short"
            })
        };
    });
}

function formatWeekRange(weekDays) {
    const start = weekDays[0];
    const end = weekDays[weekDays.length - 1];

    if (!start || !end) {
        return "";
    }

    const startYear = start.date.getFullYear();
    const endYear = end.date.getFullYear();

    if (startYear === endYear && start.monthName === end.monthName) {
        return `${start.monthName} ${start.dayNumber}–${end.dayNumber}, ${startYear}`;
    }

    if (startYear === endYear) {
        return `${start.monthName} ${start.dayNumber} – ${end.monthName} ${end.dayNumber}, ${startYear}`;
    }

    return `${start.monthName} ${start.dayNumber}, ${startYear} – ${end.monthName} ${end.dayNumber}, ${endYear}`;
}

function formatCompactDate(day) {
    if (!day) {
        return "";
    }

    return `${day.dayName}, ${day.monthName} ${day.dayNumber}`;
}

function isSameWeek(firstDate, secondDate) {
    return (
        formatDateKey(getStartOfWeek(firstDate)) ===
        formatDateKey(getStartOfWeek(secondDate))
    );
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

    const weekRangeLabel = useMemo(() => {
        return formatWeekRange(weekDates);
    }, [weekDates]);

    const weekStartLabel = useMemo(() => {
        return formatCompactDate(weekDates[0]);
    }, [weekDates]);

    const weekEndLabel = useMemo(() => {
        return formatCompactDate(weekDates[6]);
    }, [weekDates]);

    const isViewingCurrentWeek = useMemo(() => {
        return isSameWeek(weekStartDate, new Date());
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
            label: `${recipe.title} · ${recipe.calories || 0} cal`
        }));
    }, [recipes]);

    const weeklyMeals = useMemo(() => {
        return mealPlan
            .filter((meal) => weekDateKeys.has(meal.date))
            .sort((firstMeal, secondMeal) => {
                if (firstMeal.date !== secondMeal.date) {
                    return firstMeal.date.localeCompare(secondMeal.date);
                }

                return (
                    (MEAL_TYPE_ORDER[firstMeal.mealType] || 99) -
                    (MEAL_TYPE_ORDER[secondMeal.mealType] || 99)
                );
            });
    }, [mealPlan, weekDateKeys]);

    const plannedDaysCount = useMemo(() => {
        return new Set(weeklyMeals.map((meal) => meal.date)).size;
    }, [weeklyMeals]);

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

    function openCreateMealModal(date, mealType = "breakfast") {
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
            [name]: value
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
        const selectedRecipe = recipeMap.get(Number(mealForm.itemId));

        return {
            date: mealForm.date,
            mealType: mealForm.mealType,
            itemType: "recipe",
            itemId: Number(mealForm.itemId),
            calories: Number(selectedRecipe?.calories || 0),
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

    function getRecipeForMeal(meal) {
        return recipeMap.get(Number(meal.itemId));
    }

    function getMealsForDayAndType(date, mealType) {
        return mealPlan
            .filter(
                (meal) =>
                    meal.date === date &&
                    meal.mealType === mealType
            )
            .sort(
                (firstMeal, secondMeal) =>
                    Number(firstMeal.mealId || 0) -
                    Number(secondMeal.mealId || 0)
            );
    }

    function getDayCalories(date) {
        return mealPlan
            .filter((meal) => meal.date === date)
            .reduce((sum, meal) => {
                const recipe = getRecipeForMeal(meal);

                return sum + Number(recipe?.calories || meal.calories || 0);
            }, 0);
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
                title="Plan your weekly meals"
                description="Build a simple weekly meal plan from your saved recipes."
                stats={[
                    {
                        value: weeklyMeals.length,
                        label: "Planned meals"
                    },
                    {
                        value: plannedDaysCount,
                        label: "Planned days"
                    }
                ]}
            />

            <section className="meal-week-toolbar">
                <div className="meal-week-info">
                    <div className="meal-week-kicker">
                        <span>Weekly Calendar</span>

                        {isViewingCurrentWeek && (
                            <strong>This week</strong>
                        )}
                    </div>

                    <h2>{weekRangeLabel}</h2>

                </div>

                <div
                    className="meal-week-controls"
                    aria-label="Week navigation"
                >
                    <button
                        type="button"
                        className="meal-week-arrow"
                        onClick={goToPreviousWeek}
                        aria-label="Previous week"
                    >
                        <span>‹</span>
                        Prev
                    </button>

                    <button
                        type="button"
                        className={`meal-this-week-button ${isViewingCurrentWeek ? "is-current-week" : ""}`}
                        onClick={goToCurrentWeek}
                    >
                        This week
                    </button>

                    <button
                        type="button"
                        className="meal-week-arrow"
                        onClick={goToNextWeek}
                        aria-label="Next week"
                    >
                        Next
                        <span>›</span>
                    </button>
                </div>
            </section>

            <section className="meal-calendar-card">
                <div className="meal-calendar-wrapper">
                    <table className="meal-calendar-table">
                        <thead>
                        <tr>
                            <th className="meal-type-column">
                                Meal
                            </th>

                            {weekDates.map((day) => (
                                <th key={day.key}>
                                    <div className="meal-calendar-day-heading">
                                        <span>{day.dayName}</span>

                                        <strong>{day.dayNumber}</strong>

                                        <p>
                                            {getDayCalories(day.key)} daily calories
                                        </p>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                openCreateMealModal(day.key)
                                            }
                                            aria-label={`Add meal to ${day.fullDayName}`}
                                        >
                                            +
                                        </button>
                                    </div>
                                </th>
                            ))}
                        </tr>
                        </thead>

                        <tbody>
                        {MEAL_TYPES.map((mealType) => (
                            <tr key={mealType.value}>
                                <td className="meal-type-cell">
                                    <span>{mealType.label}</span>
                                </td>

                                {weekDates.map((day) => {
                                    const meals = getMealsForDayAndType(
                                        day.key,
                                        mealType.value
                                    );

                                    return (
                                        <td
                                            key={`${day.key}-${mealType.value}`}
                                            className="meal-calendar-cell"
                                        >
                                            {meals.length === 0 ? (
                                                <button
                                                    type="button"
                                                    className="meal-cell-add-button"
                                                    onClick={() =>
                                                        openCreateMealModal(
                                                            day.key,
                                                            mealType.value
                                                        )
                                                    }
                                                >
                                                    Add
                                                </button>
                                            ) : (
                                                <div className="meal-cell-items">
                                                    {meals.map((meal) => {
                                                        const recipe =
                                                            getRecipeForMeal(meal);

                                                        return (
                                                            <div
                                                                key={meal.mealId}
                                                                className={`meal-chip meal-chip-${meal.mealType}`}
                                                            >
                                                                <div>
                                                                    <strong>
                                                                        {recipe?.title || `Recipe #${meal.itemId}`}
                                                                    </strong>

                                                                    <p>
                                                                        {recipe?.calories || meal.calories || 0} cal
                                                                        {meal.notes ? ` · ${meal.notes}` : ""}
                                                                    </p>
                                                                </div>

                                                                <div className="meal-chip-actions">
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
                                                                        ×
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                        </tbody>
                    </table>
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
                            description="Choose a date, meal type and recipe. Calories are taken from the selected recipe."
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
