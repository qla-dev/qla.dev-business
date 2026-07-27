<?php

declare(strict_types=1);

set_time_limit(0);
ini_set('memory_limit', '512M');
ini_set('output_buffering', '0');
ini_set('zlib.output_compression', '0');

$baseDir = __DIR__;
$passwordFile = $baseDir.DIRECTORY_SEPARATOR.'.redeploy-password';
$expectedPassword = trim((string) (getenv('BUSINESS_REDEPLOY_PASSWORD') ?: ''));

if ($expectedPassword === '' && is_file($passwordFile)) {
    $expectedPassword = trim((string) file_get_contents($passwordFile));
}

if (PHP_SAPI !== 'cli') {
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');
    header('X-Content-Type-Options: nosniff');
    header('X-Accel-Buffering: no');

    if ($expectedPassword === '') {
        http_response_code(503);
        echo "Redeploy is not configured.\n";
        echo "Set BUSINESS_REDEPLOY_PASSWORD or create .redeploy-password in the project root.\n";
        exit;
    }

    $providedPassword = (string) ($_SERVER['PHP_AUTH_PW'] ?? '');

    if (!hash_equals($expectedPassword, $providedPassword)) {
        header('WWW-Authenticate: Basic realm="qla.dev Business redeploy"');
        http_response_code(401);
        echo "Authentication required.\n";
        exit;
    }
}

while (ob_get_level() > 0) {
    ob_end_flush();
}
ob_implicit_flush(true);

$write = static function (string $message): void {
    echo $message;
    flush();
};

$lockFile = sys_get_temp_dir().DIRECTORY_SEPARATOR.'qla-business-redeploy.lock';
$lock = fopen($lockFile, 'c');

if ($lock === false || !flock($lock, LOCK_EX | LOCK_NB)) {
    if (PHP_SAPI !== 'cli') {
        http_response_code(409);
    }
    $write("Another redeploy is already running.\n");
    exit(1);
}

$run = static function (string $command, string $cwd, callable $write): int {
    $process = proc_open(
        $command,
        [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ],
        $pipes,
        $cwd,
    );

    if (!is_resource($process)) {
        $write("Could not start: {$command}\n");
        return 1;
    }

    fclose($pipes[0]);
    stream_set_blocking($pipes[1], false);
    stream_set_blocking($pipes[2], false);
    $exitCode = null;
    $lastOutputAt = time();

    do {
        foreach ([1, 2] as $pipeNumber) {
            while (($line = fgets($pipes[$pipeNumber])) !== false) {
                $lastOutputAt = time();
                $write($line);
            }
        }

        $status = proc_get_status($process);
        if (!$status['running']) {
            $exitCode = $status['exitcode'];
            break;
        }

        if (time() - $lastOutputAt >= 15) {
            $lastOutputAt = time();
            $write('... still running at '.date('H:i:s')."\n");
        }

        usleep(100000);
    } while (true);

    foreach ([1, 2] as $pipeNumber) {
        while (($line = fgets($pipes[$pipeNumber])) !== false) {
            $write($line);
        }
        fclose($pipes[$pipeNumber]);
    }

    $closeCode = proc_close($process);
    return is_int($exitCode) && $exitCode >= 0 ? $exitCode : $closeCode;
};

$commands = [
    ['label' => 'Pulling latest code', 'command' => 'git pull --ff-only'],
    ['label' => 'Installing dependencies', 'command' => 'npm ci --no-audit --no-fund'],
    ['label' => 'Building production site', 'command' => 'npm run build'],
];

$startedAt = time();

foreach ($commands as $step) {
    $write("\n=== {$step['label']} ===\n");
    $write("Command: {$step['command']}\n");
    $exitCode = $run($step['command'], $baseDir, $write);

    if ($exitCode !== 0) {
        if (PHP_SAPI !== 'cli') {
            http_response_code(500);
        }
        $write("{$step['label']} failed with exit code {$exitCode}.\n");
        exit($exitCode);
    }
}

$write("\nRedeploy completed successfully in ".(time() - $startedAt)."s.\n");
