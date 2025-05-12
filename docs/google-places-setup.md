# Configuração da API do Google Places para Autocompletar Endereços

Este documento explica como configurar e usar a funcionalidade de autocompletar endereços usando a API do Google Places no InstaHub.

## Pré-requisitos

1. Conta no Google Cloud Platform (GCP)
2. Projeto criado no GCP
3. Faturamento ativado no projeto

## Passos para Configuração

### 1. Obter uma Chave de API do Google Maps

1. Acesse o [Console do Google Cloud Platform](https://console.cloud.google.com/)
2. Selecione seu projeto ou crie um novo
3. No menu lateral, clique em "APIs e Serviços" > "Credenciais"
4. Clique em "Criar Credenciais" > "Chave de API"
5. Copie a chave de API gerada

### 2. Ativar as APIs Necessárias

1. No menu lateral, clique em "APIs e Serviços" > "Biblioteca"
2. Pesquise e ative as seguintes APIs:
   - Places API
   - Maps JavaScript API
   - Geocoding API

### 3. Configurar Restrições de Segurança (Recomendado)

1. No menu lateral, clique em "APIs e Serviços" > "Credenciais"
2. Clique na chave de API que você criou
3. Em "Restrições de aplicativo", selecione "Sites da Web HTTP referenciados (sites da Web)"
4. Adicione os domínios onde sua aplicação será executada (por exemplo, `localhost`, seu domínio de produção)
5. Em "Restrições de API", selecione "Restringir chave"
6. Selecione apenas as APIs que você ativou (Places API, Maps JavaScript API, Geocoding API)
7. Clique em "Salvar"

### 4. Configurar a Aplicação

1. Abra o arquivo `src/config/googleMaps.ts`
2. Substitua `SUA_CHAVE_API_AQUI` pela chave de API que você obteve:

```typescript
// Configuração da API do Google Maps
export const googleMapsConfig = {
  // Substitua pela sua chave de API do Google Maps
  apiKey: 'sua-chave-api-aqui',
  
  // Opções de configuração
  options: {
    // Restrição por país (opcional)
    componentRestrictions: { country: 'us' }, // Restringir para endereços nos EUA
    
    // Tipos de lugares a serem retornados
    types: ['address']
  }
};
```

## Uso da Funcionalidade

### Criação de Posts

1. Ao criar um novo post no InstaHub, o campo "Endereço do Imóvel" agora oferece autocompletar
2. Comece a digitar o endereço e o sistema mostrará sugestões de endereços completos
3. Selecione um endereço da lista para preencher automaticamente o campo
4. Os dados de geolocalização serão salvos junto com o post

### Visualização de Posts

1. Ao visualizar os detalhes de um post, o endereço do imóvel será exibido
2. Se o post foi criado com a funcionalidade de autocompletar, um mapa estático será exibido abaixo do endereço
3. Clique no mapa ou no link "Ver no Google Maps" para abrir o Google Maps com a localização do imóvel

## Solução de Problemas

### O autocompletar não está funcionando

- Verifique se a chave de API foi configurada corretamente
- Verifique se as APIs necessárias foram ativadas
- Verifique o console do navegador para erros relacionados à API do Google Maps

### O mapa não está sendo exibido

- Verifique se a chave de API foi configurada corretamente
- Verifique se as restrições de domínio estão configuradas corretamente
- Verifique o console do navegador para erros relacionados à API do Google Maps

## Limitações e Custos

A API do Google Places tem limites de uso gratuito e custos associados após exceder esses limites. Consulte a [documentação oficial](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) para mais informações sobre preços e limites.
