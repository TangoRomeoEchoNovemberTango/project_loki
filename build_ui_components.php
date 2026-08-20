<?php

$components = [];

// 1. Add Lead Modal
$components['AddLeadModal.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import { X, Building2, User, DollarSign, MapPin } from 'lucide-vue-next';

const props = defineProps({
  isOpen: Boolean,
});

const emit = defineEmits(['close', 'save']);

const form = ref({
  address: '',
  city: 'Pueblo',
  state: 'CO',
  sellerName: '',
  phone: '',
  arv: '',
  askingPrice: '',
  status: 'new'
});

const handleClose = () => emit('close');
const handleSubmit = () => {
  emit('save', { ...form.value, id: Date.now(), updatedAt: 'Just now' });
  form.value = { address: '', city: 'Pueblo', state: 'CO', sellerName: '', phone: '', arv: '', askingPrice: '', status: 'new' };
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
      <div class="px-6 py-4 border-b border-slate-800 flex justify-between items-center">
        <h3 class="text-lg font-bold text-white flex items-center gap-2">
          <Building2 class="w-5 h-5 text-amber-500" />
          Add Off-Market Lead
        </h3>
        <button @click="handleClose" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
      </div>

      <form @submit.prevent="handleSubmit" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1">Property Address *</label>
          <input v-model="form.address" type="text" required placeholder="123 Pueblo Blvd" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Seller Name</label>
            <input v-model="form.sellerName" type="text" placeholder="John Doe" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="(719) 555-0192" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Estimated ARV</label>
            <input v-model="form.arv" type="text" placeholder="$250,000" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Seller Asking Price</label>
            <input v-model="form.askingPrice" type="text" placeholder="$140,000" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500" />
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-3 border-t border-slate-800">
          <button type="button" @click="handleClose" class="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium">Cancel</button>
          <button type="submit" class="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-sm transition-colors">Add to Pipeline</button>
        </div>
      </form>
    </div>
  </div>
</template>
VUE;

// 2. Lead Detail Drawer
$components['LeadDetailDrawer.vue'] = <<<'VUE'
<script setup>
import { X, Building2, Phone, DollarSign, Calendar, Tag, ShieldCheck } from 'lucide-vue-next';

defineProps({
  isOpen: Boolean,
  lead: Object
});

const emit = defineEmits(['close']);
</script>

<template>
  <div v-if="isOpen && lead" class="fixed inset-0 z-50 overflow-hidden bg-slate-950/60 backdrop-blur-xs">
    <div class="absolute inset-y-0 right-0 max-w-full flex pl-10">
      <div class="w-screen max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between shadow-2xl">
        <div class="space-y-6 overflow-y-auto">
          <div class="flex justify-between items-center border-b border-slate-800 pb-4">
            <div>
              <span class="text-xs bg-amber-500/10 text-amber-400 font-extrabold px-2 py-0.5 rounded border border-amber-500/20 uppercase">Lead Overview</span>
              <h2 class="text-xl font-bold text-white mt-1">{{ lead.address }}</h2>
              <p class="text-xs text-slate-400">{{ lead.city }}</p>
            </div>
            <button @click="emit('close')" class="text-slate-400 hover:text-white"><X class="w-6 h-6" /></button>
          </div>

          <div class="space-y-4">
            <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <span class="text-xs text-slate-400 uppercase font-bold">Seller Information</span>
              <p class="text-sm font-semibold text-white">{{ lead.seller || 'N/A' }}</p>
              <p class="text-xs text-indigo-400 font-mono">{{ lead.phone || 'No phone recorded' }}</p>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Target ARV</span>
                <p class="text-lg font-black text-emerald-400 font-mono">{{ lead.arv || '$0' }}</p>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span class="text-[10px] text-slate-400 uppercase font-bold">Pipeline Stage</span>
                <p class="text-sm font-bold text-amber-400 uppercase mt-1">{{ lead.status }}</p>
              </div>
            </div>
          </div>
        </div>

        <button @click="emit('close')" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors mt-4">
          Close Panel
        </button>
      </div>
    </div>
  </div>
</template>
VUE;

// 3. Contact Modal
$components['ContactModal.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import { X, User } from 'lucide-vue-next';

defineProps({ isOpen: Boolean });
const emit = defineEmits(['close', 'save']);

const form = ref({ name: '', phone: '', email: '', type: 'Motivated Seller', address: '' });

const handleSubmit = () => {
  emit('save', { ...form.value, id: Date.now() });
  form.value = { name: '', phone: '', email: '', type: 'Motivated Seller', address: '' };
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4">
      <div class="flex justify-between items-center border-b border-slate-800 pb-3">
        <h3 class="text-lg font-bold text-white flex items-center gap-2"><User class="w-5 h-5 text-indigo-400" /> Add Contact</h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-white"><X class="w-5 h-5" /></button>
      </div>
      <form @submit.prevent="handleSubmit" class="space-y-3">
        <div>
          <label class="block text-xs text-slate-300 mb-1">Full Name *</label>
          <input v-model="form.name" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs text-slate-300 mb-1">Phone *</label>
            <input v-model="form.phone" type="text" required class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label class="block text-xs text-slate-300 mb-1">Type</label>
            <select v-model="form.type" class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white">
              <option>Motivated Seller</option>
              <option>Absentee Owner</option>
              <option>Cash Buyer</option>
            </select>
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" @click="emit('close')" class="px-3 py-1.5 text-xs text-slate-400">Cancel</button>
          <button type="submit" class="bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg">Save Contact</button>
        </div>
      </form>
    </div>
  </div>
</template>
VUE;

$baseDir = __DIR__ . '/resources/js/Components/';

foreach ($components as $filename => $content) {
    $fullPath = $baseDir . $filename;
    file_put_contents($fullPath, $content);
    echo "Component Created: {$fullPath}\n";
}

echo "\nUI Components generated successfully!\n";
