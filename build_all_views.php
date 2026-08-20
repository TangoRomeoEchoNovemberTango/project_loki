<?php

$views = [];

// 1. Valuation & MAO Calculator
$views['Valuation/Index.vue'] = <<<'VUE'
<script setup>
import { ref, computed } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { Calculator, DollarSign, Wrench, ShieldAlert, CheckCircle2 } from 'lucide-vue-next';

const arv = ref(250000);
const repairCost = ref(35000);
const investorDiscount = ref(70); // 70% rule default
const wholesaleFee = ref(10000);

// Formulas
const maoBeforeFee = computed(() => (arv.value * (investorDiscount.value / 100)) - repairCost.value);
const maxAllowableOffer = computed(() => maoBeforeFee.value - wholesaleFee.value);
const estimatedSpread = computed(() => maxAllowableOffer.value > 0 ? wholesaleFee.value : 0);
</script>

<template>
  <MainLayout title="Valuation & MAO Calculator">
    <div class="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2">
          <Calculator class="w-5 h-5 text-indigo-400" />
          70% Rule MAO Calculator
        </h2>
        <p class="text-slate-400 text-sm">Calculate Maximum Allowable Offer and target wholesale assignment fees.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Input Form -->
        <div class="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 class="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-3">Deal Inputs</h3>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">After Repair Value (ARV)</label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input v-model.number="arv" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white font-mono focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Estimated Repairs</label>
            <div class="relative">
              <Wrench class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input v-model.number="repairCost" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white font-mono focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Investor Target Rule (%)</label>
            <input v-model.number="investorDiscount" type="number" step="1" class="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-indigo-500" />
          </div>

          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1">Target Wholesale Fee</label>
            <div class="relative">
              <DollarSign class="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input v-model.number="wholesaleFee" type="number" class="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-white font-mono focus:outline-none focus:border-indigo-500" />
            </div>
          </div>
        </div>

        <!-- Output Results Card -->
        <div class="bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 class="text-sm font-semibold text-indigo-300 border-b border-indigo-500/20 pb-3">Offer Analysis</h3>

            <div class="space-y-4 my-6">
              <div>
                <span class="text-xs text-slate-400">Investor Max Purchase Price</span>
                <p class="text-2xl font-bold font-mono text-slate-200">${{ maoBeforeFee.toLocaleString() }}</p>
              </div>

              <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <span class="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Your Maximum Allowable Offer (MAO)</span>
                <p class="text-3xl font-extrabold font-mono text-emerald-400 mt-1">${{ maxAllowableOffer.toLocaleString() }}</p>
                <p class="text-xs text-slate-400 mt-1">Contract property at or below this price to secure your ${{ wholesaleFee.toLocaleString() }} fee.</p>
              </div>
            </div>
          </div>

          <div class="text-xs text-slate-400 flex items-center gap-2 border-t border-slate-800 pt-4">
            <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Formula: (ARV × {{ investorDiscount }}%) - Repairs - Wholesale Fee</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 2. Properties Directory
$views['Properties/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { Building2, Plus, Search, MapPin, DollarSign, ExternalLink } from 'lucide-vue-next';

const properties = ref([
  { id: 1, address: '123 Pueblo Blvd', city: 'Pueblo', state: 'CO', zip: '81005', county: 'Pueblo', beds: 3, baths: 2, sqft: 1450, taxValue: '$182,000' },
  { id: 2, address: '456 Main St', city: 'Pueblo', state: 'CO', zip: '81003', county: 'Pueblo', beds: 2, baths: 1, sqft: 980, taxValue: '$120,500' },
]);
</script>

<template>
  <MainLayout title="Properties & Assets">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><Building2 class="w-5 h-5 text-indigo-400" /> Property Asset Directory</h2>
          <p class="text-slate-400 text-sm">Targeted properties and tax assessor records.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"><Plus class="w-4 h-4" /> Add Property</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="prop in properties" :key="prop.id" class="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3 hover:border-slate-700 transition-all">
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
            <span class="font-mono text-emerald-400">Assessed: {{ prop.taxValue }}</span>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 3. Contacts Directory
$views['Contacts/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { Users, Plus, Phone, Mail, MapPin } from 'lucide-vue-next';

const contacts = ref([
  { id: 1, name: 'John Doe', phone: '(719) 555-0192', email: 'johndoe@gmail.com', type: 'Motivated Seller', address: '123 Pueblo Blvd' },
  { id: 2, name: 'Sarah Connor', phone: '(719) 555-8821', email: 'sconnor@yahoo.com', type: 'Absentee Owner', address: '789 Northern Ave' },
]);
</script>

<template>
  <MainLayout title="Contacts Directory">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><Users class="w-5 h-5 text-indigo-400" /> Contacts & Sellers</h2>
          <p class="text-slate-400 text-sm">Skip-traced property owners, leads, and sellers.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"><Plus class="w-4 h-4" /> Add Contact</button>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3">Phone & Email</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Property</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="c in contacts" :key="c.id" class="hover:bg-slate-800/50">
              <td class="px-6 py-4 font-semibold text-white">{{ c.name }}</td>
              <td class="px-6 py-4 space-y-1">
                <div class="text-indigo-400 font-mono text-xs flex items-center gap-1"><Phone class="w-3 h-3" /> {{ c.phone }}</div>
                <div class="text-slate-400 text-xs flex items-center gap-1"><Mail class="w-3 h-3" /> {{ c.email }}</div>
              </td>
              <td class="px-6 py-4"><span class="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs border border-slate-700">{{ c.type }}</span></td>
              <td class="px-6 py-4 text-xs text-slate-400">{{ c.address }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 4. Territories
$views['Territories/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { MapPin, Plus, Target, Building } from 'lucide-vue-next';

const territories = ref([
  { id: 1, county: 'Pueblo County', state: 'CO', targetZips: '81001, 81003, 81005', status: 'Active Scraping' },
  { id: 2, county: 'El Paso County', state: 'CO', targetZips: '80903, 80905, 80910', status: 'Researching' },
]);
</script>

<template>
  <MainLayout title="Territories">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><MapPin class="w-5 h-5 text-indigo-400" /> Target Markets</h2>
          <p class="text-slate-400 text-sm">Target counties and zip code lists.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"><Plus class="w-4 h-4" /> Add Territory</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="t in territories" :key="t.id" class="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-3">
          <div class="flex justify-between items-center">
            <h3 class="font-bold text-white flex items-center gap-2"><Target class="w-4 h-4 text-indigo-400" /> {{ t.county }}, {{ t.state }}</h3>
            <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">{{ t.status }}</span>
          </div>
          <p class="text-xs text-slate-400">Target Zip Codes: <span class="font-mono text-slate-200">{{ t.targetZips }}</span></p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 5. Title Companies
$views['TitleCompanies/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { ShieldCheck, Plus, Phone, User, Building2 } from 'lucide-vue-next';

const titleCompanies = ref([
  { id: 1, company: 'Pueblo Title & Escrow', rep: 'Amanda Vance', phone: '(719) 555-9000', email: 'amanda@pueblotitle.com', status: 'Investor Friendly' },
]);
</script>

<template>
  <MainLayout title="Title Companies">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><ShieldCheck class="w-5 h-5 text-indigo-400" /> Title & Escrow Partners</h2>
          <p class="text-slate-400 text-sm">Investor-friendly title companies and assignment closers.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"><Plus class="w-4 h-4" /> Add Title Rep</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div v-for="tc in titleCompanies" :key="tc.id" class="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2">
          <h3 class="font-bold text-white flex items-center gap-2"><Building2 class="w-4 h-4 text-indigo-400" /> {{ tc.company }}</h3>
          <p class="text-xs text-slate-300 flex items-center gap-1"><User class="w-3.5 h-3.5 text-slate-400" /> Rep: {{ tc.rep }}</p>
          <p class="text-xs text-indigo-400 font-mono flex items-center gap-1"><Phone class="w-3.5 h-3.5" /> {{ tc.phone }}</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 6. Follow-ups
$views['FollowUps/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { Calendar, CheckSquare, Clock } from 'lucide-vue-next';

const tasks = ref([
  { id: 1, contact: 'John Doe', task: 'Follow up on counter-offer', dueDate: '2026-08-03', priority: 'High' },
  { id: 2, contact: 'Jane Smith', task: 'Second call after voicemail', dueDate: '2026-08-02', priority: 'Medium' },
]);
</script>

<template>
  <MainLayout title="Follow-up Queue">
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2"><Calendar class="w-5 h-5 text-indigo-400" /> Scheduled Callbacks</h2>
        <p class="text-slate-400 text-sm">Pending reminders and seller follow-ups.</p>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
        <div v-for="t in tasks" :key="t.id" class="p-4 flex justify-between items-center hover:bg-slate-800/40">
          <div class="space-y-1">
            <h4 class="font-semibold text-white text-sm">{{ t.task }}</h4>
            <p class="text-xs text-slate-400">Seller: <span class="text-slate-200">{{ t.contact }}</span></p>
          </div>
          <div class="flex items-center gap-4">
            <span class="text-xs font-mono text-amber-400 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20"><Clock class="w-3.5 h-3.5" /> {{ t.dueDate }}</span>
            <button class="text-slate-400 hover:text-emerald-400"><CheckSquare class="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

// 7. Buyers Directory
$views['Buyers/Index.vue'] = <<<'VUE'
<script setup>
import { ref } from 'vue';
import MainLayout from '@/Layouts/MainLayout.vue';
import { Briefcase, Plus, Phone, DollarSign } from 'lucide-vue-next';

const buyers = ref([
  { id: 1, name: 'Apex Capital Holdings', contact: 'Mark Davis', phone: '(719) 555-4000', buyBox: 'Fix & Flip, Pueblo CO, Under $200k', proofOfFunds: 'Verified' },
]);
</script>

<template>
  <MainLayout title="Cash Buyers">
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-white flex items-center gap-2"><Briefcase class="w-5 h-5 text-indigo-400" /> Cash Buyers List</h2>
          <p class="text-slate-400 text-sm">VIP dispo buyers and target criteria.</p>
        </div>
        <button class="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2"><Plus class="w-4 h-4" /> Add Cash Buyer</button>
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
    </div>
  </MainLayout>
</template>
VUE;

// 8. Analytics
$views['Analytics/Index.vue'] = <<<'VUE'
<script setup>
import MainLayout from '@/Layouts/MainLayout.vue';
import { TrendingUp, PhoneCall, CheckCircle2, DollarSign } from 'lucide-vue-next';
</script>

<template>
  <MainLayout title="Deal Analytics">
    <div class="space-y-6">
      <div>
        <h2 class="text-xl font-bold text-white flex items-center gap-2"><TrendingUp class="w-5 h-5 text-indigo-400" /> Wholesaling Metrics</h2>
        <p class="text-slate-400 text-sm">Call activity, offer conversion rates, and projected fees.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5"><PhoneCall class="w-4 h-4 text-indigo-400" /> Total Calls Logged</span>
          <p class="text-3xl font-extrabold text-white font-mono">142</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5"><CheckCircle2 class="w-4 h-4 text-emerald-400" /> Contracts Executed</span>
          <p class="text-3xl font-extrabold text-emerald-400 font-mono">3</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span class="text-xs text-slate-400 font-medium flex items-center gap-1.5"><DollarSign class="w-4 h-4 text-amber-400" /> Projected Wholesale Fees</span>
          <p class="text-3xl font-extrabold text-amber-400 font-mono">$28,500</p>
        </div>
      </div>
    </div>
  </MainLayout>
</template>
VUE;

$baseDir = __DIR__ . '/resources/js/Pages/';

foreach ($views as $relativePath => $content) {
    $fullPath = $baseDir . $relativePath;
    $dir = dirname($fullPath);
    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }
    file_put_contents($fullPath, $content);
    echo "Built: {$fullPath}\n";
}

echo "\nAll Vue views created successfully!\n";
