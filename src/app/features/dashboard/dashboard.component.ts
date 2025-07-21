import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';
import { WeatherService } from 'src/app/core/services/weather.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  cards = [
    {
      header: 'Equipamentos',
      image: 'tratorfGrade.png',
      title: 'Equipamentos Bracell',
      description: 'Clique no botão para visualizar a Tabela de equipamentos.',
      route: '/equipments',
      icon: '🚜',
      stats: { total: 150, active: 142, maintenance: 8 }
    },
    {
      header: 'Operações',
      image: 'BracellCampo.jpg',
      title: 'Operações Bracell',
      description: 'Acesse os dados operacionais registrados por campo.',
      route: '/operations',
      icon: '📊',
      stats: { total: 89, completed: 76, inProgress: 13 }
    },
    {
      header: 'Reconstrução de Linhas',
      image: 'linhas.png',
      title: 'Download de Linhas (ZIP)',
      description: 'Baixe os arquivos ZIP para reconstrução de linhas.',
      route: '/download-zip',
      icon: '🗂️',
      stats: { total: 0 }
    },
  ];

  // Estatísticas impressionantes
  stats = {
    totalEquipments: 150,
    activeOperations: 13,
    efficiencyRate: 94.5,
    totalArea: 12500,
    lastUpdate: new Date()
  };

  // Notificações em tempo real
  notifications = [
    { 
      type: 'success', 
      message: '✅ Operação concluída com sucesso!', 
      time: '2 min atrás',
      icon: '🎉'
    },
    { 
      type: 'warning', 
      message: '⚠️ Manutenção programada para amanhã', 
      time: '15 min atrás',
      icon: '🔧'
    },
    { 
      type: 'info', 
      message: '📈 Eficiência aumentou 2.3% este mês', 
      time: '1 hora atrás',
      icon: '📊'
    }
  ];

  // Dados em tempo real
  realTimeData = {
    currentTime: new Date(),
    temperature: 24.5,
    humidity: 65,
    windSpeed: 12.3
  };

  selectedCity: string = '';
  searchMode: 'city' | 'coords' = 'city';
  latitude: string = '';
  longitude: string = '';
  isLoadingWeather: boolean = false;
  weatherError: string = '';
  isTyping: boolean = false;
  
  // Debounce timers
  private citySearchTimeout: any;
  private coordsSearchTimeout: any;

  ngOnInitCalled = false;

  constructor(
    private router: Router,
    private storageService: StorageService,
    private weatherService: WeatherService
  ) {}

  async ngOnInit() {
    // Atualizar dados em tempo real
    setInterval(() => {
      this.realTimeData.currentTime = new Date();
      this.realTimeData.temperature = 24.5 + (Math.random() - 0.5) * 2;
      this.realTimeData.humidity = 65 + (Math.random() - 0.5) * 10;
      this.realTimeData.windSpeed = 12.3 + (Math.random() - 0.5) * 5;
    }, 5000);

    // Buscar quantidade de arquivos ZIP (talhões)
    try {
      const zipFiles = await this.storageService.listAllZipFiles();
      this.cards[2].stats.total = zipFiles.length;
    } catch (e) {
      this.cards[2].stats.total = 0;
    }

    // Carregar cidade ou coordenadas salvas
    const savedCity = localStorage.getItem('weather_city');
    const savedLat = localStorage.getItem('weather_lat');
    const savedLon = localStorage.getItem('weather_lon');
    if (savedLat && savedLon) {
      this.searchMode = 'coords';
      this.latitude = savedLat;
      this.longitude = savedLon;
      this.updateWeatherByCoords();
    } else if (savedCity) {
      this.selectedCity = savedCity;
      this.updateWeatherByCity();
    } else {
      this.selectedCity = 'Lencois Paulista,BR';
      this.updateWeatherByCity();
    }
    setInterval(() => {
      if (this.searchMode === 'coords') {
        this.updateWeatherByCoords();
      } else {
        this.updateWeatherByCity();
      }
    }, 10 * 60 * 1000);
    this.ngOnInitCalled = true;
  }

  updateWeatherByCity() {
    if (!this.selectedCity || !this.selectedCity.trim() || this.selectedCity.trim().length < 3) return;
    
    this.isLoadingWeather = true;
    this.weatherError = '';
    
    localStorage.setItem('weather_city', this.selectedCity);
    localStorage.removeItem('weather_lat');
    localStorage.removeItem('weather_lon');
    
    this.weatherService.getWeatherByCity(this.selectedCity).subscribe({
      next: (data: any) => {
        this.realTimeData.temperature = data.main.temp;
        this.realTimeData.humidity = data.main.humidity;
        this.realTimeData.windSpeed = data.wind.speed;
        this.isLoadingWeather = false;
        this.weatherError = '';
      },
      error: (error) => {
        console.error('Erro ao buscar clima por cidade:', error);
        
        // Só mostrar erro se a cidade tiver um tamanho razoável
        if (this.selectedCity.trim().length >= 3) {
          if (error.status === 404) {
            this.weatherError = `Cidade "${this.selectedCity}" não encontrada. Tente o formato "Cidade,País" (ex: "São Paulo,BR")`;
          } else if (error.status === 429) {
            this.weatherError = 'Muitas requisições. Aguarde um momento antes de tentar novamente.';
          } else {
            this.weatherError = 'Erro ao buscar dados da cidade. Verifique o nome da cidade.';
          }
        }
        this.isLoadingWeather = false;
      }
    });
  }

  updateWeatherByCoords() {
    if (!this.latitude || !this.longitude) return;
    
    const lat = parseFloat(this.latitude);
    const lon = parseFloat(this.longitude);
    
    // Validação mais rigorosa
    if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      this.weatherError = 'Coordenadas inválidas. Latitude deve estar entre -90 e 90, Longitude entre -180 e 180.';
      return;
    }
    
    this.isLoadingWeather = true;
    this.weatherError = '';
    
    localStorage.setItem('weather_lat', this.latitude);
    localStorage.setItem('weather_lon', this.longitude);
    localStorage.removeItem('weather_city');
    
    this.weatherService.getWeatherByCoords(this.latitude, this.longitude).subscribe({
      next: (data: any) => {
        this.realTimeData.temperature = data.main.temp;
        this.realTimeData.humidity = data.main.humidity;
        this.realTimeData.windSpeed = data.wind.speed;
        this.isLoadingWeather = false;
        this.weatherError = '';
      },
      error: (error) => {
        console.error('Erro ao buscar clima por coordenadas:', error);
        if (error.status === 429) {
          this.weatherError = 'Muitas requisições. Aguarde um momento antes de tentar novamente.';
        } else {
          this.weatherError = 'Erro ao buscar dados das coordenadas. Verifique os valores inseridos.';
        }
        this.isLoadingWeather = false;
      }
    });
  }

  manualUpdateWeather() {
    this.weatherError = '';
    if (this.searchMode === 'city' && this.selectedCity.trim().length >= 3) {
      this.updateWeatherByCity();
    } else if (this.searchMode === 'coords' && this.latitude && this.longitude) {
      // Validar coordenadas antes de atualizar
      const lat = parseFloat(this.latitude);
      const lon = parseFloat(this.longitude);
      
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        this.updateWeatherByCoords();
      } else {
        this.weatherError = 'Coordenadas inválidas. Latitude deve estar entre -90 e 90, Longitude entre -180 e 180.';
      }
    } else if (this.searchMode === 'city') {
      this.weatherError = 'Digite pelo menos 3 caracteres para o nome da cidade.';
    } else {
      this.weatherError = 'Preencha ambas as coordenadas (latitude e longitude).';
    }
  }

  onCitySearchChange(event: any) {
    const city = this.extractValueFromEvent(event);
    this.selectedCity = city;
    this.searchMode = 'city';
    this.weatherError = '';
    this.isTyping = true;
    
    // Limpar timeout anterior
    if (this.citySearchTimeout) {
      clearTimeout(this.citySearchTimeout);
    }
    
    // Só buscar se tiver pelo menos 3 caracteres e após 1 segundo de inatividade
    if (this.ngOnInitCalled && this.selectedCity.trim().length >= 3) {
      this.citySearchTimeout = setTimeout(() => {
        this.isTyping = false;
        this.updateWeatherByCity();
      }, 1000); // 1 segundo de debounce
    } else {
      // Se menos de 3 caracteres, parar de mostrar "digitando"
      setTimeout(() => {
        this.isTyping = false;
      }, 300);
    }
  }

  onCoordsChange(event: any, coordType?: string) {
    // Extrair o valor corretamente do evento
    const value = this.extractValueFromEvent(event);
    
    if (coordType === 'lat') {
      this.latitude = value;
    } else if (coordType === 'lon') {
      this.longitude = value;
    } else {
      // Mantém compatibilidade com chamadas antigas
      this.latitude = value;
    }
    
    this.searchMode = 'coords';
    this.weatherError = '';
    
    // Limpar timeout anterior
    if (this.coordsSearchTimeout) {
      clearTimeout(this.coordsSearchTimeout);
    }
    
    // Validar coordenadas apenas se ambas estiverem preenchidas
    if (this.ngOnInitCalled && this.latitude && this.longitude) {
      const lat = parseFloat(this.latitude);
      const lon = parseFloat(this.longitude);
      
      if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
        // Debounce para coordenadas também
        this.coordsSearchTimeout = setTimeout(() => {
          this.updateWeatherByCoords();
        }, 800); // 800ms de debounce para coordenadas
      } else if (this.latitude && this.longitude) {
        // Só mostrar erro se ambos os campos estiverem preenchidos
        this.weatherError = 'Coordenadas inválidas. Latitude deve estar entre -90 e 90, Longitude entre -180 e 180.';
      }
    }
  }

  switchSearchMode(mode: 'city' | 'coords') {
    this.searchMode = mode;
    this.weatherError = '';
    
    if (mode === 'city') {
      // Limpar coordenadas quando trocar para busca por cidade
      this.latitude = '';
      this.longitude = '';
    } else {
      // Limpar cidade quando trocar para busca por coordenadas  
      this.selectedCity = '';
    }
  }

  navigateTo(route: string) {
    if (route) {
      // Adicionar efeito de loading
      this.showLoadingEffect();
      setTimeout(() => {
        this.router.navigateByUrl(route);
      }, 300);
    }
  }

  showLoadingEffect() {
    // Efeito visual de loading
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
      card.classList.add('pulse');
      setTimeout(() => card.classList.remove('pulse'), 300);
    });
  }

  getEfficiencyColor() {
    if (this.stats.efficiencyRate >= 90) return '#4CAF50';
    if (this.stats.efficiencyRate >= 80) return '#FF9800';
    return '#F44336';
  }

  formatNumber(num: number): string {
    return num.toLocaleString('pt-BR');
  }

  getTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    return date.toLocaleDateString('pt-BR');
  }

  ngOnDestroy() {
    // Limpar timeouts para evitar vazamentos de memória
    if (this.citySearchTimeout) {
      clearTimeout(this.citySearchTimeout);
    }
    if (this.coordsSearchTimeout) {
      clearTimeout(this.coordsSearchTimeout);
    }
  }

  private extractValueFromEvent(event: any): string {
    // Tratar diferentes tipos de eventos e valores
    if (event && event.target && event.target.value !== undefined) {
      return event.target.value;
    } else if (typeof event === 'string' || typeof event === 'number') {
      return event.toString();
    }
    return '';
  }
}
