<?php

$root = __DIR__;

function ensureExactFileName(string $dir, string $desired): void
{
    if (!is_dir($dir)) {
        return;
    }

    $actual = null;

    foreach (scandir($dir) as $file) {
        if ($file === '.' || $file === '..') {
            continue;
        }

        if (strtolower($file) === strtolower($desired)) {
            $actual = $file;
            break;
        }
    }

    if ($actual === null || $actual === $desired) {
        return;
    }

    $tmp = $dir . '/' . uniqid('tmp_', true) . '.ts';

    rename($dir . '/' . $actual, $tmp);
    rename($tmp, $dir . '/' . $desired);

    echo "Renamed {$dir}/{$actual} to {$dir}/{$desired}" . PHP_EOL;
}

function fixContent(string $content): string
{
    $content = strtr($content, [
        "from './components/" => "from './",
        "from './types'" => "from '@/types/dealflow'",
        "from '../types'" => "from '@/types/dealflow'",
        "from '../../types'" => "from '@/types/dealflow'",

        "from './services/api'" => "from '@/services/dealflow'",
        "from '../services/api'" => "from '@/services/dealflow'",
        "from '../../services/api'" => "from '@/services/dealflow'",

        "from './utils/exportUtils'" => "from '@/utils/exportUtils'",
        "from '../utils/exportUtils'" => "from '@/utils/exportUtils'",
        "from '../../utils/exportUtils'" => "from '@/utils/exportUtils'",
    ]);

    // Fix: useState <Lead[] >([])
    $content = preg_replace_callback(
        '/useState\s*<\s*([^>]+?)\s*>/',
        function ($matches) {
            return 'useState<' . trim($matches[1]) . '>';
        },
        $content
    );

    // Make type imports type-only.
    $content = preg_replace(
        '#import\s*\{([^}]*?)\}\s*from\s*[\'"]@/types/dealflow[\'"]\s*;?#s',
        'import type {$1} from \'@/types/dealflow\';',
        $content
    );

    // Fix DealFlowApp CallLog handler.
    $newUpdateCallLog = <<<'JS'
const handleUpdateCallLog = async (updatedCallLog: CallLog) => {
    const saved = await updateCallLog(updatedCallLog.id, updatedCallLog);

    setCallLogs((prev) =>
        prev.map((c) => (c.id === saved.id ? saved : c)),
    );
};
JS;

    $content = preg_replace(
        '#const handleUpdateCallLog\s*=\s*async\s*\(id:\s*string,\s*callData:\s*Partial<CallLog>\)\s*=>\s*\{.*?\};#s',
        $newUpdateCallLog,
        $content,
        1
    );

    // Fix DealFlowApp saveLead handler.
    $newSaveLead = <<<'JS'
const handleSaveLead = async (leadData: Partial<Lead>): Promise<void> => {
    const created = await createLead(leadData);

    setLeads((prev) => [created, ...prev]);
};
JS;

    $content = preg_replace(
        '#const handleSaveLead\s*=\s*async\s*\(leadData:\s*Partial<Lead>\):\s*Promise<Lead>\s*=>\s*\{.*?\};#s',
        $newSaveLead,
        $content,
        1
    );

    // Fix unknown ReactNode issue.
    $content = str_replace('{stage.desc}', '{String(stage.desc)}', $content);

    // Silence remaining implicit-any map/callback errors.
    $content = str_replace('(note, idx) =>', '(note: any, idx: number) =>', $content);
    $content = str_replace('(imgUrl, idx) =>', '(imgUrl: any, idx: number) =>', $content);
    $content = str_replace('(fileItem) =>', '(fileItem: any) =>', $content);
    $content = str_replace('(tag, idx) =>', '(tag: any, idx: number) =>', $content);
    $content = str_replace('(s) => s.name', '(s: any) => s.name', $content);
    $content = str_replace('(att) =>', '(att: any) =>', $content);
    $content = str_replace('setNotes((prev) =>', 'setNotes((prev: any) =>', $content);

    $content = str_replace(
        '(c) => c.toLowerCase() === l.city?.toLowerCase()',
        '(c: any) => c.toLowerCase() === l.city?.toLowerCase()',
        $content
    );

    $content = str_replace(
        'countiesOrCities.some((c) =>',
        'countiesOrCities.some((c: any) =>',
        $content
    );

    $content = str_replace(
        'targetZipCodes.some((z) =>',
        'targetZipCodes.some((z: any) =>',
        $content
    );

    $content = str_replace(
        'zipCodes.some((z) => z.includes(searchQuery))',
        'zipCodes.some((z: any) => z.includes(searchQuery))',
        $content
    );

    $content = str_replace(
        'countiesOrCities.map((city) =>',
        'countiesOrCities.map((city: any) =>',
        $content
    );

    $content = str_replace(
        'zipCodes.map((zip) =>',
        'zipCodes.map((zip: any) =>',
        $content
    );

    return $content;
}

function fixFile(string $path): void
{
    $original = file_get_contents($path);

    if ($original === false) {
        return;
    }

    $fixed = fixContent($original);

    if (basename($path) === 'DealFlowApp.tsx') {
        $fixed = str_replace(
            'export default function App()',
            'export default function DealFlowApp()',
            $fixed
        );
    }

    if ($fixed !== $original) {
        file_put_contents($path, $fixed);
        echo "Fixed {$path}" . PHP_EOL;
    }
}

// Fix casing.
ensureExactFileName($root . '/resources/js/types', 'dealflow.ts');
ensureExactFileName($root . '/resources/js/services', 'dealflow.ts');

$directories = [
    $root . '/resources/js/Components/DealFlow',
    $root . '/resources/js/services',
];

foreach ($directories as $directory) {
    if (!is_dir($directory)) {
        continue;
    }

    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, FilesystemIterator::SKIP_DOTS)
    );

    foreach ($iterator as $file) {
        if (!$file->isFile()) {
            continue;
        }

        $extension = strtolower($file->getExtension());

        if (!in_array($extension, ['ts', 'tsx'], true)) {
            continue;
        }

        fixFile($file->getPathname());
    }
}

echo PHP_EOL . 'Done. Run: npm run build' . PHP_EOL;
