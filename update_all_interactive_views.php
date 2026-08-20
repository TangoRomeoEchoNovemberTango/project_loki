<?php
// Save as update_all_interactive_views.php and run with `php update_all_interactive_views.php`

$files = [];

// 1. Property Modal
$files['resources/js/Components/PropertyModal.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import { X, Building2 } from 'lucide-vue-next';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'save']);

const form = ref({ address: '', city: 'Pueblo', state: 'CO', zip: '', county: 'Pueblo', beds: 3, baths: 2, sqft: 1200, taxValue: '' });

const handleSubmit = () => {
  emit('save', { ...form.value, id: Date.now() });
  form.value = { address: '', city: 'Pueblo', state: 'CO', zip: '', county: 'Pueblo', beds: 3, baths: 2, sqft: 1200, taxValue: '' };
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2"><Building2 class="w-5 h-5 text-indigo-400" /> Add Property Asset</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-xs text-slate-300 mb-1">Street Address *</label>
          <input v-model="form.address" type="text" required placeholder="123 Pueblo Blvd" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-300 mb-1">City</label>
            <input v-model="form.city" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label class="block text-xs text-slate-300 mb-1">County</label>
            <input v-model="form.county" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
        </div>
        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="block text-xs text-slate-300 mb-1">Beds</label>
            <input v-model="form.beds" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label class="block text-xs text-slate-300 mb-1">Baths</label>
            <input v-model="form.baths" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label class="block text-xs text-slate-300 mb-1">SqFt</label>
            <input v-model="form.sqft" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" @click="emit('close')" class="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
          <button type="submit" class="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Save Property</button>
        </div>
      </form>
    </div>
  </div>
</template>
VUE;

// 2. Buyer Modal
$files['resources/js/Components/BuyerModal.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import { X, Briefcase } from 'lucide-vue-next';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'save']);

const form = ref({ name: '', contact: '', phone: '', buyBox: '', proofOfFunds: 'Verified' });

const handleSubmit = () => {
  emit('save', { ...form.value, id: Date.now() });
  form.value = { name: '', contact: '', phone: '', buyBox: '', proofOfFunds: 'Verified' };
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2"><Briefcase class="w-5 h-5 text-indigo-400" /> Add Cash Buyer</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-xs text-slate-300 mb-1">Company / Entity Name *</label>
          <input v-model="form.name" type="text" required placeholder="Apex Capital" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-300 mb-1">Contact Name</label>
            <input v-model="form.contact" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label class="block text-xs text-slate-300 mb-1">Phone</label>
            <input v-model="form.phone" type="text" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
        </div>
        <div>
          <label class="block text-xs text-slate-300 mb-1">Buy Box Criteria</label>
          <input v-model="form.buyBox" type="text" placeholder="e.g. Fix & Flip, Pueblo CO, Under $200k" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div class="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" @click="emit('close')" class="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
          <button type="submit" class="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Save Cash Buyer</button>
        </div>
      </form>
    </div>
  </div>
</template>
VUE;

// 3. Update Properties Index View
$files['resources/js/Pages/Properties/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import PropertyModal from '@/Components/PropertyModal.vue';
import { Building2, Plus, MapPin } from 'lucide-vue-next';

const isModalOpen = ref(false);
const properties = ref([
  { id: 1, address: '123 Pueblo Blvd', city: 'Pueblo', state: 'CO', zip: '81005', county: 'Pueblo', beds: 3, baths: 2, sqft: 1450, taxValue: '$182,000' },
  { id: 2, address: '456 Main St', city: 'Pueblo', state: 'CO', zip: '81003', county: 'Pueblo', beds: 2, baths: 1, sqft: 980, taxValue: '$120,500' },
]);

const handleSave = (item) => properties.value.unshift(item);
</script>

<template>
  <MainLayout title="Properties & Assets">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><Building2 class="w-5 h-5 text-indigo-400" /> Property Asset Directory</h2>
          <p class="text-slate-400 text-sm">Targeted properties and tax assessor records.</p>
        </div>
        <button @click="isModalOpen = true" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"><Plus class="w-4 h-4" /> Add Property</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="prop in properties" :key="prop.id" class="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-white">{{ prop.address }}</h3>
              <p class="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><MapPin class="w-3 h-3" /> {{ prop.city }}, {{ prop.state }} {{ prop.zip }}</p>
            </div>
            <span class="text-xs bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded font-mono">{{ prop.county }} Co.</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-300 pt-3 border-t border-slate-800">
            <span>{{ prop.beds }} Bed / {{ prop.baths }} Bath</span>
            <span>{{ prop.sqft }} SqFt</span>
            <span class="font-mono text-emerald-400">Assessed: {{ prop.taxValue || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <PropertyModal :isOpen="isModalOpen" @close="isModalOpen = false" @save="handleSave" />
    </div>
  </MainLayout>
</template>
VUE;

// 4. Update Buyers Index View
$files['resources/js/Pages/Buyers/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import BuyerModal from '@/Components/BuyerModal.vue';
import { Briefcase, Plus } from 'lucide-vue-next';

const isModalOpen = ref(false);
const buyers = ref([
  { id: 1, name: 'Apex Capital Holdings', contact: 'Mark Davis', phone: '(719) 555-4000', buyBox: 'Fix & Flip, Pueblo CO, Under $200k', proofOfFunds: 'Verified' },
]);

const handleSave = (item) => buyers.value.unshift(item);
</script>

<template>
  <MainLayout title="Cash Buyers">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><Briefcase class="w-5 h-5 text-indigo-400" /> Cash Buyers List</h2>
          <p class="text-slate-400 text-sm">VIP dispo buyers and target criteria.</p>
        </div>
        <button @click="isModalOpen = true" class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 cursor-pointer"><Plus class="w-4 h-4" /> Add Cash Buyer</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="b in buyers" :key="b.id" class="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-bold text-white">{{ b.name }}</h3>
              <p class="text-xs text-slate-400">Contact: {{ b.contact }}</p>
            </div>
            <span class="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-medium">{{ b.proofOfFunds }}</span>
          </div>
          <div class="text-xs bg-slate-950 p-2.5 rounded border border-slate-800">
            <span class="text-slate-400 font-medium">Buy Box:</span> <span class="text-slate-200">{{ b.buyBox }}</span>
          </div>
        </div>
      </div>

      <BuyerModal :isOpen="isModalOpen" @close="isModalOpen = false" @save="handleSave" />
    </div>
  </MainLayout>
</template>
VUE;

foreach ($files as $relativePath => $content) {
    $fullPath = __DIR__ . '/' . $relativePath;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($fullPath, $content);
    echo "Updated/Created: {$fullPath}\n";
}
echo "\nAll modals and interactive views updated!\n";
