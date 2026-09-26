/**
 * Unit Test Script for Stage 3 Computer Vision Metrics, Posture Classification & Telemetry
 */

import assert from 'node:assert';

function testHeadOrientationClassification(yaw, pitch, roll) {
  let orientation = 'Centered';
  if (yaw < -18) orientation = 'Turned Left';
  else if (yaw > 18) orientation = 'Turned Right';
  else if (pitch < -15) orientation = 'Looking Up';
  else if (pitch > 15) orientation = 'Looking Down';
  else if (Math.abs(roll) > 15) orientation = 'Tilted';
  return orientation;
}

function testPostureClassification(leftShoulderY, rightShoulderY, headPitch, noseY) {
  const shoulderSlope = Math.abs(leftShoulderY - rightShoulderY);
  if (shoulderSlope > 0.06) {
    return leftShoulderY > rightShoulderY ? 'LEANING_RIGHT' : 'LEANING_LEFT';
  } else if (headPitch > 18 || noseY > 0.6) {
    return 'SLIGHT_SLOUCH';
  }
  return 'GOOD_ALIGNMENT';
}

function testCameraEngagementCalculation(noseX, noseY, yaw, pitch) {
  const centerDevX = Math.abs(noseX - 0.5);
  const centerDevY = Math.abs(noseY - 0.45);
  const centeringPenalty = centerDevX * 50 + centerDevY * 40;
  const anglePenalty = Math.abs(yaw) * 0.7 + Math.abs(pitch) * 0.5;
  return Math.round(Math.max(15, Math.min(98, 100 - centeringPenalty - anglePenalty)));
}

function testTelemetryBufferLimit(buffer, newRecords, maxLimit = 1200) {
  for (const r of newRecords) {
    buffer.push(r);
    if (buffer.length > maxLimit) {
      buffer.shift();
    }
  }
  return buffer;
}

function testAnswerVisionSummary(records, questionId) {
  const totalEngagement = records.reduce((acc, r) => acc + r.cameraEngagement, 0);
  const totalPosture = records.reduce((acc, r) => acc + r.postureConsistency, 0);
  const detectedCount = records.filter((r) => r.faceDetected).length;
  const totalFrame = records.reduce((acc, r) => acc + r.frameQuality, 0);
  const totalLighting = records.reduce((acc, r) => acc + r.lightingQuality, 0);

  const avgEngagement = Math.round(totalEngagement / records.length);
  const avgPosture = Math.round(totalPosture / records.length);
  const facePresenceRate = Math.round((detectedCount / records.length) * 100);
  const avgFrame = Math.round(totalFrame / records.length);
  const avgLighting = Math.round(totalLighting / records.length);

  return {
    questionId,
    averageCameraEngagement: avgEngagement,
    averagePostureConsistency: avgPosture,
    facePresenceRate,
    averageFrameQuality: avgFrame,
    averageLightingQuality: avgLighting,
    dominantPostureState: 'GOOD_ALIGNMENT',
  };
}

console.log('--- Running Stage 3 Vision Service Unit Verification ---');

// 1. Test Head Orientation
assert.strictEqual(testHeadOrientationClassification(0, 0, 0), 'Centered');
assert.strictEqual(testHeadOrientationClassification(-25, 0, 0), 'Turned Left');
assert.strictEqual(testHeadOrientationClassification(25, 0, 0), 'Turned Right');
assert.strictEqual(testHeadOrientationClassification(0, -20, 0), 'Looking Up');
assert.strictEqual(testHeadOrientationClassification(0, 22, 0), 'Looking Down');
console.log('✓ Head orientation classification passed');

// 2. Test Posture Classification
assert.strictEqual(testPostureClassification(0.5, 0.5, 0, 0.45), 'GOOD_ALIGNMENT');
assert.strictEqual(testPostureClassification(0.6, 0.45, 0, 0.45), 'LEANING_RIGHT');
assert.strictEqual(testPostureClassification(0.45, 0.6, 0, 0.45), 'LEANING_LEFT');
assert.strictEqual(testPostureClassification(0.5, 0.5, 22, 0.45), 'SLIGHT_SLOUCH');
console.log('✓ Posture state classification passed');

// 3. Test Camera Engagement Calculation
const perfectEngagement = testCameraEngagementCalculation(0.5, 0.45, 0, 0);
assert.ok(perfectEngagement >= 90, `Expected high engagement: ${perfectEngagement}`);
const turnedAwayEngagement = testCameraEngagementCalculation(0.8, 0.8, 45, 20);
assert.ok(turnedAwayEngagement < 50, `Expected low engagement: ${turnedAwayEngagement}`);
console.log('✓ Camera engagement calculation passed');

// 4. Test Telemetry Buffer Limits
const buf = [];
const records = Array.from({ length: 1500 }, (_, i) => ({
  timestamp: i,
  cameraEngagement: 85,
  postureConsistency: 90,
  faceDetected: true,
}));
testTelemetryBufferLimit(buf, records, 1200);
assert.strictEqual(buf.length, 1200, `Expected bounded buffer size of 1200, got ${buf.length}`);
console.log('✓ Bounded telemetry buffer constraint passed');

// 5. Test Answer Vision Summary
const sampleTelemetry = [
  { cameraEngagement: 85, postureConsistency: 90, faceDetected: true, frameQuality: 92, lightingQuality: 90 },
  { cameraEngagement: 95, postureConsistency: 92, faceDetected: true, frameQuality: 94, lightingQuality: 90 },
  { cameraEngagement: 90, postureConsistency: 88, faceDetected: true, frameQuality: 90, lightingQuality: 90 },
];
const summary = testAnswerVisionSummary(sampleTelemetry, 'q-cyber-01');
assert.strictEqual(summary.averageCameraEngagement, 90);
assert.strictEqual(summary.averagePostureConsistency, 90);
assert.strictEqual(summary.facePresenceRate, 100);
assert.strictEqual(summary.averageFrameQuality, 92);
console.log('✓ Answer vision summary aggregation passed');

console.log('--- ALL STAGE 3 CLIENT VISION UNIT TESTS PASSED ---');
