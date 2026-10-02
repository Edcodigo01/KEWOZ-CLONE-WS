const { Op } = require("sequelize");
const { Story } = require("../../../models");

const createStory = async (storyPayload) => {
    try {
        const newStory = await Story.create(storyPayload);
        return newStory;
    } catch (error) {
        console.error('Error in Creating Story.', error);
        throw error;
    }
}
const deleteStory = async (storyPayload) => {
    try {
        const story = await Story.destroy({ where: storyPayload });
        return story;
    } catch (error) {
        console.error('Error in Deleting Story.', error);
        throw error;
    }
}
const getStory = async (storyPayload, associations = []) => {
    try {
        const story = await Story.findOne({ where: storyPayload, include: associations });
        return story;
    } catch (error) {
        console.error('Error in Creating Story.', error);
        throw error;
    }
}

const updateStory = async (data, where) => {
    try {
        const story = await Story.update(data, { where: where, returning: true });
        return story[1][0];
    } catch (error) {
        console.error('Error in Creating Story.', error);
        throw error;
    }
}

const getUserStories = async (storyPayload, associations = []) => {
    try {
        const story = await Story.findAll({ where: storyPayload, include: associations, order: [['createdAt', 'DESC']] });
        return story;
    } catch (error) {
        console.error('Error in Creating Story.', error);
        throw error;
    }
}

const getLast7DaysStoryViews = async (user_id) => {
    try {
        if (!user_id) throw new Error("user_id is required");

        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 6); // last 7 days including today

        // 1. Get stories created in last 7 days
        const stories = await Story.findAll({
            where: {
                user_id,
                createdAt: { [Op.between]: [sevenDaysAgo, today] },
            },
        });

        // 2. Sum views length of each story
        const totalViews = stories.reduce((sum, story) => {
            const viewsArray = Array.isArray(story.views) ? story.views : [];
            return sum + viewsArray.length;
        }, 0);

        return { totalViews, stories };
    } catch (error) {
        console.error("Error in getLast7DaysStoryViews:", error);
        throw error;
    }
};


module.exports = {
    createStory,
    getStory,
    deleteStory,
    updateStory,
    getUserStories,
    getLast7DaysStoryViews
}