// File: EyeTestValidator.test.ts
import { EyeTestValidator } from '../src/EyeTestValidator'; // افترض مسار الملف الصحيح


describe('EyeTestValidator', () => {
  let validator: EyeTestValidator;

  beforeEach(() => {
    validator = new EyeTestValidator();
  });

  // 1. اختبار الدوال المساعدة (Helper Functions)
  describe('Helper Functions', () => {
    test('isMultipleOfQuarter should correctly identify multiples', () => {
      expect(validator.isMultipleOfQuarter(1.00)).toBe(true);
      expect(validator.isMultipleOfQuarter(1.25)).toBe(true);
      expect(validator.isMultipleOfQuarter(0.00)).toBe(true);
      expect(validator.isMultipleOfQuarter(1.30)).toBe(false);
      expect(validator.isMultipleOfQuarter(5.01)).toBe(false);
    });

    test('formatPower should format numbers with sign and padding (+00.00)', () => {
      expect(validator.formatPower(5.25)).toBe('+05.25');
      expect(validator.formatPower(-9.75)).toBe('-09.75');
      expect(validator.formatPower(12.00)).toBe('+12.00');
      expect(validator.formatPower(-0.50)).toBe('-00.50');
      expect(validator.formatPower(0.00)).toBe('+00.00'); // حسب متطلبك
    });
  });

  // 2. اختبار دوال التحقق الفردية
  describe('Individual Validation Functions', () => {
    // SPH
    test('validateSPH should accept valid SPH values', () => {
      expect(validator.validateSPH(-59.75)).toBe('-59.75');
      expect(validator.validateSPH(0.00)).toBe('+00.00');
    });
    test('validateSPH should return null for out-of-range or invalid multiples', () => {
      expect(validator.validateSPH(-60.25)).toBeNull(); // Out of range
      expect(validator.validateSPH(1.30)).toBeNull();    // Not multiple of 0.25
    });

    // CYL
    test('validateCYL should accept valid CYL values', () => {
      expect(validator.validateCYL(-14.75)).toBe('-14.75');
      expect(validator.validateCYL(2.50)).toBe('+02.50');
    });
    test('validateCYL should return null for out-of-range or invalid multiples', () => {
      expect(validator.validateCYL(15.25)).toBeNull(); // Out of range
    });

    // AXIS
    test('validateAxis should accept and round valid Axis values', () => {
      expect(validator.validateAxis(180)).toBe(180);
      expect(validator.validateAxis(5.2)).toBe(5);
    });
    test('validateAxis should return null for out-of-range Axis', () => {
      expect(validator.validateAxis(181)).toBeNull();
      expect(validator.validateAxis(-1)).toBeNull();
    });

    // PD (Pupillary Distance)
    test('validatePD should accept valid PD values', () => {
      expect(validator.validatePD(19)).toBe(19);
      expect(validator.validatePD(85)).toBe(85);
    });
    test('validatePD should return null for out-of-range PD', () => {
      expect(validator.validatePD(18)).toBeNull();
      expect(validator.validatePD(86)).toBeNull();
    });
  });

  // 3. اختبار دالة التحويل (Transposition)
  describe('Transposition (transformSphCylAxis)', () => {
    test('should correctly convert a plus cylinder to minus cylinder', () => {
      const result = validator.transformSphCylAxis(-2.00, 1.00, 90);
      expect(result).toEqual({
        sph: '-01.00', // -2.00 + 1.00
        cyl: '-01.00', // -|1.00|
        axis: 180, // 90 + 90
      });
    });

    test('should correctly convert a minus cylinder to minus cylinder', () => {
      const result = validator.transformSphCylAxis(-5.00, -2.50, 5);
      expect(result).toBeNull();
    });

    test('should return null if CYL is 0', () => {
      expect(validator.transformSphCylAxis(-5.00, 0.00, 90)).toBeNull();
    });
  });

  // 4. اختبار التحقق الشامل (validatePrescription)
  describe('validatePrescription', () => {
    test('should return valid true for a complete and correct prescription', () => {
      const data = { sphere: -3.5, cylinder: 1.0, axis: 10, add: 2.0, pd: 60 };
      const result = validator.validatePrescription(data);
      expect(result.valid).toBe(true);
      expect(result.formatted.sphere).toBe('-03.50');
      expect(result.formatted.cylinder).toBe('+01.00');
      expect(result.formatted.axis).toBe(10);
    });

    test('should return valid false for invalid CYL/AXIS combo', () => {
      const data = { sphere: -3.5, cylinder: 1.0, axis: null }; // CYL but no AXIS
      const result = validator.validatePrescription(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("CYL and AXIS must be entered together, or both left empty.");
    });

    test('should allow SPH only (no CYL/AXIS)', () => {
      const data = { sphere: -3.5, cylinder: null, axis: null };
      const result = validator.validatePrescription(data);
      expect(result.valid).toBe(true);
      expect(result.formatted.sphere).toBe('-03.50');
    });

    test('should return valid false for out-of-range value', () => {
      const data = { sphere: 80.0, cylinder: 1.0, axis: 10 }; // SPH out of range
      const result = validator.validatePrescription(data);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("SPH must be multiple of 0.25 and between -60.00 and +60.00.");
    });
  });
});