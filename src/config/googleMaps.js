// Configuração da API do Google Maps
export const googleMapsConfig = {
  // Chave de API do Google Maps
  apiKey: 'AIzaSyBx0vpsZTvNx1ERHsE43yv_Roy4tE5MyG0',
  
  // Opções de configuração
  options: {
    // Restrição por país (opcional)
    componentRestrictions: { country: 'us' }, // Restringir para endereços nos EUA
    
    // Tipos de lugares a serem retornados
    types: ['address']
  }
};
