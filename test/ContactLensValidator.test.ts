// File: ContactLensValidator.test.ts
import { ContactLensValidator } from '../src/ContactLensValidator';

describe('ContactLensValidator', () => {
  let validator: ContactLensValidator;

  beforeEach(() => {
    validator = new ContactLensValidator();
  });

  // 1. اختبار الدوال الحسابية الأساسية
  describe('Core Math Calculations', () => {
    // Spherical Equivalent (المكافئ الكروي)
    test('sphericalEquivalent should correctly calculate SE', () => {
      // SPH: -5.00, CYL: -1.00 => SE: -5.00 + (-1.00/2) = -5.50
      expect(validator.sphericalEquivalent(-5.00, -1.00)).toBeCloseTo(-5.50);
      // SPH: +2.00, CYL: +1.50 => SE: +2.00 + (1.50/2) = +2.75
      expect(validator.sphericalEquivalent(2.00, 1.50)).toBeCloseTo(2.75);
    });

    // Vertex Distance Compensation (تعويض مسافة قمة الرأس)
    test('sphericWithoutVertexDistance should compensate high powers (BV=12mm)', () => {
      // Dg = -8.00, d = 0.012m => Dc = -8 / (1 - 0.012 * -8) = -8 / 1.096 ≈ -7.30
      expect(validator.sphericWithoutVertexDistance(-8.00, 12)).toBeCloseTo(-7.30, 2);
      // Dg = +6.00, d = 0.012m => Dc = 6 / (1 - 0.012 * 6) = 6 / 0.928 ≈ +6.47
      expect(validator.sphericWithoutVertexDistance(6.00, 12)).toBeCloseTo(6.47, 2);
      // القوة المنخفضة (لا يوجد فرق كبير)
      expect(validator.sphericWithoutVertexDistance(-2.00, 12)).toBeCloseTo(-1.95, 2);
    });

    // Rounding (التقريب لأقرب 0.25)
    test('roundToNearestQuarter should round correctly', () => {
      // expect(validator.roundToNearestQuarter(5.37)).toBe(5.50);
      expect(validator.roundToNearestQuarter(5.12)).toBe(5.00);
      expect(validator.roundToNearestQuarter(-1.60)).toBe(-1.50);
      expect(validator.roundToNearestQuarter(-1.63)).toBe(-1.75);
    });
  });

  // 2. اختبار تحويل العدسات الكروية (Spheric Conversion)
  describe('convertToSpheric', () => {
    test('should apply SE and BV compensation and round (High Power)', () => {
      // نظارة: SPH -7.00, CY -1.00 (SE: -7.50), BV 12mm
      const data = { SPH: -7.00, CY: -1.00, AX: 90, BV: 12 };
      // SE adjusted (Dc) ≈ -6.88
      // Rounded to nearest 0.25 => -07.00
      const result = validator.convertToSpheric(data);
      expect(result.SPH).toBe('-07.00');
      expect(result['Exact SPH']).toBe('-06.88'); // يجب أن يكون هناك تنسيق للعلامة '-' هنا
    });

    test('should only round if power is low (No BV compensation)', () => {
      // نظارة: SPH -3.10, CY -0.20 (SE: -3.20), BV 12mm
      const data = { SPH: -3.10, CY: -0.20, AX: 90, BV: 12 };
      // SE: -3.20 (أقل من 4، لا تعويض BV)، Rounded => -3.25
      const result = validator.convertToSpheric(data);
      expect(result.SPH).toBe('-03.25');
    });

    test('should handle positive powers correctly', () => {
      const data = { SPH: 5.00, CY: 0.50, AX: 0, BV: 10 }; // SE: 5.25
      // Dc = 5.25 / (1 - 0.010 * 5.25) ≈ 5.54
      // Rounded => 5.50
      const result = validator.convertToSpheric(data);
      expect(result.SPH).toBe('+05.50');
      expect(result['Exact SPH']).toBe('+05.54');
    });
  });

  // 3. اختبار تحويل العدسات التوريكية (Toric Conversion)
  describe('convertToToric', () => {
    test('should apply BV compensation to both SPH and CYL (principal meridians)', () => {
      // نظارة: SPH -5.00, CY -1.00, AX 90, BV 12mm
      const data = { SPH: -5.00, CY: -1.00, AX: 90, BV: 12 };

      // 1. SPH (90 درجة): -5.00 => Dc_sph ≈ -4.717 (Rounded -4.75)
      // 2. CYL (0 درجة) : SPH+CYL = -6.00 => Dc_cyl_meridien ≈ -5.679
      // 3. CYL الجديد = -5.679 - (-4.717) ≈ -0.962 (Rounded -1.00)
      const result = validator.convertToToric(data);

      expect(result.SPH).toBe('-04.75');
      expect(result.CY).toBe('-01.00'); // -00.75 أو -01.00 حسب التقريب
      expect(result.AX).toBe('90');
    });

    test('should handle positive CYL in conversion', () => {
      // نظارة: SPH -4.00, CY +2.00, AX 180, BV 12mm
      const data = { SPH: -4.00, CY: 2.00, AX: 180, BV: 12 };

      // SPH (180): -4.00 => Dc_sph ≈ -3.81 (Rounded -3.75)
      // CYL (90): SPH+CYL = -2.00 => Dc_cyl_meridien ≈ -1.95 (Rounded -2.00)
      // CYL الجديد = -1.95 - (-3.81) = +1.86 (Rounded +1.75)
      const result = validator.convertToToric(data);
      
      expect(result.SPH).toBe('-03.75');
      expect(result.CY).toBe('+01.75');
      expect(result.AX).toBe('180');
    });
  });
});