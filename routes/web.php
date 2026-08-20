<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});


Route::get('/dealflow', function () {
    return Inertia::render('DealFlow/App');
})->middleware('auth');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

/*
|--------------------------------------------------------------------------
| 🧪 Component Lab — dev-only visual workbench
|--------------------------------------------------------------------------
| Standalone preview bench for sub-components at /lab/<slug>.
| Lets you inspect & tweak each extracted piece in isolation BEFORE
| wiring it into the real modals. Local environment only — never ships.
*/
if (app()->environment('local')) {
    Route::get('/lab/{component?}', function (string $component = 'combobox') {
        return Inertia::render('Lab', ['component' => $component]);
    })->middleware('auth');
}

require __DIR__ . '/auth.php';
