import sql from "../configs/db.js";

// 1. Get Logged-In User's History (My Creations)
export const getUserCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`;
        
        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 2. Get Public Feed (Community Creations)
export const getPublishedCreations = async (req, res) => {
    try {
        // FIX: Removed "AND user_id = ${userId}"
        // We want to fetch ALL published posts from EVERYONE, not just the current user.
        const creations = await sql`SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC`;

        res.json({ success: true, creations });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// 3. Toggle Like
export const toggleLikeCreations = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { id } = req.body;

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;
        
        if (!creation) {
            return res.json({ success: false, message: "Creation not found." });
        }

        // FIX: Handle null likes to prevent server crash
        const currentLikes = creation.likes || [];
        const userIdStr = userId.toString();
        
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            // Unlike
            updatedLikes = currentLikes.filter(uid => uid !== userIdStr);
            message = "Creation unliked.";
        } else {
            // Like
            updatedLikes = [...currentLikes, userIdStr];
            message = "Creation liked.";
        }

        await sql`UPDATE creations SET likes = ${updatedLikes} WHERE id = ${id}`;

        // FIX: Return the *updated creation* specifically.
        // This is better than fetching the whole list because it works for both the "Profile" page AND the "Feed" page.
        const [updatedCreation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        res.json({ success: true, message, creation: updatedCreation });

    } catch (error) {
        console.error("Like Error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};