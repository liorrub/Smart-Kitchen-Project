import "./Recipes.css";

import PageHero from "../components/PageHero";

function Recipes() {
    return (
        <div className="recipes-page">
            <PageHero
                label="Recipe Collection"
                title="Discover meals for every craving"
                description="This page will show recipes, filters, and cooking ideas after we decide how the recipe flow should work."
                stats={[
                    {
                        value: 0,
                        label: "Recipes Shown"
                    },
                    {
                        value: "Soon",
                        label: "In Progress"
                    }
                ]}
            />

        </div>
    );
}

export default Recipes;