import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(
      JSON.parse(process.env.FIREBASE_ADMIN)
    )
  });
}

export async function verifyToken(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("Unauthorized");
  return await admin.auth().verifyIdToken(token);
}
