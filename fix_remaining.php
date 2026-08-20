<?php

$root = __DIR__;

$typesPath = $root . '/resources/js/types/dealflow.ts';

if (is_file($typesPath)) {
    $c = file_get_contents($typesPath);

    // Fix MCTP isQualified error.
    $c = str_replace(
        'isQualified: boolean;',
        'isQualified?: boolean;',
        $c
    );

    // Fix missing PropertyValuation fields error.
    $c = preg_replace_callback(
        '/export interface PropertyValuation \{.*?\}/s',
        function ($m) {
            $block = $m[0];

            $block = preg_replace(
                '/\bsqft:\s*number;/',
                'sqft?: number;',
                $block
            );

            $block = preg_replace(
                "#repairLevel:\s*'LIGHT' \| 'MEDIUM' \| 'HEAVY' \| 'CUSTOM';#",
                "repairLevel?: 'LIGHT' | 'MEDIUM' | 'HEAVY' | 'CUSTOM';",
                $block
            );

            $block = preg_replace(
                '/discountRatePercent:\s*number;(.*)$/m',
                'discountRatePercent?: number;$1',
                $block
            );

            $block = preg_replace(
                '/desiredWholesaleFee:\s*number;(.*)$/m',
                'desiredWholesaleFee?: number;$1',
                $block
            );

            return $block;
        },
        $c,
        1
    );

    // Fix missing Lead.buyerDetail and Lead.pipelineType errors.
    if (strpos($c, 'buyerDetail?:') === false) {
        $count = 0;

        $c = preg_replace(
            '/(export interface Lead \{.*?titleDetail\?: TitleCompanyDetail;)/s',
            "$1\n    buyerDetail?: { buyerName?: string };\n    pipelineType?: PipelineType;",
            $c,
            1,
            $count
        );

        if (!$count) {
            $c = preg_replace(
                '/export interface Lead \{/',
                "export interface Lead {\n    buyerDetail?: { buyerName?: string };\n    pipelineType?: PipelineType;",
                $c,
                1
            );
        }
    }

    // Fix missing Buyer.targetMarkets and Buyer.tier errors.
    if (strpos($c, 'targetMarkets?:') === false) {
        $count = 0;

        $c = preg_replace(
            '/(export interface Buyer \{.*?isLandBuyer\?: boolean;)/s',
            "$1\n    targetMarkets?: string[];\n    tier?: string;",
            $c,
            1,
            $count
        );

        if (!$count) {
            $c = preg_replace(
                '/export interface Buyer \{/',
                "export interface Buyer {\n    targetMarkets?: string[];\n    tier?: string;",
                $c,
                1
            );
        }
    }

    file_put_contents($typesPath, $c);

    echo "Fixed {$typesPath}" . PHP_EOL;
}

$callCardPath = $root . '/resources/js/Components/DealFlow/CallLog/CallCard.tsx';

if (is_file($callCardPath)) {
    $c = file_get_contents($callCardPath);

    $c = preg_replace(
        '/setEditOutcome\(e\.target\.value\)/',
        'setEditOutcome(e.target.value as any)',
        $c
    );

    file_put_contents($callCardPath, $c);

    echo "Fixed {$callCardPath}" . PHP_EOL;
}

echo 'Done. Run: npm run build' . PHP_EOL;