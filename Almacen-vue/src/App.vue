<script setup lang="ts">
import { ref, onMounted } from "vue";
import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Articulos from "./components/Articulos.vue";
import Ventas from "./components/Ventas.vue";

const usuario = ref<any>(null);
const vistaActual = ref("dashboard");

onMounted(() => {
  const usuarioGuardado = localStorage.getItem("usuario");
  if (usuarioGuardado) {
    usuario.value = JSON.parse(usuarioGuardado);
  }
});

const handleLogin = (user: any) => {
  usuario.value = user;
  localStorage.setItem("usuario", JSON.stringify(user));
};

const cambiarVista = (vista: string) => {
  vistaActual.value = vista;
};

const cerrarSesion = () => {
  usuario.value = null;
  localStorage.removeItem("usuario");
  vistaActual.value = "dashboard";
};
</script>

<template>
  <div id="app">
    <Login v-if="!usuario" @login="handleLogin" />

    <div v-else class="app-container">
      <header class="header">
        <div class="logo">
          <h1>🏪 Sistema de Almacén</h1>
        </div>
        <nav class="nav">
          <button
            @click="cambiarVista('dashboard')"
            :class="{ active: vistaActual === 'dashboard' }"
          >
            📊 Dashboard
          </button>
          <button
            @click="cambiarVista('articulos')"
            :class="{ active: vistaActual === 'articulos' }"
          >
            📦 Artículos
          </button>
          <button
            @click="cambiarVista('ventas')"
            :class="{ active: vistaActual === 'ventas' }"
          >
            💰 Ventas
          </button>
          <button @click="cerrarSesion" class="btn-logout">
            🚪 Cerrar Sesión
          </button>
        </nav>
        <div class="user-info">
          <span>👤 {{ usuario.nombre }}</span>
        </div>
      </header>

      <main class="main-content">
        <Dashboard v-if="vistaActual === 'dashboard'" />
        <Articulos v-else-if="vistaActual === 'articulos'" />
        <Ventas v-else-if="vistaActual === 'ventas'" />
      </main>

      <footer class="footer">
        <p>
          &copy; 2025 Sistema de Almacén - Gestión Integral de Inventario y
          Ventas
        </p>
        <p>Versión 1.0.0 | Desarrollado con Vue 3 + TypeScript</p>
      </footer>
    </div>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.logo h1 {
  margin: 0;
  color: #667eea;
  font-size: 1.5rem;
}

.nav {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.nav button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #f0f0f0;
  color: #333;
  cursor: pointer;
  border-radius: 5px;
  font-weight: 600;
  transition: all 0.3s;
  font-size: 0.9rem;
}

.nav button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.nav button.active {
  background: #667eea;
  color: white;
}

.btn-logout {
  background: #ff4757 !important;
  color: white !important;
}

.btn-logout:hover {
  background: #ee5a6f !important;
}

.user-info {
  font-weight: 600;
  color: #667eea;
  padding: 0.5rem 1rem;
  background: #f0f0f0;
  border-radius: 20px;
}

.main-content {
  flex: 1;
  padding: 2rem;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
}

.footer {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 1.5rem;
}

.footer p {
  margin: 0.25rem 0;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: stretch;
  }

  .logo h1 {
    text-align: center;
    font-size: 1.2rem;
  }

  .nav {
    flex-direction: column;
  }

  .nav button {
    width: 100%;
  }

  .user-info {
    text-align: center;
  }

  .main-content {
    padding: 1rem;
  }
}
</style>
