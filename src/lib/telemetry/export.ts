import { ShotRecord, SessionStats } from "./types";

export function exportToJSON(shots: ShotRecord[], filename: string = "telemetry_data.json") {
    const data = JSON.stringify(shots, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function exportToCSV(shots: ShotRecord[], filename: string = "telemetry_data.csv") {
    if (shots.length === 0) return;

    // Define headers
    const headers = [
        "id",
        "timestamp",
        "modeId",
        "stageId",
        "maxHeight",
        "range",
        "flightTime",
        "impactSpeed",
        "impactAngle",
        "hit",
        "score",
        "initialSpeed",
        "initialAngle",
        "gravity"
    ];

    // Map shots to rows
    const rows = shots.map(shot => {
        return [
            shot.id,
            new Date(shot.timestamp).toISOString(),
            shot.modeId,
            shot.stageId,
            shot.maxHeight.toFixed(4),
            shot.range.toFixed(4),
            shot.flightTime.toFixed(4),
            shot.impactSpeed.toFixed(4),
            shot.impactAngle.toFixed(4),
            shot.hit ? "true" : "false",
            shot.score,
            // Extract initial params
            Math.sqrt(shot.params.initialVelocity.x ** 2 + shot.params.initialVelocity.y ** 2).toFixed(4),
            (Math.atan2(shot.params.initialVelocity.y, shot.params.initialVelocity.x) * 180 / Math.PI).toFixed(4),
            Math.abs(shot.params.gravity.y).toFixed(4)
        ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
