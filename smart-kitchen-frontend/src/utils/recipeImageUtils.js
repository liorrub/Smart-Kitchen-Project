export const CATEGORY_DEFAULT_IMAGES = {
    breakfast: "https://www.seriouseats.com/thmb/AWEFCRl6AFT113pz5QOwZ0fIBLM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/food-lab-foolproof-eggs-benedict-recipe-hero-56a86e510be84599ab6179b0f8de40d7.jpg",

    lunch: "https://www.eatingwell.com/thmb/zSh86Cx-fybgBu5-baxombw1OiA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/diy-taco-lunch-box-54f8791776b64900b285fbfc22a4f0bc.jpg",

    dinner: "https://www.familyfoodonthetable.com/wp-content/uploads/2023/07/Spaghetti-dinner-square-1200.jpg",

    dessert: "https://www.allrecipes.com/thmb/A6lU6UYy1bftlUPnfgz-AJsqMs8=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/19894-moms-ice-cream-dessert-VAT-002-4x3-02-ac1bf7fc25b04808abece4885f56d08e.jpg",

    snack: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWQW0j1eWgqzBeX7fWBIvnVp2IlcRKLhMNEiD7IH52JLuTbtL7MLpZDg0&s=10"
};

export const GENERAL_DEFAULT_IMAGE =
    "https://media.istockphoto.com/id/1718782607/photo/top-view-background-of-cozy-dinner-table-set-for-thanksgiving.jpg?s=612x612&w=0&k=20&c=0wbr7QazSa_X2gpxlx2MNlRJ7Tj-My9bTiYy0V4rmds=";

export function getCategoryDefaultImage(category) {
    return CATEGORY_DEFAULT_IMAGES[String(category || "").toLowerCase()] || GENERAL_DEFAULT_IMAGE;
}

// Three-stage fallback: recipe imageUrl → category default → general default → stop.
// State is tracked via a data attribute so the function never retries a failed URL.
export function handleImageError(e, category) {
    const img = e.currentTarget;
    const state = img.getAttribute("data-fallback-state") || "recipe";

    if (state === "recipe") {
        img.setAttribute("data-fallback-state", "category");
        img.src = getCategoryDefaultImage(category);
    } else if (state === "category") {
        img.setAttribute("data-fallback-state", "general");
        img.src = GENERAL_DEFAULT_IMAGE;
    } else {
        img.onerror = null;
    }
}
