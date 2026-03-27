// Quick test - just 2 cases to verify the pipeline works
import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { generateSwms } from "../src/lib/ai/generate-swms";

async function quickTest() {
  console.log("Quick test: Electrician in NSW...\n");
  const start = Date.now();
  
  const result = await generateSwms({
    job_description: "Upgrading a main switchboard from single phase to three phase in a commercial office building in Parramatta. Work involves isolating existing supply, removing old switchboard, installing new three-phase switchboard, running new submains, and reconnecting circuits.",
    state: "NSW",
    site_address: "45 George St, Parramatta NSW 2150",
  });

  const duration = ((Date.now() - start) / 1000).toFixed(1);

  if (!result.success) {
    console.log("FAILED:", result.error);
    if (result.details) result.details.forEach(d => console.log("  -", d));
    return;
  }

  console.log(`Done in ${duration}s`);
  console.log(`Compliance Score: ${result.compliance_score}/100`);
  console.log(`Steps: ${result.data.steps.length}`);
  console.log(`HRCW: ${result.data.hrcw_activities.join("; ")}`);
  console.log(`PPE: ${result.data.ppe_requirements.join(", ")}`);
  console.log(`\nScope: ${result.data.scope_of_work}\n`);
  console.log(`Toolbox Talk (first 300 chars):\n${result.data.toolbox_talk.substring(0, 300)}...\n`);
  
  if (result.validation_warnings.length > 0) {
    console.log(`Warnings:`);
    result.validation_warnings.forEach(w => console.log(`  ⚠ ${w}`));
  }
  
  // Print first 2 steps in detail
  console.log("\n--- First 2 Steps Detail ---");
  for (const step of result.data.steps.slice(0, 2)) {
    console.log(`\nStep ${step.step_number}: ${step.activity}`);
    console.log(`  Hazards: ${step.hazards.join("; ")}`);
    console.log(`  Initial Risk: ${step.initial_risk.likelihood}/${step.initial_risk.consequence} = ${step.initial_risk.rating}`);
    console.log(`  Controls: ${step.controls.join("; ")}`);
    console.log(`  Residual Risk: ${step.residual_risk.likelihood}/${step.residual_risk.consequence} = ${step.residual_risk.rating}`);
    console.log(`  Responsible: ${step.responsible}`);
  }
  
  console.log(`\nLegislation refs:`);
  result.data.legislation_references.forEach(r => console.log(`  - ${r}`));
}

quickTest().catch(console.error);
