import admin from "../config/firebase.js";
import User from "../models/User.js";

export const verifyFirebaseToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res
        .status(401)
        .json({
            message: "Unauthorized: Missing or invalid Authorization header",
        });
    }

    const idToken = authHeader.split("Bearer ")[1];

    try {
        // 1. Validate the cryptographic signature with Firebase
        const decodedToken = await admin.auth().verifyIdToken(idToken);

        // 2. Fetch or sync the user in MongoDB
        //    Upsert ensures the user document exists on first login
        let user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
        user = await User.create({
            firebaseUid: decodedToken.uid,
            email: decodedToken.email || null,
            phoneNumber: decodedToken.phone_number || null,
            authProvider: decodedToken.firebase.sign_in_provider,
            displayName: decodedToken.name || "",
            photoURL: decodedToken.picture || "",
        });
        }

        // 3. Attach identity info to Express Request context
        req.user = user;
        req.firebaseUser = decodedToken;
        next();
    } catch (error) {
        console.error("Token verification error:", error.code, error.message);
        return res
        .status(401)
        .json({ message: "Unauthorized: Invalid or expired token" });
    }
};
