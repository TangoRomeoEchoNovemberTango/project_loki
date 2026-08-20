<?php

$pages = [
    'Properties' => [
        'title' => 'Properties & Assets',
        'desc'  => 'Property records, tax data, and saved assets.',
    ],
    'CallLog' => [
        'title' => 'Internal Call Log Hub',
        'desc'  => 'Log seller calls, note dispositions, and review past logs.',
    ],
    'Territories' => [
        'title' => 'My Territories',
        'desc'  => 'Manage county target zones, zip codes, and market lists.',
    ],
    'Contacts' => [
        'title' => 'Contacts & Sellers',
        'desc'  => 'Seller contacts, skip-traced phone numbers, and addresses.',
    ],
    'TitleCompanies' => [
        'title' => 'Title & Escrow Companies',
        'desc'  => 'Investor-friendly title reps, escrow officers, and status updates.',
    ],
    'Valuation' => [
        'title' => 'Valuation & MAO Calculator',
        'desc'  => 'Calculate ARV, repair estimates, and Maximum Allowable Offers.',
    ],
    'FollowUps' => [
        'title' => 'Follow-up Tasks',
        'desc'  => 'Scheduled callbacks, seller reminders, and pending tasks.',
    ],
    'Buyers' => [
        'title' => 'Dispo & Cash Buyers',
        'desc'  => 'Cash buyers list, criteria matching, and assignment contract tracking.',
    ],
    'Analytics' => [
        'title' => 'Deal Analytics',
        'desc'  => 'Call metrics, lead conversions, and projected wholesale fees.',
    ],
];

$baseDir = __DIR__ . '/resources/js/Pages/';

foreach ($pages as $folder => $info) {
    $dir = $baseDir . $folder;

    if (!is_dir($dir)) {
        mkdir($dir, 0755, true);
    }

    $filePath = $dir . '/Index.vue';

    $content = <<<VUE
<script setup>
import MainLayout from '@/Layouts/MainLayout.vue';
</script>

<template>
  <MainLayout>
    <div class="p-6">
      <h1 class="text-xl font-bold text-white mb-2">{$info['title']}</h1>
      <p class="text-slate-400 text-sm">{$info['desc']}</p>
    </div>
  </MainLayout>
</template>
VUE;

    file_put_contents($filePath, $content);
    echo "Created: {$filePath}\n";
}

echo "\nAll Vue stub files created successfully!\n";
