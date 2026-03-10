import * as Apple from "./apple";
import * as Samsung from "./samsung";
import * as OPPO from "./oppo";
import * as Xiaomi from "./xiaomi";
import * as AirConditioner from "./air-conditioner";
import * as EarPods from "./earpod";

export const allProducts = [
  // ================================================================
  // APPLE
  // ================================================================

  // iPhone
  Apple.iphone13,
  Apple.iphone14,
  Apple.iphone15,
  Apple.iphone16,
  Apple.iphone16Plus,
  Apple.iphone16ProMax,
  Apple.iphone17,
  Apple.iphone17Pro,
  Apple.iphone17ProMax,

  // MacBook Air 13 inch
  Apple.macbookAir13M4,
  Apple.macbookAir13M2,

  // MacBook Air 15 inch
  Apple.macbookAir15M4,
  Apple.macbookAir15M2,

  // MacBook Pro 14 inch
  Apple.macbookPro14M4Pro,
  Apple.macbookPro14M3Pro,
  Apple.macbookPro14M4Max,
  Apple.macbookPro14M5,

  // MacBook Pro 16 inch
  Apple.macbookPro16M4Pro,
  Apple.macbookPro16M4Max,

  // EarPods & AirPods
  EarPods.appleEarPodsUSBC,
  EarPods.appleEarPodsLightning_MW,
  EarPods.appleEarPodsLightning_MM,
  EarPods.appleAirPodsPro3,

  // ================================================================
  // SAMSUNG
  // ================================================================

  // Galaxy AI (S series, Z series, A26/36/56)
  Samsung.galaxyS25Ultra,
  Samsung.galaxyS25Plus,
  Samsung.galaxyS25,
  Samsung.galaxyS25Edge,
  Samsung.galaxyS25FE,
  Samsung.galaxyS24Ultra,
  Samsung.galaxyS24FE,
  Samsung.galaxyZFold7,
  Samsung.galaxyZFold6,
  Samsung.galaxyZFlip7,
  Samsung.galaxyA56,
  Samsung.galaxyA36,
  Samsung.galaxyA26,

  // Galaxy A Series (phổ thông)
  Samsung.galaxyA17_5G,
  Samsung.galaxyA17,
  Samsung.galaxyA16_5G,
  Samsung.galaxyA16,
  Samsung.galaxyA07_5G,
  Samsung.galaxyA07,
  Samsung.galaxyA06_5G,
  Samsung.galaxyA06,

  // Galaxy M Series
  Samsung.galaxyM55,

  // Galaxy XCover
  Samsung.galaxyXCover7Pro,

  // ================================================================
  // OPPO
  // ================================================================

  // Reno Series
  OPPO.oppoReno15_5G,
  OPPO.oppoReno15F_5G,
  OPPO.oppoReno14_5G,
  OPPO.oppoReno14F_5G,
  OPPO.oppoReno13F_5G,
  OPPO.oppoReno12F_5G,
  OPPO.oppoReno11F_5G,

  // A Series (gộp model)
  OPPO.oppoA6Pro,
  OPPO.oppoA5iPro,
  OPPO.oppoA6T,
  OPPO.oppoA5i,
  OPPO.oppoA3,
  OPPO.oppoA58,
  OPPO.oppoA18,

  // Find Series
  OPPO.oppoFindX9Pro,
  OPPO.oppoFindX9,
  OPPO.oppoFindN5,
  OPPO.oppoFindN3,

  // ================================================================
  // XIAOMI
  // ================================================================

  // Xiaomi Series (Flagship)
  Xiaomi.xiaomi15Ultra,
  Xiaomi.xiaomi15,
  Xiaomi.xiaomi15TPro,
  Xiaomi.xiaomi15T,

  // Poco Series
  Xiaomi.pocoF8Pro,
  Xiaomi.pocoX7,
  Xiaomi.pocoM7Pro,
  Xiaomi.pocoM6Pro,
  Xiaomi.pocoC71,

  // Redmi Note Series
  Xiaomi.redmiNote15Pro_5G,
  Xiaomi.redmiNote15Pro,
  Xiaomi.redmiNote15_5G,
  Xiaomi.redmiNote15,
  Xiaomi.redmiNote14ProPlus,
  Xiaomi.redmiNote14_5G,
  Xiaomi.redmiNote14,

  // Redmi Series
  Xiaomi.redmi15_5G,
  Xiaomi.redmi14C,
  Xiaomi.redmi13X,

  // ================================================================
  // AIR CONDITIONER
  // ================================================================
  AirConditioner.comfeeInverter15_CFS13,
  AirConditioner.casperInverter15_GC12IB36,
  AirConditioner.casperInverter1_TC09IS35,
  AirConditioner.casperInverter15_GC12IS35,
] as const;
