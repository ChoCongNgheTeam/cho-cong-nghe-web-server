import * as Apple from "./apple";
import * as Samsung from "./samsung";
import * as OPPO from "./oppo";
import * as Xiaomi from "./xiaomi";
import * as AirConditioner from "./air-conditioner";
import * as EarPods from "./earpod";

export const allProducts = [
  // --- Apple ---

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

  // Samsung
  Samsung.galaxyZFold7,
  Samsung.galaxyZFlip7,
  Samsung.galaxyA56,
  Samsung.galaxyA36,
  Samsung.galaxyS25Ultra,
  Samsung.galaxyS25,
  Samsung.galaxyS25Plus,
  Samsung.galaxyS25FE,
  Samsung.galaxyA26,
  Samsung.galaxyZFold6,
  Samsung.galaxyS24FE,
  Samsung.galaxyS25Edge,
  Samsung.galaxyS24Ultra,

  // OPPO Reno Series
  OPPO.oppoReno15_5G,
  OPPO.oppoReno15F_5G,
  OPPO.oppoReno14_5G,
  OPPO.oppoReno14F_5G,
  OPPO.oppoReno13F_12GB,
  OPPO.oppoReno12F_5G,
  OPPO.oppoReno11F_5G,

  // OPPO A Series
  OPPO.oppoA6Pro,
  OPPO.oppoA5iPro,
  OPPO.oppoA6T_6GB,
  OPPO.oppoA6T_4GB,
  OPPO.oppoA5i_6GB,
  OPPO.oppoA5i_4GB,
  OPPO.oppoA3_8GB,
  OPPO.oppoA3_6GB,
  OPPO.oppoA58_8GB,
  OPPO.oppoA58_6GB,
  OPPO.oppoA18,

  // OPPO Find Series
  OPPO.oppoFindX9Pro,
  OPPO.oppoFindX9_16GB,
  OPPO.oppoFindX9_12GB,
  OPPO.oppoFindN5,
  OPPO.oppoFindN3,

  // Xiaomi Poco
  Xiaomi.pocoF8Pro,
  Xiaomi.pocoX7,
  Xiaomi.pocoM7Pro,
  Xiaomi.pocoM6Pro,
  Xiaomi.pocoC71,

  Xiaomi.redmiNote15Pro_5G,
  Xiaomi.redmiNote15_5G,
  Xiaomi.redmiNote15_6GB,
  Xiaomi.redmiNote14ProPlus,
  Xiaomi.redmiNote14_5G_8GB,
  Xiaomi.redmiNote14_6GB,

  Xiaomi.redmi15_5G,
  Xiaomi.redmi14C,
  Xiaomi.redmi13X,

  // MacBook Air 13 inch
  Apple.macbookAir13M4_256,
  Apple.macbookAir13M2_2024,
  Apple.macbookAir13M4_512_16,
  Apple.macbookAir13M4_512_24,

  // MacBook Air 15 inch
  Apple.macbookAir15M4_512,
  Apple.macbookAir15M4_256,
  Apple.macbookAir15M2_2023,

  // MacBook Pro 14 inch (M3 & M4 Series)
  Apple.macbookPro14M4Pro_512,
  Apple.macbookPro14M4Pro_1TB,
  Apple.macbookPro14M3Pro_1TB,
  Apple.macbookPro14M4Max_1TB,

  // MacBook Pro 14 inch (M5 Series - 2025)
  Apple.macbookPro14M5_16_512,
  Apple.macbookPro14M5_24_512,

  // MacBook Pro 16 inch
  Apple.macbookPro16M4Pro_24_512,
  Apple.macbookPro16M4Pro_48_512,
  Apple.macbookPro16M4Max_36_1TB,
  Apple.macbookPro16M4Max_48_1TB,

  // --- Air Conditioner ---
  AirConditioner.comfeeInverter15_CFS13,
  AirConditioner.casperInverter15_GC12IB36,
  AirConditioner.casperInverter1_TC09IS35,
  AirConditioner.casperInverter15_GC12IS35,

  // --- EarPods ---
  EarPods.appleEarPodsUSBC,
  EarPods.appleEarPodsLightning_MW,
  EarPods.appleEarPodsLightning_MM,
  EarPods.appleAirPodsPro3,
] as const;
