<template>
  <div class="marketing-container">
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-card class="mb-4">
            <v-card-title class="d-flex align-center">
              <v-icon color="#012928" class="mr-2">mdi-bullhorn</v-icon>
              <span>Marketing</span>
              <v-spacer></v-spacer>
            </v-card-title>

            <v-card-text>
              <p class="text-body-1 mb-6">
                Bem-vindo à área de Marketing. Aqui você pode gerenciar suas campanhas de marketing e templates de email.
              </p>

              <v-row>
                <v-col cols="12" sm="6" md="4">
                  <v-card
                    class="marketing-card"
                    variant="outlined"
                    @click="$router.push('/marketing/email-templates')"
                  >
                    <v-card-title class="d-flex align-center">
                      <v-icon color="#012928" class="mr-2">mdi-email-outline</v-icon>
                      Templates de Email
                    </v-card-title>
                    <v-card-text>
                      <p class="text-body-2">
                        Gerencie seus templates de email para diferentes campanhas e comunicações.
                      </p>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        color="#012928"
                        variant="text"
                        @click.stop="$router.push('/marketing/email-templates')"
                      >
                        Acessar
                        <v-icon end>mdi-arrow-right</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>

                <v-col cols="12" sm="6" md="4">
                  <v-card
                    class="marketing-card"
                    variant="outlined"
                    @click="$router.push('/marketing/mail')"
                  >
                    <v-card-title class="d-flex align-center">
                      <v-icon color="#012928" class="mr-2">mdi-email-send</v-icon>
                      Mail Marketing
                    </v-card-title>
                    <v-card-text>
                      <p class="text-body-2">
                        Envie emails de marketing para seus leads e clientes usando templates personalizados.
                      </p>
                    </v-card-text>
                    <v-card-actions>
                      <v-btn
                        color="#012928"
                        variant="text"
                        @click.stop="$router.push('/marketing/mail')"
                      >
                        Acessar
                        <v-icon end>mdi-arrow-right</v-icon>
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup lang="ts">
// Sem lógica adicional necessária para esta página de navegação
</script>

<style scoped>
.marketing-container {
  padding: 16px;
}

.marketing-card {
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
}

.marketing-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
