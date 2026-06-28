import "./MealPlanner.css";

import { useEffect, useMemo, useState } from "react";

import PageErrorState from "../components/PageErrorState";
import AppButton from "../components/AppButton";
import ConfirmDeleteModal from "../components/ConfirmDeleteModal";
import CustomSelect from "../components/CustomSelect";
import FormCard from "../components/FormCard";
import FormField from "../components/FormField";
import MessageModal from "../components/MessageModal";
import PageHero from "../components/PageHero";

import { getIngredients } from "../services/ingredientsService";
import {
    createMealPlanItem,
    deleteMealPlanItem,
    getRecipes,
    getUserMealPlan,
    getUserPantry,
    updateMealPlanItem
} from "../services/mealPlanService";
import { getErrorMessage } from "../utils/apiUtils";
import { getStoredUser } from "../utils/authUtils";
import { toLocalDateKey } from "../utils/dateUtils";

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

const ITEM_TYPE_OPTIONS = [
    { value: "recipe", label: "Recipe" },
    { value: "ingredient", label: "Pantry Item" }
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
    itemType: "recipe",
    itemId: "",
    notes: ""
};

// Return the Sunday that starts the week containing the given date.
function getStartOfWeek(date) {
    const currentDate = new Date(date);
    const day = currentDate.getDay();

    currentDate.setDate(currentDate.getDate() - day);
    currentDate.setHours(0, 0, 0, 0);

    return currentDate;
}

// Build an array of 7 day descriptor objects starting from the given Sunday.
function getWeekDates(startDate) {
    return Array.from({ length: 7 }, (_, index) => {
        const date = new Date(startDate);

        date.setDate(startDate.getDate() + index);

        return {
            date,
            key: toLocalDateKey(date),
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

// Format the week range label for the calendar header (e.g. "Jun 1–7, 2025").
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

// Check whether two dates fall within the same Sunday-to-Saturday week.
function isSameWeek(firstDate, secondDate) {
    return (
        toLocalDateKey(getStartOfWeek(firstDate)) ===
        toLocalDateKey(getStartOfWeek(secondDate))
    );
}

// Look up the display label for a meal type value (e.g. "breakfast" → "Breakfast").
function formatMealType(mealType) {
    const meal = MEAL_TYPES.find(
        (currentMeal) => currentMeal.value === mealType
    );

    return meal?.label || mealType;
}

function MealPlanner() {
    const [weekStartDate, setWeekStartDate] = useState(
        getStartOfWeek(new Date())
    );

    const [mealPlan, setMealPlan] = useState([]);
    const [recipes, setRecipes] = useState([]);
    const [pantryItems, setPantryItems] = useState([]);
    const [ingredientMap, setIngredientMap] = useState(new Map());

    const [mealForm, setMealForm] = useState(EMPTY_MEAL_FORM);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealToDelete, setMealToDelete] = useState(null);
    const [isMealModalOpen, setIsMealModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState("");
    const [loadError, setLoadError] = useState("");
    const [success, setSuccess] = useState("");

    const storedUser = getStoredUser();

    const weekDates = useMemo(() => {
        return getWeekDates(weekStartDate);
    }, [weekStartDate]);

    const weekRangeLabel = useMemo(() => {
        return formatWeekRange(weekDates);
    }, [weekDates]);

    const isViewingCurrentWeek = useMemo(() => {
        return isSameWeek(weekStartDate, new Date());
    }, [weekStartDate]);

    // Build a Set of YYYY-MM-DD keys for the current week — used for fast membership checks when filtering meals.
    const weekDateKeys = useMemo(() => {
        return new Set(weekDates.map((day) => day.key));
    }, [weekDates]);

    // Index recipes by recipeId for O(1) lookups when resolving meal entries to recipe details.
    const recipeMap = useMemo(() => {
        return new Map(
            recipes.map((recipe) => [
                recipe.recipeId,
                recipe
            ])
        );
    }, [recipes]);

    // Build recipe dropdown options including calorie info for the meal form.
    const recipeOptions = useMemo(() => {
        return recipes.map((recipe) => ({
            value: recipe.recipeId,
            label: `${recipe.title} · ${recipe.calories || 0} cal`
        }));
    }, [recipes]);

    // Build pantry dropdown options — one entry per unique ingredient in the user's pantry
    const pantryOptions = useMemo(() => {
        const seen = new Set();
        const options = [];

        pantryItems.forEach((item) => {
            if (!seen.has(item.ingredientId)) {
                seen.add(item.ingredientId);

                const ingredient = ingredientMap.get(item.ingredientId);
                const name = ingredient?.name || `Ingredient #${item.ingredientId}`;

                options.push({
                    value: item.ingredientId,
                    label: `${name} (${item.quantity} ${item.unit})`
                });
            }
        });

        return options;
    }, [pantryItems, ingredientMap]);

    // Filter and sort the meal plan entries that belong to the current week view.
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

    // Count the number of distinct days in the current week that have at least one meal planned.
    const plannedDaysCount = useMemo(() => {
        return new Set(weeklyMeals.map((meal) => meal.date)).size;
    }, [weeklyMeals]);

    // Prevent page scrolling while any meal modal is open.
    useEffect(() => {
        const isOpen = isMealModalOpen || !!mealToDelete;
        if (!isOpen) return;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [isMealModalOpen, mealToDelete]);

    // Load meal plan, recipes, pantry items, and ingredients in parallel on page open.
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
                    recipesData,
                    pantryData,
                    ingredientsData
                ] = await Promise.all([
                    getUserMealPlan(storedUser.userId),
                    getRecipes(),
                    getUserPantry(storedUser.userId),
                    getIngredients()
                ]);

                setMealPlan(Array.isArray(mealPlanData) ? mealPlanData : []);
                setRecipes(Array.isArray(recipesData) ? recipesData : []);
                setPantryItems(Array.isArray(pantryData) ? pantryData : []);
                setIngredientMap(
                    new Map(
                        (Array.isArray(ingredientsData) ? ingredientsData : []).map(
                            (ingredient) => [ingredient.ingredientId, ingredient]
                        )
                    )
                );
            } catch (err) {
                console.error("Meal planner loading error:", err);

                setLoadError(
                    !err.response
                        ? "Unable to connect to the server. Please try again in a few moments."
                        : getErrorMessage(err, "Failed to load meal planner.")
                );
            } finally {
                setLoading(false);
            }
        }

        loadMealPlannerData();
    }, [storedUser?.userId]);

    // Open the add-meal modal pre-filled with the clicked date and meal type.
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

    // Open the edit-meal modal pre-filled with the selected meal's current values.
    function openEditMealModal(meal) {
        setError("");
        setSuccess("");
        setMealToDelete(null);
        setEditingMeal(meal);

        setMealForm({
            date: meal.date || "",
            mealType: meal.mealType || "breakfast",
            itemType: meal.itemType || "recipe",
            itemId: meal.itemId || "",
            notes: meal.notes || ""
        });

        setIsMealModalOpen(true);
    }

    // Close the meal form modal and reset all form state.
    function closeMealModal() {
        setIsMealModalOpen(false);
        setEditingMeal(null);
        setMealForm(EMPTY_MEAL_FORM);
        setError("");
    }

    // Reset itemId when the item type changes so the previous selection is cleared
    function handleFormChange(event) {
        const { name, value } = event.target;

        setMealForm((previousForm) => ({
            ...previousForm,
            [name]: value,
            ...(name === "itemType" ? { itemId: "" } : {})
        }));
    }

    // Check that all required meal fields are filled before submitting. Returns an error string or null.
    function validateMealForm() {
        if (!mealForm.date) {
            return "Date is required.";
        }

        if (!mealForm.mealType) {
            return "Meal type is required.";
        }

        if (!mealForm.itemId) {
            return "Please choose an item.";
        }

        return null;
    }

    // Build the API request body from the current form state, resolving calories from the recipe map.
    function buildMealPayload() {
        const calories = mealForm.itemType === "recipe"
            ? Number(recipeMap.get(Number(mealForm.itemId))?.calories || 0)
            : 0;

        return {
            date: mealForm.date,
            mealType: mealForm.mealType,
            itemType: mealForm.itemType,
            itemId: Number(mealForm.itemId),
            calories,
            notes: mealForm.notes.trim()
        };
    }

    // Create or update a meal plan entry and update the local list with the server response.
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

    // Open the delete confirmation modal for the selected meal.
    function openDeleteMealModal(meal) {
        setError("");
        setSuccess("");
        setIsMealModalOpen(false);
        setEditingMeal(null);
        setMealToDelete(meal);
    }

    // Delete the selected meal and remove it from the local list on success.
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

    // Navigate the calendar one week backward.
    function goToPreviousWeek() {
        setWeekStartDate((previousDate) => {
            const newDate = new Date(previousDate);

            newDate.setDate(newDate.getDate() - 7);

            return getStartOfWeek(newDate);
        });
    }

    // Navigate the calendar one week forward.
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

    // Return the display name for a meal chip based on its item type.
    // For recipes: prefer the approved recipe from the local map, then the title
    // embedded in the meal plan row (covers non-approved / orphaned references),
    // then a safe unavailable label — never a fabricated "Recipe #id" string.
    function getItemLabel(meal) {
        if (meal.itemType === "ingredient") {
            const ingredient = ingredientMap.get(Number(meal.itemId));
            return ingredient?.name || `Ingredient #${meal.itemId}`;
        }

        const recipe = recipeMap.get(Number(meal.itemId));
        return recipe?.title || meal.recipeTitle || "Recipe unavailable";
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

    if (loadError) {
        return (
            <div className="meal-planner-page">
                <PageErrorState
                    title="Meal Planner Error"
                    message={loadError}
                    onRetry={() => window.location.reload()}
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
                description="Build a simple weekly meal plan from your saved recipes and pantry items."
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
                                                    {meals.map((meal) => (
                                                        <div
                                                            key={meal.mealId}
                                                            className={`meal-chip meal-chip-${meal.mealType}`}
                                                        >
                                                            <div>
                                                                <strong>
                                                                    {getItemLabel(meal)}
                                                                </strong>

                                                                <p>
                                                                    {getRecipeForMeal(meal)?.calories || meal.calories || 0} cal
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
                                                    ))}
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

                        <div className="meal-modal-body">
                        <FormCard
                            label={editingMeal ? "Update meal" : "Add meal"}
                            title={editingMeal ? "Edit Meal" : "Add Meal"}
                            description="Choose a date, meal type, and item. For recipes, calories are added automatically."
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
                                        label="Item Type"
                                        name="itemType"
                                        value={mealForm.itemType}
                                        onChange={handleFormChange}
                                        options={ITEM_TYPE_OPTIONS}
                                    />

                                    {mealForm.itemType === "recipe" ? (
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
                                    ) : (
                                        <CustomSelect
                                            label="Pantry Item"
                                            name="itemId"
                                            value={mealForm.itemId}
                                            onChange={handleFormChange}
                                            options={pantryOptions}
                                            placeholder="Choose pantry item"
                                            helperText={
                                                pantryOptions.length === 0
                                                    ? "Your pantry is empty."
                                                    : ""
                                            }
                                        />
                                    )}

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
                </div>
            )}

            {mealToDelete && (
                <ConfirmDeleteModal
                    label="Delete meal"
                    description={`Remove ${formatMealType(mealToDelete.mealType)} from ${mealToDelete.date}?`}
                    isDeleting={deleting}
                    onConfirm={confirmDeleteMeal}
                    onCancel={cancelDeleteMeal}
                />
            )}
        </div>
    );
}

export default MealPlanner;
