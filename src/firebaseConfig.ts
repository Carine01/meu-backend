// src/firebaseConfig.ts

// Importe a função necessária para inicializar o Firebase
// Certifique-se de que "firebase/app" está correto com base na sua instalação
import { initializeApp } from "firebase/app";

// Sua Configuração do Firebase para o aplicativo "Elevare Atendimento"
const firebaseConfig = {
  apiKey: "AIzaSyA_4outYN1Bp-NiwMS-lYjEzbaZbx7HDSE",
  authDomain: "flutter-ai-playground-61f8b.firebaseapp.com",
  projectId: "flutter-ai-playground-61f8b",
  storageBucket: "flutter-ai-playground-61f8b.firebasestorage.app",
  messagingSenderId: "848117836010",
  appId: "1:848117836010:web:2274290a6676a6de814f93"
};

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// É uma boa prática exportar a instância 'app' para que outros módulos
// do seu aplicativo possam usá-la facilmente.
export { app };

