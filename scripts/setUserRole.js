// server/scripts/setUserRole.js
const admin = require("../config/firebaseAdmin");

async function setRole(uid, role) {
  await admin.auth().setCustomUserClaims(uid, { role });
  console.log(`✅ Role '${role}' set for UID: ${uid}`);
}

// example
setRole("iVRgUvFvVzUujn50Vxw0jsOhTzy2", "admin");
