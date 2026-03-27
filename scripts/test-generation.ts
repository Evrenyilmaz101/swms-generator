// AI Output Quality Test Script
// Run with: npx tsx scripts/test-generation.ts
//
// Tests the SWMS generation pipeline with diverse job descriptions
// across different trades and states to validate output quality.

import { config } from "dotenv";
config({ path: ".env.local", override: true });
import { generateSwms } from "../src/lib/ai/generate-swms";
import type { AustralianState } from "../src/types/swms";

interface TestCase {
  name: string;
  job_description: string;
  state: AustralianState;
  site_address?: string;
  principal_contractor?: string;
  expected_hrcw_ids?: number[];
}

const TEST_CASES: TestCase[] = [
  {
    name: "Electrician - Switchboard upgrade (NSW)",
    job_description:
      "Upgrading a main switchboard from single phase to three phase in a commercial office building in Parramatta. Work involves isolating existing supply, removing old switchboard, installing new three-phase switchboard, running new submains, and reconnecting circuits.",
    state: "NSW",
    site_address: "45 George St, Parramatta NSW 2150",
    expected_hrcw_ids: [7],
  },
  {
    name: "Roofer - Roof replacement (VIC)",
    job_description:
      "Replacing corrugated iron roofing on a two-story residential house in Melbourne. Removing old sheets, installing new Colorbond roofing, replacing gutters and fascia. Working at 6-7 metre height. Using a boom lift for access.",
    state: "VIC",
    site_address: "12 Smith Rd, Brunswick VIC 3056",
    principal_contractor: "HomeBuilt Construction Pty Ltd",
    expected_hrcw_ids: [1, 11],
  },
  {
    name: "Excavation - Trench for stormwater (WA)",
    job_description:
      "Excavating a 2.5 metre deep trench for stormwater drainage pipe installation on a new residential subdivision in Perth. Using a 5-tonne excavator. Trench is 30 metres long, running parallel to a live road. Underground power and Telstra services are within 3 metres.",
    state: "WA",
    site_address: "Lot 45, Sunflower Drive, Baldivis WA 6171",
    expected_hrcw_ids: [19, 11, 10, 7],
  },
  {
    name: "Painter - Interior repaint (QLD)",
    job_description:
      "Repainting interior walls and ceilings of a single-story house in Brisbane. Preparing surfaces, patching holes, applying primer and two coats of water-based paint. All work at ground level using step ladders only.",
    state: "QLD",
    site_address: "8 Palm St, Annerley QLD 4103",
  },
  {
    name: "Concreter - Slab pour (SA)",
    job_description:
      "Pouring a 120 square metre concrete slab for a new residential garage in Adelaide. Setting up formwork, laying mesh reinforcement, coordinating concrete pump and agitator truck delivery, pouring and finishing slab.",
    state: "SA",
    expected_hrcw_ids: [11],
  },
  {
    name: "Welder - Structural steel at height (NT)",
    job_description:
      "Welding structural steel connections on a commercial warehouse frame in Darwin. Working at heights of 4-6 metres from an elevated work platform. MIG welding on RHS steel columns and beams. Hot work permit required.",
    state: "NT",
    expected_hrcw_ids: [1, 8, 11],
  },
  {
    name: "Plumber - Gas hot water install (VIC)",
    job_description:
      "Installing a new gas continuous flow hot water system on the external wall of a two-story house in Geelong. Disconnecting old electric storage unit, running new gas pipe from meter to unit, installing flue, connecting water lines, and commissioning.",
    state: "VIC",
    expected_hrcw_ids: [5],
  },
  {
    name: "Confined space - Sewer inspection (NSW)",
    job_description:
      "Entering a sewer maintenance hole 3.5 metres deep to inspect and repair a damaged PVC junction. Requires atmospheric monitoring, forced ventilation, tripod and winch for entry/exit. Two workers in team — one entrant, one standby person.",
    state: "NSW",
    expected_hrcw_ids: [18, 19],
  },
];

async function runTests() {
  console.log("=".repeat(80));
  console.log("SWMS AI GENERATION QUALITY TEST");
  console.log("=".repeat(80));
  console.log(`Running ${TEST_CASES.length} test cases...\n`);

  let passed = 0;
  let failed = 0;

  for (const testCase of TEST_CASES) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`TEST: ${testCase.name}`);
    console.log(`${"─".repeat(60)}`);

    const startTime = Date.now();

    const result = await generateSwms({
      job_description: testCase.job_description,
      state: testCase.state,
      site_address: testCase.site_address,
      principal_contractor: testCase.principal_contractor,
    });

    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    if (!result.success) {
      console.log(`  FAILED (${duration}s): ${result.error}`);
      if (result.details) {
        result.details.forEach((d) => console.log(`    - ${d}`));
      }
      failed++;
      continue;
    }

    const { data, compliance_score, validation_warnings } = result;

    console.log(`  Time: ${duration}s`);
    console.log(`  Compliance Score: ${compliance_score}/100`);
    console.log(`  Steps: ${data.steps.length}`);
    console.log(`  HRCW Activities: ${data.hrcw_activities.length}`);
    console.log(`  PPE Items: ${data.ppe_requirements.length}`);
    console.log(`  Emergency Procedures: ${data.emergency_procedures.length}`);
    console.log(
      `  Toolbox Talk Length: ${data.toolbox_talk.length} chars`
    );

    if (validation_warnings.length > 0) {
      console.log(`  Warnings (${validation_warnings.length}):`);
      validation_warnings.forEach((w) => console.log(`    ⚠ ${w}`));
    }

    // Check scope
    console.log(`  Scope: ${data.scope_of_work.substring(0, 100)}...`);

    // Check toolbox talk tone
    const talkPreview = data.toolbox_talk.substring(0, 150);
    console.log(`  Toolbox Talk: "${talkPreview}..."`);

    // Check legislation
    const hasCorrectLeg = data.legislation_references.some((ref) => {
      if (testCase.state === "VIC")
        return ref.includes("Occupational Health and Safety Act 2004");
      if (testCase.state === "WA")
        return ref.includes("Work Health and Safety Act 2020");
      return ref.includes("Work Health and Safety Act 201");
    });
    console.log(
      `  Correct Legislation: ${hasCorrectLeg ? "YES" : "NO ← CHECK THIS"}`
    );

    if (compliance_score >= 70) {
      console.log(`  RESULT: PASSED`);
      passed++;
    } else {
      console.log(`  RESULT: NEEDS IMPROVEMENT (score < 70)`);
      failed++;
    }
  }

  console.log(`\n${"=".repeat(80)}`);
  console.log(`SUMMARY: ${passed} passed, ${failed} failed out of ${TEST_CASES.length} tests`);
  console.log(`${"=".repeat(80)}`);
}

runTests().catch(console.error);
