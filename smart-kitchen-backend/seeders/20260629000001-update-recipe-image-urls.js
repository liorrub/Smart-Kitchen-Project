'use strict';

// Image URLs are maintained in data/recipe-image-urls.json.
// To change a recipe image, edit that file and re-run this seeder.
const imageMap = require('../data/recipe-image-urls.json');

module.exports = {
    async up(queryInterface) {
        for (const [title, { imageUrl, imagePositionX, imagePositionY }] of Object.entries(imageMap)) {
            await queryInterface.sequelize.query(
                'UPDATE Recipes SET imageUrl = ?, imagePositionX = ?, imagePositionY = ? WHERE title = ?',
                { replacements: [imageUrl, imagePositionX ?? 50, imagePositionY ?? 50, title] }
            );
        }
    },

    async down(queryInterface) {
        const titles = Object.keys(imageMap);
        await queryInterface.sequelize.query(
            `UPDATE Recipes SET imageUrl = NULL, imagePositionX = 50, imagePositionY = 50 WHERE title IN (${titles.map(() => '?').join(', ')})`,
            { replacements: titles }
        );
    },
};
