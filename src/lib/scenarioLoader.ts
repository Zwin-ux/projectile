import { Scenario, ScenarioTarget } from "./scenarioConfig";
import { ProjectileType } from "@/components/Projectile";

export function validateScenario(json: any): boolean {
    if (!json || typeof json !== 'object') return false;

    // Check required fields
    if (typeof json.id !== 'string') return false;
    if (typeof json.name !== 'string') return false;
    if (typeof json.description !== 'string') return false;

    // Check environment
    if (!json.environment || typeof json.environment.gravity !== 'number') return false;

    // Check targets
    if (!Array.isArray(json.targets) || json.targets.length === 0) return false;

    return true;
}

export function parseScenario(jsonString: string): Scenario | null {
    try {
        const json = JSON.parse(jsonString);
        if (!validateScenario(json)) {
            console.error("Invalid scenario JSON");
            return null;
        }

        // Sanitize and fill defaults
        const scenario: Scenario = {
            id: json.id,
            name: json.name,
            emoji: json.emoji || "🎯",
            description: json.description,
            longDescription: json.longDescription || json.description,
            environment: {
                ground: json.environment.ground || 'grass',
                lighting: json.environment.lighting || 'outdoor',
                groundColor: json.environment.groundColor || "#1a1a1a",
                gravity: json.environment.gravity
            },
            camera: {
                position: json.camera?.position || [0, 5, 10],
                fov: json.camera?.fov || 45,
                lookAt: json.camera?.lookAt || [0, 2, 0]
            },
            launchPoint: {
                height: json.launchPoint?.height || 0,
                description: json.launchPoint?.description || "Custom Launch Point"
            },
            targets: json.targets.map((t: any, i: number) => ({
                id: t.id || i + 1,
                type: t.type || 'static',
                position: t.position || [10, 0, 0],
                distance: t.distance || 10,
                label: t.label || `Target ${i + 1}`
            })),
            defaultPhysics: {
                speed: json.defaultPhysics?.speed || 20,
                angle: json.defaultPhysics?.angle || 45,
                speedRange: json.defaultPhysics?.speedRange || [0, 50],
                angleRange: json.defaultPhysics?.angleRange || [0, 90]
            },
            allowedProjectiles: (json.allowedProjectiles as ProjectileType[]) || ['standard'],
            recommendedProjectile: (json.recommendedProjectile as ProjectileType) || 'standard',
            scoringInfo: json.scoringInfo || "Standard Scoring"
        };

        return scenario;
    } catch (e) {
        console.error("Failed to parse scenario JSON", e);
        return null;
    }
}
