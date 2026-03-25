import * as Apple from "./apple";
import * as Samsung from "./samsung";
import * as OPPO from "./oppo";
import * as Xiaomi from "./xiaomi";
import * as AirConditioner from "./air-conditioner";
import * as EarPods from "./earpod";
import * as Lenovo from "./lenovo";
import * as Dell from "./dell";
import * as Asus from "./asus";
import * as Acer from "./acer";
import * as HP from "./hp";
import * as Tivi from "./tv";
import * as MayLanh from "./may-lanh";
import * as TuLanh from "./tu-lanh";
import * as MayGiat from "./may-giat";
import * as MaySay from "./may-say";
import * as TuDong from "./tu-dong";
import * as Audio from "./audio";
import * as Gaming from "./gaming";
import * as Accessories from "./accessories";
import * as ComputerAcc from "./computer-acc";

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
  Apple.macbookAir13M2,
  Apple.macbookAir13M3,
  Apple.macbookAir13M5,

  // MacBook Air 15 inch
  Apple.macbookAir15M3,
  Apple.macbookAir15M5,

  // MacBook Pro 14 inch
  Apple.macbookPro14M4,
  Apple.macbookPro14M4Pro,
  Apple.macbookPro14M4Max,
  Apple.macbookPro14M5Pro,
  Apple.macbookPro14M5Max,

  // MacBook Pro 16 inch
  Apple.macbookPro16M4Pro,
  Apple.macbookPro16M4Max,
  Apple.macbookPro16M5Pro,
  Apple.macbookPro16M5Max,

  // MacBook Pro 16 inch
  Apple.macbookPro16M4Pro,
  Apple.macbookPro16M4Max,

  // Lenovo
  Lenovo.lenovoLOQ15IAX9E,
  Lenovo.lenovoLOQ15IRP9,
  Lenovo.lenovoIdeaPad1_15AMN7,
  Lenovo.lenovoIdeaPadSlim3_15IAU7,
  Lenovo.lenovoIdeaPadSlim5_14IML9,
  Lenovo.lenovoLegion5_16IRX9,
  Lenovo.lenovoLegionSlim5_16APH8,
  Lenovo.lenovoLegionPro7_16IRX9H,
  Lenovo.lenovoThinkBook14G6,
  Lenovo.lenovoThinkBook16G6,
  Lenovo.lenovoThinkPadE14Gen5,
  Lenovo.lenovoThinkPadL13Gen4,
  Lenovo.lenovoThinkPadX1CarbonGen12,
  Lenovo.lenovoV15G4,
  Lenovo.lenovoYoga7_14ITP8,
  Lenovo.lenovoYogaSlim7_14IMH9,
  Lenovo.lenovoYogaBook9,

  // Dell
  Dell.dellXps13_9340,
  Dell.dellXps14_9440,
  Dell.dellInspiron14_5440,
  Dell.dellInspiron16_5640,
  Dell.dellLatitude3440,
  Dell.dellLatitude7440,
  Dell.dellVostro15_3530,
  Dell.dellPrecision16_5680,

  // Asus
  Asus.asusZenbook14OledUX3405,
  Asus.asusZenbookS13OledUX5304,
  Asus.asusVivobook15X1504,
  Asus.asusVivobookGo14E1404,
  Asus.asusTufGamingA15FA506,
  Asus.asusTufGamingF15FX507,
  Asus.asusRogStrixG16G614,
  Asus.asusRogZephyrusG14GA403,
  Asus.asusV16GamingV161,

  // Acer
  Acer.acerAspire3A315,
  Acer.acerAspire5A515,
  Acer.acerAspire7GamingA715,
  Acer.acerNitro5TigerAn515,
  Acer.acerNitroV15Anv15,
  Acer.acerSwiftGo14Sfg14,
  Acer.acerPredatorHeliosNeo16Phn16,

  // HP
  HP.hp15sFq5111tu,
  HP.hpProbook450G10,
  HP.hpEnvyX36014Fa0045au,
  HP.hpVictus15Fa1139tx,
  HP.hpOmen16Xf0071ax,
  HP.hpOmnibookX14Fe0053au,
  HP.hpOmnibookUltraFlip14,

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

  // Tivi
  Tivi.samsungQled65Q70C,
  Tivi.tclQled4K55C645,
  Tivi.sony4KGoogleTv55X75K,
  Tivi.samsungCrystal4K50AU7700,
  Tivi.xiaomiGoogleTvAPro55,
  Tivi.coocaaGoogleTv70Y72,

  // May Lanh
  MayLanh.daikin1ChieuATF25,
  MayLanh.panasonic1ChieuN9ZKH8,
  MayLanh.daikin2ChieuInverterF25VAVMV,
  MayLanh.panasonic2ChieuInverterYZ9WKH8,
  MayLanh.samsungInverterAR10CYH,
  MayLanh.casperInverterTC09IS33,
  // MayGiat
  MayGiat.lgInverter9kg,
  MayGiat.samsungAiInverter10kg,
  MayGiat.electroluxInverter11kg,
  MayGiat.panasonicInverter85kg,
  MayGiat.toshiba7kg,
  MayGiat.aqua12kg,
  MayGiat.samsungGiatSay14kg,
  MayGiat.lgGiatSay105kg,

  // Tu Lanh
  TuLanh.samsungInverter236L,
  TuLanh.panasonicInverter255L,
  TuLanh.casperMultiDoor430L,
  TuLanh.sharpInverter401L,
  TuLanh.samsungSideBySide648L,
  TuLanh.lgSideBySide635L,

  // May Say
  MaySay.electroluxSayThongHoi8kg,
  MaySay.casperThongHoi7kg,
  MaySay.candyNgungTu9kg,
  MaySay.lgNgungTu8kg,
  MaySay.samsungHeatpump9kg,
  MaySay.lgHeatpump9kg,

  // Tu Dong
  TuDong.sanaky1Ngan100L,
  TuDong.kangaroo1Ngan140L,
  TuDong.sanaky2Ngan280L,
  TuDong.sunhouse2Ngan250L,
  TuDong.alaskaDung210L,
  TuDong.hoaPhatDung106L,

  // Audio
  Audio.appleAirpodsPro2,
  Audio.samsungGalaxyBuds3Pro,
  Audio.sonyIerH500a,
  Audio.sonyWh1000xm5,
  Audio.marshallMajorV,
  Audio.jblCharge5,
  Audio.marshallEmbertonIi,
  Audio.microlabX2,
  Audio.daltonTs12g450x,

  // Gaming
  Gaming.sonyPs5Slim,
  Gaming.nintendoSwitchOled,
  Gaming.logitechGProXSuperlight2,
  Gaming.razerDeathadderV3Pro,
  Gaming.asusRogFalchionRxLowProfile,
  Gaming.corsairK70RgbTkl,
  Gaming.razerBlacksharkV2Pro,
  Gaming.logitechG560Lightsync,

  // Accessories
  Accessories.appleAdapter20W,
  Accessories.appleCapUsbCToLightning1m,
  Accessories.samsungSacDuPhong10000mah25w,
  Accessories.ankerSacDuPhongMagGo10000mah,
  Accessories.appleOpLungIphone15ProMaxMagsafe,
  Accessories.mikingCuongLucIphone15ProMax,
  Accessories.applePencilPro,

  // Computer Accessories
  ComputerAcc.logitechMxMaster3s,
  ComputerAcc.logitechMxKeysS,
  ComputerAcc.baloTargus156,
  ComputerAcc.logitechR500s,
  ComputerAcc.logitechC922Pro,
  ComputerAcc.ankerHub5in1,
  ComputerAcc.hyperworkL01,
  ComputerAcc.logitechDeskMat,
  ComputerAcc.jcpalPhuBanPhim,
] as const;
