  <script setup lang="ts">
  import { ref, onMounted } from "vue";

  interface Estadisticas {
    totalArticulos: number;
    totalVentas: number;
    articulosAgotados: number;
    ventasHoy: number;
    ingresoTotal: number;
  }

  const estadisticas = ref<Estadisticas>({
    totalArticulos: 0,
    totalVentas: 0,
    articulosAgotados: 0,
    ventasHoy: 0,
    ingresoTotal: 0,
  });

  const cargando = ref(true);

  const cargarEstadisticas = async () => {
    try {
      const [articulosRes, ventasRes] = await Promise.all([
        fetch("http://localhost:3000/api/articulos"),
        fetch("http://localhost:3000/api/ventas"),
      ]);

      const articulos = await articulosRes.json();
      const ventas = await ventasRes.json();

      const hoy = new Date().toISOString().split("T")[0];
      const ventasHoy = ventas.filter((v: any) => v.fecha.startsWith(hoy));

      estadisticas.value = {
        totalArticulos: articulos.length,
        totalVentas: ventas.length,
        articulosAgotados: articulos.filter((a: any) => a.stock === 0).length,
        ventasHoy: ventasHoy.length,
        ingresoTotal: ventas.reduce((sum: number, v: any) => sum + v.total, 0),
      };
    } catch (error) {
      console.error("Error al cargar estadísticas:", error);
    } finally {
      cargando.value = false;
    }
  };

  onMounted(() => {
    cargarEstadisticas();
  });
  </script>

  <template>
    <div class="dashboard">
      <h2>📊 Dashboard</h2>
      <p class="subtitle">Resumen general del sistema</p>

      <div v-if="cargando" class="loading">Cargando estadísticas...</div>

      <div v-else class="stats-grid">
        <div class="stat-card blue">
          <div class="stat-icon">📦</div>
          <div class="stat-info">
            <h3>{{ estadisticas.totalArticulos }}</h3>
            <p>Total Artículos</p>
          </div>
        </div>

        <div class="stat-card green">
          <div class="stat-icon">💰</div>
          <div class="stat-info">
            <h3>{{ estadisticas.totalVentas }}</h3>
            <p>Total Ventas</p>
          </div>
        </div>

        <div class="stat-card orange">
          <div class="stat-icon">⚠️</div>
          <div class="stat-info">
            <h3>{{ estadisticas.articulosAgotados }}</h3>
            <p>Artículos Agotados</p>
          </div>
        </div>

        <div class="stat-card purple">
          <div class="stat-icon">📅</div>
          <div class="stat-info">
            <h3>{{ estadisticas.ventasHoy }}</h3>
            <p>Ventas Hoy</p>
          </div>
        </div>

        <div class="stat-card teal">
          <div class="stat-icon">💵</div>
          <div class="stat-info">
            <h3>${{ estadisticas.ingresoTotal.toFixed(2) }}</h3>
            <p>Ingreso Total</p>
          </div>
        </div>
      </div>

      <div class="welcome-section">
        <h3>¡Bienvenido al Sistema de Almacén! 🎉</h3>
        <p>
          Utiliza el menú de navegación para gestionar tus artículos y ventas.
          Mantén tu inventario actualizado y registra todas tus transacciones.
        </p>
      </div>
    </div>
  </template>

  <style scoped>
  .dashboard {
    background: white;
    border-radius: 10px;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .dashboard h2 {
    color: #333;
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: #666;
    margin-bottom: 2rem;
  }

  .loading {
    text-align: center;
    padding: 3rem;
    color: #666;
    font-size: 1.2rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    padding: 1.5rem;
    border-radius: 10px;
    color: white;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-5px);
  }

  .stat-card.blue {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .stat-card.green {
    background: linear-gradient(135deg, #00b894 0%, #00cec9 100%);
  }

  .stat-card.orange {
    background: linear-gradient(135deg, #fdcb6e 0%, #e17055 100%);
  }

  .stat-card.purple {
    background: linear-gradient(135deg, #a29bfe 0%, #6c5ce7 100%);
  }

  .stat-card.teal {
    background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
  }

  .stat-icon {
    font-size: 3rem;
    margin-right: 1rem;
  }

  .stat-info h3 {
    font-size: 2rem;
    margin: 0 0 0.25rem 0;
  }

  .stat-info p {
    margin: 0;
    opacity: 0.9;
    font-size: 0.9rem;
  }

  .welcome-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    border-radius: 10px;
    text-align: center;
  }

  .welcome-section h3 {
    margin-top: 0;
  }

  .welcome-section p {
    margin-bottom: 0;
    line-height: 1.6;
  }
  </style>
