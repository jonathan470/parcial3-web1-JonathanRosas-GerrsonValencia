<script setup lang="ts">
import { ref, onMounted } from "vue";

interface Articulo {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stock: number;
}

const articulos = ref<Articulo[]>([]);
const mostrarFormulario = ref(false);
const modoEdicion = ref(false);
const articuloEditando = ref<number | null>(null);

const formulario = ref({
  nombre: "",
  descripcion: "",
  precio: 0,
  stock: 0,
});

const cargarArticulos = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/articulos");
    articulos.value = await response.json();
  } catch (error) {
    console.error("Error al cargar artículos:", error);
  }
};

const abrirFormulario = () => {
  mostrarFormulario.value = true;
  modoEdicion.value = false;
  formulario.value = {
    nombre: "",
    descripcion: "",
    precio: 0,
    stock: 0,
  };
};

const editarArticulo = (articulo: Articulo) => {
  mostrarFormulario.value = true;
  modoEdicion.value = true;
  articuloEditando.value = articulo.id;
  formulario.value = {
    nombre: articulo.nombre,
    descripcion: articulo.descripcion,
    precio: articulo.precio,
    stock: articulo.stock,
  };
};

const guardarArticulo = async () => {
  try {
    const url = modoEdicion.value
      ? `http://localhost:3000/api/articulos/${articuloEditando.value}`
      : "http://localhost:3000/api/articulos";

    const method = modoEdicion.value ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formulario.value),
    });

    if (response.ok) {
      await cargarArticulos();
      cerrarFormulario();
    }
  } catch (error) {
    console.error("Error al guardar artículo:", error);
  }
};

const eliminarArticulo = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar este artículo?")) return;

  try {
    const response = await fetch(`http://localhost:3000/api/articulos/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await cargarArticulos();
    }
  } catch (error) {
    console.error("Error al eliminar artículo:", error);
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
  modoEdicion.value = false;
  articuloEditando.value = null;
};

onMounted(() => {
  cargarArticulos();
});
</script>

<template>
  <div class="articulos">
    <div class="header-section">
      <div>
        <h2>📦 Artículos</h2>
        <p class="subtitle">Gestiona tu inventario de productos</p>
      </div>
      <button @click="abrirFormulario" class="btn-agregar">
        ➕ Agregar Artículo
      </button>
    </div>

    <!-- Formulario Modal -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ modoEdicion ? "✏️ Editar" : "➕ Nuevo" }} Artículo</h3>
          <button @click="cerrarFormulario" class="btn-cerrar">✕</button>
        </div>

        <form @submit.prevent="guardarArticulo">
          <div class="form-group">
            <label>Nombre</label>
            <input v-model="formulario.nombre" type="text" required />
          </div>

          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formulario.descripcion" required></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio ($)</label>
              <input
                v-model.number="formulario.precio"
                type="number"
                step="0.01"
                required
              />
            </div>

            <div class="form-group">
              <label>Stock</label>
              <input v-model.number="formulario.stock" type="number" required />
            </div>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="cerrarFormulario"
              class="btn-cancelar"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-guardar">
              {{ modoEdicion ? "Actualizar" : "Agregar" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lista de Artículos -->
    <div v-if="articulos.length === 0" class="empty-state">
      <p>📭 No hay artículos registrados</p>
      <p>Comienza agregando tu primer artículo</p>
    </div>

    <div v-else class="articulos-grid">
      <div
        v-for="articulo in articulos"
        :key="articulo.id"
        class="articulo-card"
      >
        <div class="articulo-header">
          <h3>{{ articulo.nombre }}</h3>
          <span
            class="stock-badge"
            :class="{
              agotado: articulo.stock === 0,
              bajo: articulo.stock > 0 && articulo.stock < 10,
            }"
          >
            {{ articulo.stock }} en stock
          </span>
        </div>

        <p class="descripcion">{{ articulo.descripcion }}</p>

        <div class="articulo-footer">
          <span class="precio">${{ articulo.precio.toFixed(2) }}</span>
          <div class="acciones">
            <button @click="editarArticulo(articulo)" class="btn-editar">
              ✏️ Editar
            </button>
            <button @click="eliminarArticulo(articulo.id)" class="btn-eliminar">
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.articulos {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.subtitle {
  color: #666;
  margin: 0;
}

.btn-agregar {
  padding: 0.75rem 1.5rem;
  background: #00b894;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-agregar:hover {
  background: #00a085;
}

/* Modal */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-cerrar {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancelar,
.btn-guardar {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar {
  background: #e0e0e0;
  color: #333;
}

.btn-guardar {
  background: #667eea;
  color: white;
}

/* Lista de Artículos */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.articulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.articulo-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.articulo-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.articulo-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.articulo-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2rem;
}

.stock-badge {
  padding: 0.25rem 0.75rem;
  background: #00b894;
  color: white;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
}

.stock-badge.bajo {
  background: #fdcb6e;
}

.stock-badge.agotado {
  background: #d63031;
}

.descripcion {
  color: #666;
  margin-bottom: 1rem;
  line-height: 1.5;
}

.articulo-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.precio {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}

.acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-editar,
.btn-eliminar {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-editar {
  background: #74b9ff;
  color: white;
}

.btn-editar:hover {
  background: #0984e3;
}

.btn-eliminar {
  background: #ff7675;
  color: white;
}

.btn-eliminar:hover {
  background: #d63031;
}
</style>
