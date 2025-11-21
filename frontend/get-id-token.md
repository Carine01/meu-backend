# Como obter o ID Token (idToken) no Frontend

Exemplo rápido usando Firebase Web SDK (modular v9+). Substitua os valores do `firebaseConfig` pelos do seu projeto.

```javascript
// firebase-client.js
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "SUA_API_KEY",
  authDomain: "SEU_AUTH_DOMAIN",
  projectId: "SEU_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function loginAndGetToken(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const idToken = await user.getIdToken();
  return idToken; // envie este token ao backend no header Authorization
}

// Exemplo de uso
// loginAndGetToken('user@example.com', 'senha123').then(token => console.log(token));
```

Curl de exemplo para chamar o backend (substitua `<ID_TOKEN>`):

```bash
curl -H "Authorization: Bearer <ID_TOKEN>" http://localhost:3000/auth-test
```

Alternativa (Token via REST API - útil para scripts):

```bash
# Trocar API_KEY, email e senha abaixo
curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"senha123","returnSecureToken":true}'

# A resposta terá um campo idToken que pode ser usado no Authorization header.
```
