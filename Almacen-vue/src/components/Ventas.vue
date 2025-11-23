<script setup lang="ts">
import { ref, computed, onMounted } from "vue";

interface Articulo {
  id: number;
  nombre: string;
  precio: number;
  stock: number;
}

interface ArticuloVenta {
  articuloId: number;
  cantidad: number;
}

interface Venta {
  id: number;
  fecha: string;
  articulos: any[];
  total: number;
  metodoPago: string;
}

const ventas = ref<Venta[]>([]);
const articulosDisponibles = ref<Articulo[]>([]);
const mostrarFormulario = ref(false);
const articulosSeleccionados = ref<ArticuloVenta[]>([]);
const metodoPago = ref("efectivo");

const total = computed(() => {
  return articulosSeleccionados.value.reduce((sum, item) => {
    const articulo = articulosDisponibles.value.find(
      (a) => a.id === item.articuloId
    );
    return sum + (articulo ? articulo.precio * item.cantidad : 0);
  }, 0);
});

const cargarVentas = async () => {
  try {
    const response = await fetch("http://localhost:3000/api/ventas");
    ventas.value = await response.json();
  } catch (error) {
    console.error("Error al cargar ventas:", error);
  }
};

const cargarArticulosDisponibles = async () => {
  try {
    const response = await fetch(
      "http://localhost:3000/api/articulos/disponibles"
    );
    articulosDisponibles.value = await response.json();
  } catch (error) {
    console.error("Error al cargar artículos:", error);
  }
};

const abrirFormulario = () => {
  mostrarFormulario.value = true;
  articulosSeleccionados.value = [];
  metodoPago.value = "efectivo";
  cargarArticulosDisponibles();
};

const agregarArticulo = () => {
  if (articulosDisponibles.value.length > 0) {
    const primerArticulo = articulosDisponibles.value[0];
    if (primerArticulo && primerArticulo.id) {
      articulosSeleccionados.value.push({
        articuloId: primerArticulo.id,
        cantidad: 1,
      });
    }
  } else {
    alert("No hay artículos disponibles para agregar");
  }
};

const eliminarArticulo = (index: number) => {
  articulosSeleccionados.value.splice(index, 1);
};

const obtenerArticulo = (id: number) => {
  return articulosDisponibles.value.find((a) => a.id === id);
};

const guardarVenta = async () => {
  if (articulosSeleccionados.value.length === 0) {
    alert("Debes agregar al menos un artículo");
    return;
  }

  try {
    const response = await fetch("http://localhost:3000/api/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        articulos: articulosSeleccionados.value,
        metodoPago: metodoPago.value,
      }),
    });

    if (response.ok) {
      await cargarVentas();
      cerrarFormulario();
      alert("Venta registrada exitosamente");
    } else {
      const error = await response.json();
      alert(error.message || "Error al registrar la venta");
    }
  } catch (error) {
    console.error("Error al guardar venta:", error);
    alert("Error al registrar la venta");
  }
};

const cerrarFormulario = () => {
  mostrarFormulario.value = false;
};

const formatearFecha = (fecha: string) => {
  return new Date(fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const eliminarVenta = async (id: number) => {
  if (!confirm("¿Estás seguro de eliminar esta venta?")) return;

  try {
    const response = await fetch(`http://localhost:3000/api/ventas/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      await cargarVentas();
    }
  } catch (error) {
    console.error("Error al eliminar venta:", error);
  }
};

onMounted(() => {
  cargarVentas();
});
</script>

<template>
  <div class="ventas">
    <div class="header-section">
      <div>
        <h2>💰 Ventas</h2>
        <p class="subtitle">Registro de transacciones</p>
      </div>
      <button @click="abrirFormulario" class="btn-nueva-venta">
        ➕ Nueva Venta
      </button>
    </div>

    <!-- Formulario Modal -->
    <div v-if="mostrarFormulario" class="modal">
      <div class="modal-content modal-large">
        <div class="modal-header">
          <h3>🛒 Nueva Venta</h3>
          <button @click="cerrarFormulario" class="btn-cerrar">✕</button>
        </div>

        <form @submit.prevent="guardarVenta">
          <div class="articulos-venta">
            <div class="articulos-header">
              <h4>Artículos</h4>
              <button
                type="button"
                @click="agregarArticulo"
                class="btn-agregar-articulo"
              >
                ➕ Agregar Artículo
              </button>
            </div>

            <div v-if="articulosSeleccionados.length === 0" class="empty-cart">
              No hay artículos en la venta
            </div>

            <div
              v-for="(item, index) in articulosSeleccionados"
              :key="index"
              class="articulo-item"
            >
              <select v-model="item.articuloId" class="select-articulo">
                <option
                  v-for="articulo in articulosDisponibles"
                  :key="articulo.id"
                  :value="articulo.id"
                >
                  {{ articulo.nombre }} - ${{ articulo.precio }} (Stock:
                  {{ articulo.stock }})
                </option>
              </select>

              <input
                v-model.number="item.cantidad"
                type="number"
                min="1"
                :max="obtenerArticulo(item.articuloId)?.stock || 1"
                class="input-cantidad"
              />

              <span class="subtotal">
                ${{
                  (obtenerArticulo(item.articuloId)?.precio || 0) *
                  item.cantidad
                }}
              </span>

              <button
                type="button"
                @click="eliminarArticulo(index)"
                class="btn-eliminar-item"
              >
                🗑️
              </button>
            </div>
          </div>

          <div class="metodo-pago">
            <label>Método de Pago</label>
            <div class="radio-group">
              <label>
                <input type="radio" v-model="metodoPago" value="efectivo" />
                💵 Efectivo
              </label>
              <label>
                <input type="radio" v-model="metodoPago" value="tarjeta" />
                💳 Tarjeta
              </label>
              <label>
                <input
                  type="radio"
                  v-model="metodoPago"
                  value="transferencia"
                />
                🏦 Transferencia
              </label>
              <label>
                <input type="radio" v-model="metodoPago" value="otro" />
                📱 Otro
              </label>
            </div>
          </div>

          <div class="total-section">
            <h3>Total: ${{ total.toFixed(2) }}</h3>
          </div>

          <div class="form-actions">
            <button
              type="button"
              @click="cerrarFormulario"
              class="btn-cancelar"
            >
              Cancelar
            </button>
            <button type="submit" class="btn-guardar">Registrar Venta</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Lista de Ventas -->
    <div v-if="ventas.length === 0" class="empty-state">
      <p>📭 No hay ventas registradas</p>
      <p>Comienza registrando tu primera venta</p>
    </div>

    <div v-else class="ventas-list">
      <div v-for="venta in ventas" :key="venta.id" class="venta-card">
        <div class="venta-header">
          <div>
            <h3>Venta #{{ venta.id }}</h3>
            <p class="fecha">{{ formatearFecha(venta.fecha) }}</p>
          </div>
          <button @click="eliminarVenta(venta.id)" class="btn-eliminar-venta">
            🗑️
          </button>
        </div>

        <div class="venta-detalles">
          <h4>Artículos:</h4>
          <ul>
            <li v-for="(articulo, idx) in venta.articulos" :key="idx">
              {{ articulo.nombre }} x{{ articulo.cantidad }} - ${{
                articulo.subtotal.toFixed(2)
              }}
            </li>
          </ul>
        </div>

        <div class="venta-footer">
          <span class="metodo">
            {{
              venta.metodoPago === "efectivo"
                ? "💵"
                : venta.metodoPago === "tarjeta"
                ? "💳"
                : venta.metodoPago === "transferencia"
                ? "🏦"
                : "📱"
            }}
            {{
              venta.metodoPago.charAt(0).toUpperCase() +
              venta.metodoPago.slice(1)
            }}
          </span>
          <span class="total">Total: ${{ venta.total.toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ventas {
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

.btn-nueva-venta {
  padding: 0.75rem 1.5rem;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-nueva-venta:hover {
  background: #5568d3;
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
  overflow-y: auto;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
}

.modal-large {
  max-width: 700px;
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

/* Artículos de la venta */
.articulos-venta {
  margin-bottom: 1.5rem;
}

.articulos-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.articulos-header h4 {
  margin: 0;
  color: #333;
}

.btn-agregar-articulo {
  padding: 0.5rem 1rem;
  background: #00b894;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 0.9rem;
  cursor: pointer;
}

.empty-cart {
  text-align: center;
  padding: 2rem;
  color: #999;
  border: 2px dashed #e0e0e0;
  border-radius: 5px;
}

.articulo-item {
  display: grid;
  grid-template-columns: 2fr 100px 100px 50px;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 5px;
}

.select-articulo,
.input-cantidad {
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  font-size: 0.9rem;
}

.subtotal {
  font-weight: 600;
  color: #667eea;
  text-align: right;
}

.btn-eliminar-item {
  background: #ff7675;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
}

/* Método de pago */
.metodo-pago {
  margin-bottom: 1.5rem;
}

.metodo-pago label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 600;
}

.radio-group {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.radio-group label {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
}

.radio-group label:hover {
  border-color: #667eea;
}

.radio-group input {
  margin-right: 0.5rem;
}

/* Total */
.total-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 1.5rem;
}

.total-section h3 {
  margin: 0;
  font-size: 2rem;
}

/* Acciones del formulario */
.form-actions {
  display: flex;
  gap: 1rem;
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
  background: #00b894;
  color: white;
}

/* Lista de ventas */
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #999;
}

.ventas-list {
  display: grid;
  gap: 1.5rem;
}

.venta-card {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.5rem;
  transition: all 0.3s;
}

.venta-card:hover {
  border-color: #667eea;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
}

.venta-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 1rem;
}

.venta-header h3 {
  margin: 0 0 0.25rem 0;
  color: #333;
}

.fecha {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

.btn-eliminar-venta {
  background: #ff7675;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 1rem;
}

.venta-detalles {
  margin-bottom: 1rem;
}

.venta-detalles h4 {
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 0.9rem;
}

.venta-detalles ul {
  margin: 0;
  padding-left: 1.5rem;
}

.venta-detalles li {
  color: #666;
  margin-bottom: 0.25rem;
}

.venta-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 2px solid #e0e0e0;
}

.metodo {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.total {
  font-size: 1.5rem;
  font-weight: 700;
  color: #667eea;
}
</style>
