import DICTIONARY from "../../dictionary.js";
import utils from "../../lib/utils.js";
import DDBHelper from "../../lib/DDBHelper.js";
import { isArmored } from "./ac.js";

export function getSpeed(data) {
  // For all processing, we take into account the regular movement types of this character
  let movementTypes = {};
  let setToWalking = {};
  for (let type in data.character.race.weightSpeeds.normal) {
    // if (data.character.race.weightSpeeds.normal[type] !== 0) {
    movementTypes[type] = data.character.race.weightSpeeds.normal[type];
    setToWalking[type] = false;
    // }
  }


  // get bonus speed mods
  let restriction = ["", null, "unless your speed is already higher"];
  // Check for equipped Heavy Armor
  const wearingHeavy = data.character.inventory.some((item) => item.equipped && item.definition.type === "Heavy Armor");
  // Accounts for Barbarian Class Feature - Fast Movement
  if (!wearingHeavy) restriction.push("while you aren’t wearing heavy armor");

  // build base speeds
  for (let type in movementTypes) {
    // is there a 'inntate-speed-[type]ing' race/class modifier?
    const innateType = DICTIONARY.character.speeds.find((s) => s.type === type).innate;
    let innateSpeeds = data.character.modifiers.race.filter(
      (modifier) => modifier.type === "set" && modifier.subType === `innate-speed-${innateType}`
    );
    let base = movementTypes[type];

    innateSpeeds.forEach((speed) => {
      // take the highest value
      if (speed.value === null && speed.modifierSubTypeId == 182 && speed.modifierTypeId == 9) {
        setToWalking[type] = true;
      } else if (speed.value > base) {
        base = speed.value;
      }
    });

    // overwrite the (perhaps) changed value
    movementTypes[type] = base;
  }

  const bonusSpeed = DDBHelper
    .filterBaseModifiers(data, "bonus", "speed", restriction)
    .reduce((speed, feat) => speed + feat.value, 0);

  // speed bonuses
  for (let type in movementTypes) {
    let innateBonus = DDBHelper
      .filterBaseModifiers(data, "bonus", `speed-${type}ing`, restriction)
      .reduce((speed, feat) => speed + feat.value, 0);

    // overwrite the (perhaps) changed value
    if (movementTypes[type] !== 0) movementTypes[type] += bonusSpeed + innateBonus;
  }

  // unarmored movement for barbarians and monks
  if (!isArmored(data)) {
    DDBHelper.getChosenClassModifiers(data)
      .filter((modifier) => modifier.type === "bonus" && modifier.subType === "unarmored-movement")
      .forEach((bonusSpeed) => {
        for (let type in movementTypes) {
          if (movementTypes[type] !== 0) movementTypes[type] += bonusSpeed.value;
        }
      });
  }

  // new ranger deft explorer sets speeds, leaves value null, use walking
  for (let type in movementTypes) {
    const innateType = DICTIONARY.character.speeds.find((s) => s.type === type).innate;
    // is there a 'inntate-speed-[type]ing' race/class modifier?
    let innateSpeeds = DDBHelper
      .filterBaseModifiers(data, "set", `innate-speed-${innateType}`, restriction);
    let base = movementTypes[type];

    innateSpeeds.forEach((speed) => {
      // take the highest value
      if (speed.value > base) {
        base = speed.value;
      } else if (!speed.value && movementTypes['walk']) {
        base = movementTypes['walk'];
      }
    });

    // overwrite the (perhaps) changed value
    movementTypes[type] = base;
  }


  // is there a custom seed over-ride?
  if (data.character.customSpeeds) {
    data.character.customSpeeds.forEach((speed) => {
      const type = DICTIONARY.character.speeds.find((s) => s.id === speed.movementId).type;
      if (speed.distance) {
        movementTypes[type] = speed.distance;
      }
    });
  }

  let special = "";
  for (let type in movementTypes) {
    if (type !== "walk") {
      special += utils.capitalize(type) + " " + movementTypes[type] + " ft, ";
    }
  }
  special = special.substr(0, special.length - 2);

  for (let type in setToWalking) {
    if (setToWalking[type] && movementTypes["walk"] > movementTypes[type]) {
      movementTypes[type] = movementTypes["walk"];
    }
  }

  const movement = {
    burrow: movementTypes['burrow'] || 0,
    climb: movementTypes['climb'] || 0,
    fly: movementTypes['fly'] || 0,
    swim: movementTypes['swim'] || 0,
    walk: movementTypes['walk'] || 0,
    units: "ft",
    hover: false,
  };

  return {
    speed: {
      value: movementTypes.walk + " ft",
      special: special,
    },
    movement: movement,
  };
}
