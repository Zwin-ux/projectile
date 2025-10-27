import Link from 'next/link';

export default function TheoryPage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors mb-8"
        >
          ← Back to Simulator
        </Link>

        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Theory & Mathematics</h1>
          <p className="text-lg text-neutral-400">
            Understanding the physics behind projectile motion
          </p>
        </header>

        {/* Model Assumptions */}
        <section className="mb-12 bg-neutral-950 rounded-xl border border-neutral-800 p-8">
          <h2 className="text-2xl font-semibold mb-6">Model Assumptions</h2>
          <div className="space-y-4 text-neutral-300">
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-mono text-lg">•</span>
              <div>
                <strong className="text-neutral-100">No Air Resistance:</strong>
                <p className="text-sm text-neutral-400 mt-1">
                  The projectile moves through an ideal vacuum with no drag forces acting upon it.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-mono text-lg">•</span>
              <div>
                <strong className="text-neutral-100">Constant Gravity:</strong>
                <p className="text-sm text-neutral-400 mt-1">
                  Gravitational acceleration remains constant throughout the flight, regardless of altitude.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-mono text-lg">•</span>
              <div>
                <strong className="text-neutral-100">Point Mass:</strong>
                <p className="text-sm text-neutral-400 mt-1">
                  The projectile is treated as a point particle with no rotation or dimensions.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-blue-400 font-mono text-lg">•</span>
              <div>
                <strong className="text-neutral-100">Flat Earth:</strong>
                <p className="text-sm text-neutral-400 mt-1">
                  The curvature of the Earth is negligible for the distances considered.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Core Equations */}
        <section className="mb-12 bg-neutral-950 rounded-xl border border-neutral-800 p-8">
          <h2 className="text-2xl font-semibold mb-6">Core Equations</h2>

          <div className="space-y-8">
            {/* Initial Velocity Components */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Initial Velocity Components</h3>
              <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-2">
                <div>vₓ = v · cos(θ)</div>
                <div>vᵧ = v · sin(θ)</div>
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                Where v is the initial speed and θ is the launch angle from horizontal.
              </p>
            </div>

            {/* Position Equations */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Position as a Function of Time</h3>
              <div className="bg-black rounded-lg p-4 font-mono text-sm space-y-2">
                <div>x(t) = v · cos(θ) · t</div>
                <div>y(t) = v · sin(θ) · t − (1/2) · g · t²</div>
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                The horizontal position increases linearly with time, while the vertical position follows a parabolic path due to gravity.
              </p>
            </div>

            {/* Time of Flight */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Time of Flight</h3>
              <div className="bg-black rounded-lg p-4 font-mono text-sm">
                T = (2 · v · sin(θ)) / g
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                The total time the projectile spends in the air before returning to ground level.
              </p>
            </div>

            {/* Range */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Range (Horizontal Distance)</h3>
              <div className="bg-black rounded-lg p-4 font-mono text-sm">
                R = (v² · sin(2θ)) / g
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                The horizontal distance traveled when the projectile returns to its initial height. Maximum range occurs at 45°.
              </p>
            </div>

            {/* Maximum Height */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Maximum Height</h3>
              <div className="bg-black rounded-lg p-4 font-mono text-sm">
                H = (v² · sin²(θ)) / (2g)
              </div>
              <p className="text-sm text-neutral-400 mt-2">
                The maximum vertical displacement reached at the apex of the trajectory, where vertical velocity equals zero.
              </p>
            </div>
          </div>
        </section>

        {/* Derivation Notes */}
        <section className="mb-12 bg-neutral-950 rounded-xl border border-neutral-800 p-8">
          <h2 className="text-2xl font-semibold mb-6">Key Insights</h2>
          <div className="space-y-4 text-neutral-300 text-sm">
            <p>
              <strong className="text-neutral-100">Independence of Motion:</strong> The horizontal and vertical motions are independent. The horizontal motion has constant velocity, while the vertical motion is uniformly accelerated.
            </p>
            <p>
              <strong className="text-neutral-100">Symmetry:</strong> The trajectory is symmetric about the vertical line through the maximum height. The angle of impact equals the angle of launch.
            </p>
            <p>
              <strong className="text-neutral-100">Parabolic Path:</strong> The trajectory follows a parabolic curve described by y = x · tan(θ) − (g · x²) / (2v² · cos²(θ))
            </p>
            <p>
              <strong className="text-neutral-100">Energy Conservation:</strong> In the absence of air resistance, mechanical energy is conserved throughout the flight.
            </p>
          </div>
        </section>

        {/* Back Link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Return to Interactive Simulator
          </Link>
        </div>
      </div>
    </div>
  );
}
