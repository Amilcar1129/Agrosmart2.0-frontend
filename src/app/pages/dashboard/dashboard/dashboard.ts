import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { ChartData, ChartOptions, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { LoadingService } from '../../../services/loading';
import { NotificationService } from '../../../services/notification';
import { SurveyService } from './../../../services/survey';

interface Survey {
  id: number;
  fecha_creacion: string;
  estado: string;
  comunidad?: { nombre: string; canton: string };
  cultivos?: { nombre_cultivo: string; area_ha: number }[];
  animales?: { tipo: string; cantidad: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatDividerModule,
    MatButtonToggleModule,
    FormsModule,
    MatTableModule,
    MatChipsModule,
    BaseChartDirective
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit {
  private surveyService = inject(SurveyService);
  private notification = inject(NotificationService);
  private loading = inject(LoadingService);

  // ========== ESTADO ==========
  allSurveys: Survey[] = [];
  filteredSurveys: Survey[] = [];
  filterPeriod: string = 'all';

  // ========== KPIs ==========
  totalEncuestas = 0;
  totalComunidades = 0;
  totalHectareas = 0;
  totalAnimales = 0;
  totalCultivos = 0;
  promedioHectareas = 0;
  tasaCompletitud = 0;

  // ========== ACTIVIDAD RECIENTE ==========
  recentSurveys: Survey[] = [];
  displayedColumns: string[] = ['id', 'fecha', 'comunidad', 'estado'];

  // ========== GRÁFICO 1: Encuestas por Cantón (Barras verticales) ==========
  barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Encuestas por Cantón', font: { size: 14 } }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };
  barChartType: 'bar' = 'bar';

  // ========== GRÁFICO 2: Top Cultivos (Barras horizontales) ==========
  topCultivosChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  topCultivosChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y', // ¡Barras horizontales!
    plugins: {
      legend: { display: false },
      title: { display: true, text: 'Top Cultivos (Hectáreas)', font: { size: 14 } }
    },
    scales: {
      x: { beginAtZero: true }
    }
  };
  topCultivosChartType: 'bar' = 'bar';

  // ========== GRÁFICO 3: Distribución de Animales (Dona) ==========
  animalesChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  animalesChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 } } },
      title: { display: true, text: 'Distribución de Animales', font: { size: 14 } }
    }
  };
  animalesChartType: 'doughnut' = 'doughnut';

  // ========== GRÁFICO 4: Estado de Encuestas (Dona) ==========
  estadoChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };
  estadoChartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right', labels: { font: { size: 11 } } },
      title: { display: true, text: 'Estado de Encuestas', font: { size: 14 } }
    }
  };
  estadoChartType: 'doughnut' = 'doughnut';

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.loading.show();
    this.surveyService.getAllSurveys({ limit: 1000 }).subscribe({
      next: (response) => {
        this.loading.hide();
        const encuestas = response.data || response;
        if (Array.isArray(encuestas)) {
          this.allSurveys = encuestas;
          this.aplicarFiltro();
        } else {
          this.notification.showWarning('No se pudieron cargar los datos');
        }
      },
      error: (err) => {
        this.loading.hide();
        this.notification.showError('Error al cargar datos del dashboard');
        console.error(err);
      }
    });
  }

  aplicarFiltro(): void {
    const now = new Date();
    let filtered = [...this.allSurveys];

    switch (this.filterPeriod) {
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(s => new Date(s.fecha_creacion) >= weekAgo);
        break;
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(s => new Date(s.fecha_creacion) >= monthAgo);
        break;
      case 'year':
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(s => new Date(s.fecha_creacion) >= yearAgo);
        break;
      default: // 'all'
        break;
    }

    this.filteredSurveys = filtered;
    this.calcularMetricas(filtered);
    this.actualizarGraficos(filtered);
  }

  private calcularMetricas(encuestas: Survey[]): void {
    const total = encuestas.length;
    this.totalEncuestas = total;

    // Comunidades únicas
    const comunidadesSet = new Set(encuestas.map(e => e.comunidad?.nombre).filter(Boolean));
    this.totalComunidades = comunidadesSet.size;

    // Hectáreas, cultivos totales, animales
    let hectTotales = 0;
    let cultivosCount = 0;
    let animTotales = 0;

    encuestas.forEach(e => {
      const cultivos = e.cultivos || [];
      cultivosCount += cultivos.length;
      hectTotales += cultivos.reduce((sum, c) => sum + (c.area_ha || 0), 0);

      const animales = e.animales || [];
      animTotales += animales.reduce((sum, a) => sum + (a.cantidad || 0), 0);
    });

    this.totalHectareas = hectTotales;
    this.totalCultivos = cultivosCount;
    this.totalAnimales = animTotales;
    this.promedioHectareas = total > 0 ? hectTotales / total : 0;

    // Tasa de completitud
    const completas = encuestas.filter(e => e.estado === 'completa').length;
    this.tasaCompletitud = total > 0 ? (completas / total) * 100 : 0;

    // Actividad reciente (las 5 más nuevas)
    this.recentSurveys = [...encuestas]
      .sort((a, b) => new Date(b.fecha_creacion).getTime() - new Date(a.fecha_creacion).getTime())
      .slice(0, 5);
  }

  private actualizarGraficos(encuestas: Survey[]): void {
    // ===== GRÁFICO 1: Encuestas por Cantón =====
    const cantonMap = new Map<string, number>();
    encuestas.forEach(e => {
      const canton = e.comunidad?.canton || 'Sin cantón';
      cantonMap.set(canton, (cantonMap.get(canton) || 0) + 1);
    });
    const cantonData = Array.from(cantonMap.entries()).sort((a, b) => b[1] - a[1]);

    this.barChartData = {
      labels: cantonData.map(item => item[0]),
      datasets: [{
        data: cantonData.map(item => item[1]),
        backgroundColor: '#2e7d32',
        borderRadius: 4
      }]
    };

    // ===== GRÁFICO 2: Top Cultivos por Hectárea =====
    const cultivosMap = new Map<string, number>();
    encuestas.forEach(e => {
      (e.cultivos || []).forEach(c => {
        cultivosMap.set(c.nombre_cultivo, (cultivosMap.get(c.nombre_cultivo) || 0) + c.area_ha);
      });
    });
    const topCultivos = Array.from(cultivosMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    this.topCultivosChartData = {
      labels: topCultivos.map(item => item[0]),
      datasets: [{
        data: topCultivos.map(item => item[1]),
        backgroundColor: '#4caf50',
        borderRadius: 4
      }]
    };

    // ===== GRÁFICO 3: Distribución de Animales =====
    const animalesMap = new Map<string, number>();
    encuestas.forEach(e => {
      (e.animales || []).forEach(a => {
        animalesMap.set(a.tipo, (animalesMap.get(a.tipo) || 0) + a.cantidad);
      });
    });
    const animalData = Array.from(animalesMap.entries());
    const coloresAnimales = ['#4caf50', '#ff9800', '#f44336', '#2196f3', '#9c27b0', '#795548'];

    this.animalesChartData = {
      labels: animalData.map(item => item[0]),
      datasets: [{
        data: animalData.map(item => item[1]),
        backgroundColor: coloresAnimales.slice(0, animalData.length),
        borderWidth: 2
      }]
    };

    // ===== GRÁFICO 4: Estado de Encuestas =====
    const estadoMap = new Map<string, number>();
    encuestas.forEach(e => {
      const estado = e.estado || 'desconocido';
      estadoMap.set(estado, (estadoMap.get(estado) || 0) + 1);
    });
    const estadoData = Array.from(estadoMap.entries());
    const coloresEstados = {
      'borrador': '#ff9800',
      'completa': '#4caf50'
    };

    this.estadoChartData = {
      labels: estadoData.map(item => item[0] === 'borrador' ? 'Borrador' : 'Completa'),
      datasets: [{
        data: estadoData.map(item => item[1]),
        backgroundColor: estadoData.map(item => coloresEstados[item[0] as keyof typeof coloresEstados] || '#9e9e9e'),
        borderWidth: 2
      }]
    };
  }
}