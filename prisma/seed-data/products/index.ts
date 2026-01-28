import * as Apple from "./apple";
import * as Samsung from "./samsung";
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
