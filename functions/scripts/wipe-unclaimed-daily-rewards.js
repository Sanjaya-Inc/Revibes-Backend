#!/usr/bin/env node
/**
 * One-shot: set dailyReward to flat +1 and delete unclaimed user_daily_rewards.
 * Claimed rows (claimedAt != null) stay.
 *
 * Usage:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8098 APP_PROJECT_ID=demo-revibes \
 *     node scripts/wipe-unclaimed-daily-rewards.js           # dry-run
 *   ... node scripts/wipe-unclaimed-daily-rewards.js --apply
 */
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "..", ".env") });

const admin = require("firebase-admin");

const APPLY = process.argv.includes("--apply");
const BATCH_SIZE = 400;

const USERS = "users";
const APP_SETTING = "app_settings";
const USER_DAILY_REWARD = "user_daily_rewards";

const FLAT_DAILY_REWARD = {
  days: 7,
  initialPoint: 1,
  multiplier: 0,
};

if (!admin.apps.length) {
  const projectId =
    process.env.APP_PROJECT_ID ||
    process.env.GCLOUD_PROJECT ||
    process.env.GCP_PROJECT ||
    "demo-revibes";
  admin.initializeApp({ projectId });
}

const db = admin.firestore();

async function commitDeletes(refs) {
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const chunk = refs.slice(i, i + BATCH_SIZE);
    const batch = db.batch();
    for (const ref of chunk) {
      batch.delete(ref);
    }
    await batch.commit();
  }
}

async function updateAppSetting() {
  const snap = await db.collection(APP_SETTING).limit(1).get();
  if (snap.empty) {
    console.log("app_settings: empty — will create default with flat +1");
    if (APPLY) {
      await db.collection(APP_SETTING).add({
        point: { organic: 5, "non-organic": 5, b3: 5 },
        dailyReward: FLAT_DAILY_REWARD,
      });
    }
    return;
  }

  const doc = snap.docs[0];
  const current = doc.data().dailyReward;
  console.log("app_settings dailyReward before:", JSON.stringify(current));
  console.log("app_settings dailyReward after:", JSON.stringify(FLAT_DAILY_REWARD));
  if (APPLY) {
    await doc.ref.update({ dailyReward: FLAT_DAILY_REWARD });
  }
}

async function wipeUnclaimed() {
  const users = await db.collection(USERS).get();
  let unclaimed = 0;
  let claimedKept = 0;
  const toDelete = [];

  for (const userDoc of users.docs) {
    const rewards = await userDoc.ref.collection(USER_DAILY_REWARD).get();
    for (const rewardDoc of rewards.docs) {
      const data = rewardDoc.data();
      if (data.claimedAt == null) {
        unclaimed += 1;
        toDelete.push(rewardDoc.ref);
      } else {
        claimedKept += 1;
      }
    }
  }

  console.log(`users scanned: ${users.size}`);
  console.log(`unclaimed to delete: ${unclaimed}`);
  console.log(`claimed kept: ${claimedKept}`);

  if (APPLY && toDelete.length) {
    await commitDeletes(toDelete);
    console.log(`deleted ${toDelete.length} unclaimed docs`);
  }
}

async function main() {
  console.log(APPLY ? "MODE: apply" : "MODE: dry-run (pass --apply to write)");
  if (!process.env.FIRESTORE_EMULATOR_HOST && APPLY) {
    console.error(
      "Refusing --apply without FIRESTORE_EMULATOR_HOST. Point at emulator or set host explicitly for a deliberate non-emulator run.",
    );
    process.exit(1);
  }

  await updateAppSetting();
  await wipeUnclaimed();
  console.log("done");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
