<template>
  <div class="min-h-full bg-gray-100">
    <div class="py-10">
      <div class="max-w-3xl mx-auto sm:px-6 lg:px-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="border-b border-gray-200">
            <nav class="-mb-px flex" aria-label="Tabs">
              <button
                v-for="tab in tabs"
                :key="tab.name"
                @click="currentTab = tab.id"
                :class="[
                  currentTab === tab.id
                    ? 'border-[#01FBA1] text-[#012928]'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  'w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm'
                ]"
              >
                {{ tab.name }}
              </button>
            </nav>
          </div>

          <div class="px-4 py-5 sm:p-6">
            <!-- Aba de Perfil -->
            <div v-if="currentTab === 'profile'" class="space-y-6">
              <div class="flex items-center space-x-6">
                <div class="relative">
                  <img
                    :src="photoPreview || userData.photoURL || userPhotoUrl || 'https://ui-avatars.com/api/?name=' + userData.displayName"
                    class="h-24 w-24 rounded-full object-cover border-2 border-[#01FBA1]"
                    :alt="userData.displayName"
                  >
                  <label
                    class="absolute bottom-0 right-0 bg-[#01FBA1] rounded-full p-1 cursor-pointer hover:bg-[#01FBA1]/80"
                    title="Alterar foto"
                  >
                    <input
                      type="file"
                      class="hidden"
                      accept="image/*"
                      @change="handlePhotoChange"
                    >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </label>
                </div>
                <div>
                  <h3 class="text-lg font-medium text-[#012928]">Foto do Perfil</h3>
                  <p class="text-sm text-gray-500">JPG ou PNG. Máximo 1MB.</p>
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[#012928]">Nome Completo</label>
                  <input
                    type="text"
                    v-model="userData.displayName"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    :placeholder="authStore.userData?.displayName || 'Seu nome completo'"
                    :disabled="!authStore.isAdmin"
                  >
                  <p v-if="!authStore.isAdmin" class="mt-1 text-sm text-gray-500">
                    Apenas administradores podem alterar o nome completo
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Nome Curto/Apelido</label>
                  <input
                    type="text"
                    v-model="userData.name"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                    :placeholder="authStore.userData?.name || 'Como você gostaria de ser chamado'"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">E-mail</label>
                  <input
                    type="email"
                    v-model="userData.email"
                    disabled
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Telefone</label>
                  <input
                    type="tel"
                    v-model="userData.phoneNumber"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="saveProfile"
                  class="inline-flex justify-center rounded-md border border-transparent bg-[#01FBA1] py-2 px-4 text-sm font-medium text-[#012928] shadow-sm hover:bg-[#01FBA1]/80 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>

            <!-- Aba de Segurança -->
            <div v-else-if="currentTab === 'security'" class="space-y-6">
              <div class="space-y-4">
                <div>
                  <label class="block text-sm font-medium text-[#012928]">Senha Atual</label>
                  <input
                    type="password"
                    v-model="currentPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Nova Senha</label>
                  <input
                    type="password"
                    v-model="newPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>

                <div>
                  <label class="block text-sm font-medium text-[#012928]">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    v-model="confirmPassword"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#01FBA1] focus:ring-[#01FBA1] sm:text-sm"
                  >
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  @click="changePassword"
                  class="inline-flex justify-center rounded-md border border-transparent bg-[#01FBA1] py-2 px-4 text-sm font-medium text-[#012928] shadow-sm hover:bg-[#01FBA1]/80 focus:outline-none focus:ring-2 focus:ring-[#01FBA1] focus:ring-offset-2"
                >
                  Alterar Senha
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useToast } from 'vue-toastification';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const authStore = useAuthStore();
const toast = useToast();
const storage = getStorage();

const tabs = [
  { id: 'profile', name: 'Perfil' },
  { id: 'security', name: 'Segurança' }
];

const currentTab = ref('profile');
const photoPreview = ref('');
const userPhotoUrl = ref(authStore.userData?.photoURL || '');
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const userData = ref({
  displayName: authStore.userData?.displayName || '',  // Nome completo
  name: authStore.userData?.name || '',               // Nome curto/apelido
  email: authStore.userData?.email || '',
  phoneNumber: authStore.userData?.phoneNumber || '',
  photoURL: authStore.userData?.photoURL || ''
});

onMounted(async () => {
  if (authStore.userData?.photoURL) {
    userPhotoUrl.value = authStore.userData.photoURL;
    userData.value.photoURL = authStore.userData.photoURL;
  }
  // Recarregar os dados do usuário para garantir que estão atualizados
  await authStore.refreshUserData();
});

watch(() => authStore.userData?.photoURL, (newPhotoURL) => {
  if (newPhotoURL) {
    userPhotoUrl.value = newPhotoURL;
    userData.value.photoURL = newPhotoURL;
  }
});

const handlePhotoChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (!file) return;

  // Verificar o tamanho do arquivo (máximo 1MB)
  if (file.size > 1024 * 1024) {
    toast.error('A imagem deve ter no máximo 1MB');
    return;
  }

  // Criar preview
  const reader = new FileReader();
  reader.onload = (e) => {
    photoPreview.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);

  try {
    const storageReference = storageRef(storage, `profile-photos/${authStore.user?.uid}`);
    await uploadBytes(storageReference, file);
    const downloadURL = await getDownloadURL(storageReference);
    
    // Atualizar URL da foto no Auth e Firestore
    await authStore.updateUserPhoto(downloadURL);
    userPhotoUrl.value = downloadURL;
    userData.value.photoURL = downloadURL; // Atualiza o userData local
    toast.success('Foto atualizada com sucesso!');
  } catch (error) {
    console.error('Erro ao fazer upload da foto:', error);
    toast.error('Erro ao atualizar a foto');
    // Limpar o preview em caso de erro
    photoPreview.value = '';
  }
};

const saveProfile = async () => {
  try {
    if (!authStore.user?.uid) return;

    await updateDoc(doc(db, 'users', authStore.user.uid), {
      displayName: userData.value.displayName,
      name: userData.value.name,
      phoneNumber: userData.value.phoneNumber
    });

    // Atualizar o estado global
    await authStore.refreshUserData();
    
    toast.success('Perfil atualizado com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    toast.error('Erro ao atualizar perfil');
  }
};

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.error('As senhas não coincidem');
    return;
  }

  try {
    await authStore.updatePassword(currentPassword.value, newPassword.value);
    currentPassword.value = '';
    newPassword.value = '';
    confirmPassword.value = '';
    toast.success('Senha alterada com sucesso!');
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    toast.error('Erro ao alterar senha');
  }
};
</script>
