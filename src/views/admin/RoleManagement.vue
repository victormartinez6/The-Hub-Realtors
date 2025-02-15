<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Controle de Perfis</h1>
    </div>

    <!-- Cards de Perfis -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <!-- Super Admin -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-indigo-600 px-4 py-3">
          <h2 class="text-lg font-semibold text-white">Super Admin</h2>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Acesso total ao sistema
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Gerenciamento de usuários
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Configurações do sistema
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Relatórios gerenciais
            </div>
          </div>
        </div>
      </div>

      <!-- Broker -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-blue-600 px-4 py-3">
          <h2 class="text-lg font-semibold text-white">Broker</h2>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Gestão de corretores
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Gestão de comissões
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Relatórios de vendas
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Aprovação de propriedades
            </div>
          </div>
        </div>
      </div>

      <!-- Realtor -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-green-600 px-4 py-3">
          <h2 class="text-lg font-semibold text-white">Corretor</h2>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Gestão de leads
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Cadastro de propriedades
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Agendamento de visitas
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Visualização de comissões
            </div>
          </div>
        </div>
      </div>

      <!-- Partner -->
      <div class="bg-white rounded-lg shadow-lg overflow-hidden">
        <div class="bg-yellow-600 px-4 py-3">
          <h2 class="text-lg font-semibold text-white">Parceiro</h2>
        </div>
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Indicação de leads
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Acompanhamento de indicações
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Visualização de comissões
            </div>
            <div class="flex items-center text-sm">
              <svg class="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Dashboard simplificado
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabela Detalhada de Permissões -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Detalhamento de Permissões</h2>
      <div class="bg-white shadow-lg rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Recurso
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Super Admin
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Broker
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Corretor
              </th>
              <th scope="col" class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parceiro
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Dashboard -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Dashboard
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Completo</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Completo</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Limitado</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Básico</span>
              </td>
            </tr>

            <!-- Leads -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Leads
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todos</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Da equipe</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Próprios</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Indicados</span>
              </td>
            </tr>

            <!-- Propriedades -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Propriedades
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todas</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todas</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Cadastrar/Ver</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-red-600">Visualizar</span>
              </td>
            </tr>

            <!-- Comissões -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Comissões
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todas</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Da equipe</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Próprias</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Próprias</span>
              </td>
            </tr>

            <!-- Eventos -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Eventos
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todos</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Da equipe</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Próprios</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-red-600">Não</span>
              </td>
            </tr>

            <!-- Relatórios -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Relatórios
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Completos</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Da equipe</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Básicos</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-red-600">Não</span>
              </td>
            </tr>

            <!-- Usuários -->
            <tr>
              <td class="px-6 py-4 text-sm font-medium text-gray-900">
                Usuários
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-green-600">Todos</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-blue-600">Equipe</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-red-600">Não</span>
              </td>
              <td class="px-6 py-4 text-center">
                <span class="text-red-600">Não</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Legenda -->
    <div class="mt-6 bg-white rounded-lg shadow-lg p-4">
      <h3 class="text-lg font-semibold text-gray-900 mb-3">Legenda de Permissões</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="flex items-center">
          <span class="w-3 h-3 bg-green-600 rounded-full mr-2"></span>
          <span class="text-sm text-gray-600">Acesso Total</span>
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-blue-600 rounded-full mr-2"></span>
          <span class="text-sm text-gray-600">Acesso Limitado</span>
        </div>
        <div class="flex items-center">
          <span class="w-3 h-3 bg-red-600 rounded-full mr-2"></span>
          <span class="text-sm text-gray-600">Sem Acesso</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Não é necessário lógica adicional para esta página, pois é uma página estática de visualização
</script>
