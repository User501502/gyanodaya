import admin from "firebase-admin";

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN))
});

export async function verify(req) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw "Unauthorized";
  return await admin.auth().verifyIdToken(token);
}
