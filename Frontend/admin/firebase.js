<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBY0KLm2zl6vgCK0Uf8C9UlX8r5CSyiXNs",
  authDomain: "gyanodayaschool-c1024.firebaseapp.com",
  projectId: "gyanodayaschool-c1024",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
</script>
