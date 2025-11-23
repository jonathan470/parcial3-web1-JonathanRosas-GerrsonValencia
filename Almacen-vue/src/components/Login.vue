<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["login"]);

const email = ref("admin@almacen.com");
const password = ref("admin123");
const error = ref("");
const cargando = ref(false);

const handleLogin = async () => {
  error.value = "";
  cargando.value = true;

  try {
    const response = await fetch("http://localhost:3000/api/usuarios/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });

    const data = await response.json();

    if (data.success) {
      emit("login", data.usuario);
    } else {
      error.value = "Credenciales inválidas";
    }
  } catch (err) {
    error.value = "Error al conectar con el servidor";
    console.error(err);
  } finally {
    cargando.value = false;
  }
};
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h1>🏪 Sistema de Almacén</h1>
        <p>Inicia sesión para continuar</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="tu@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="password"
            type="password"
            placeholder="••••••••"
            required
          />
        </div>

        <div v-if="error" class="error-message">
          {{ error }}
        </div>

        <button type="submit" class="btn-login" :disabled="cargando">
          {{ cargando ? "Ingresando..." : "Iniciar Sesión" }}
        </button>
      </form>

      <div class="login-info">
        <p><strong>Credenciales de prueba:</strong></p>
        <p>Email: admin@almacen.com</p>
        <p>Password: admin123</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
}

.login-box {
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  padding: 3rem;
  width: 100%;
  max-width: 450px;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: #667eea;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.error-message {
  background: #ffe0e0;
  color: #d63031;
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  text-align: center;
}

.btn-login {
  width: 100%;
  padding: 1rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-login:hover:not(:disabled) {
  background: #5568d3;
}

.btn-login:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-info {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e0e0e0;
  text-align: center;
  color: #666;
  font-size: 0.9rem;
}

.login-info p {
  margin: 0.25rem 0;
}
</style>
